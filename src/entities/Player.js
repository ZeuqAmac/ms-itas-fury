// ============================================================
//  Player — Ita Ita (sprite pixel-art animado)
// ============================================================

const ITA_SCALE = 2.2;
const TANK_SCALE = 2.5;

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Skin a pie según el personaje elegido (Ita o La Choco).
    const skin = (GAME_STATE.character === 'choco') ? 'choco' : 'ita';
    super(scene, x, y, skin + '_idle0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.skin = skin;            // prefijo de texturas/anims a pie
    this.setScale(ITA_SCALE);
    this.setDepth(10);
    this.setCollideWorldBounds(true);

    // Cuerpo limpio (el sprite ya no tiene fondo)
    this.body.setSize(14, 45);
    this.body.setOffset(10, 4);

    this.dir = 1;
    this.hp = 100;
    this.maxHp = 100;
    this.weapon = 'escuadra';
    this.ammo = {};
    this.grenades = 3;
    this.lastShot = 0;
    this.lastMelee = 0;          // cooldown del cuchillazo
    this.lastCannon = 0;         // cooldown del cañonazo del tanque
    this.meleeRange = 70;        // distancia para apuñalar en vez de disparar
    this.invuln = false;
    this.wasOnGround = true;
    this.runDustAt = 0;

    // --- Esquive (rodada con i-frames) ---
    this.dodging = false;
    this.dodgeEnd = 0;
    this.dodgeReadyAt = 0;
    this._downPrev = false;

    // --- Vehículo (tanque) ---
    this.mode = 'foot';          // 'foot' | 'tank'
    this.shield = 0;             // blindaje del tanque
    this.maxShield = 0;

    this.play(this.skin + '-idle');

    // Flecha que muestra hacia dónde apuntas (aparece al apuntar arriba/diagonal)
    this.aimMark = scene.add.image(x, y, 'aim_arrow').setDepth(11).setVisible(false);

    // Arranque montado en el tanque si así se eligió en la selección
    if (GAME_STATE.character === 'tanque') this.enterTank(true);
  }

  // ---------- Tanque ----------
  enterTank(silent) {
    if (this.mode === 'tank' || !this.active) return;
    this.mode = 'tank';
    this.prevWeapon = (this.weapon !== 'canon') ? this.weapon : 'escuadra';
    this.weapon = 'canon';
    this.maxShield = 240; this.shield = 240;

    this.setTexture('tank_body0');
    this.setScale(TANK_SCALE);
    this.body.setSize(60, 32);
    this.body.setOffset(7, 14);
    this.play('tank-roll');
    this.y -= 8;                 // evita quedar incrustado en el suelo

    this.invuln = true;
    this.scene.time.delayedCall(700, () => { this.invuln = false; });
    if (!silent) {
      this.scene.boom(this.x, this.y, 1.2);
      this.scene.banner('¡AL TANQUE, COMPA!', '#ffd24a');
    }
  }

  exitTank(silent) {
    if (this.mode !== 'tank') return;
    this.mode = 'foot';
    this.shield = 0; this.maxShield = 0;
    this.weapon = this.prevWeapon || 'escuadra';

    this.setTexture(this.skin + '_idle0');
    this.setScale(ITA_SCALE);
    this.body.setSize(14, 45);
    this.body.setOffset(10, 4);
    this.play(this.skin + '-idle');

    this.invuln = true;
    this.scene.time.delayedCall(1100, () => { this.invuln = false; });
    this.scene.tweens.add({
      targets: this, alpha: 0.3, yoyo: true, repeat: 7, duration: 70,
      onComplete: () => this.setAlpha(1),
    });
    if (!silent) {
      this.scene.boom(this.x, this.y, 1.7);
      this.scene.banner('¡EL TANQUE EXPLOTÓ!', '#ff6666');
    }
  }

  update(time) {
    if (!this.active) return;
    if (this.aimMark) this.aimMark.setVisible(false);   // oculto por defecto
    if (this.mode === 'tank') return this.updateTank(time);
    if (this.dodging) return this.updateDodge(time);
    const scene = this.scene;

    let vx = 0;
    if (scene.btnLeft())  { vx = -CONST.PLAYER_SPEED; this.dir = -1; }
    else if (scene.btnRight()) { vx = CONST.PLAYER_SPEED; this.dir = 1; }
    this.setVelocityX(vx);
    this.setFlipX(this.dir < 0);

    const onGround = this.body.blocked.down || this.body.touching.down;
    this.onGround = onGround;
    if (scene.btnJumpJust() && onGround) {
      this.setVelocityY(-CONST.PLAYER_JUMP);
      this.stretch();
      SFX.play('jump');
    }

    // animación según estado
    if (!onGround) this.anims.play(this.skin + '-jump', true);
    else if (vx !== 0) this.anims.play(this.skin + '-run', true);
    else this.anims.play(this.skin + '-idle', true);

    // aterrizaje -> polvo + squash
    if (onGround && !this.wasOnGround) {
      scene.spawnDust(this.x, this.y + 52, 3);
      this.squash();
    }
    // polvo al correr
    if (onGround && vx !== 0 && time > this.runDustAt) {
      this.runDustAt = time + 220;
      scene.spawnDust(this.x - this.dir * 14, this.y + 52, 1);
    }
    this.wasOnGround = onGround;

    // Esquivar: al presionar ABAJO en el piso, el personaje rueda con
    // invulnerabilidad breve (en el aire, abajo apunta hacia abajo).
    const down = scene.aimDown();
    const dodgeJust = down && !this._downPrev;
    this._downPrev = down;
    if (onGround && dodgeJust && time >= this.dodgeReadyAt) {
      return this.startDodge(time);
    }

    // Indicador de puntería (muestra la dirección al apuntar arriba/diagonal/abajo)
    this.updateAimMark();

    // Botón de tiro: si hay un enemigo a quemarropa, da un cuchillazo
    // (estilo Metal Slug); si no, dispara el arma equipada.
    if (scene.btnShoot()) {
      if (!this.tryMelee(time)) this.tryShoot(time);
    }
    if (scene.btnGrenadeJust()) this.throwGrenade();
  }

  // Muestra la flecha de puntería cuando apuntas en vertical/diagonal.
  updateAimMark() {
    if (!this.aimMark) return;
    const sc = this.scene;
    const up = sc.aimUp(), down = sc.aimDown();
    const showVert = up || (down && !this.onGround);   // arriba siempre; abajo sólo en el aire
    if (!showVert) { this.aimMark.setVisible(false); return; }
    const ang = this.aimAngle();
    const r = 44;
    this.aimMark.setVisible(true)
      .setPosition(this.x + Math.cos(ang) * r, (this.y - 6) + Math.sin(ang) * r)
      .setRotation(ang);
  }

  // Inicia la rodada de esquive (i-frames + impulso horizontal + giro).
  startDodge(time) {
    this.dodging = true;
    this.dodgeEnd = time + 340;
    this.dodgeReadyAt = time + 340 + 380;     // cooldown tras esquivar
    this.invuln = true;
    this.setVelocityX(this.dir * 440);
    this.anims.play(this.skin + '-run', true);
    this.scene.spawnDust(this.x - this.dir * 14, this.y + 52, 4);
    this.scene.dodgeFx(this);
    // barrel roll
    this.scene.tweens.add({
      targets: this, rotation: this.dir * Math.PI * 2, duration: 340,
      onComplete: () => this.setRotation(0),
    });
    SFX.play('roll');
  }

  // Mantiene el impulso de la rodada hasta que termina.
  updateDodge(time) {
    this.setVelocityX(this.dir * 440);
    this.setFlipX(this.dir < 0);
    if (time >= this.dodgeEnd) {
      this.dodging = false;
      this.setRotation(0);
      // breve gracia al salir de la rodada
      this.scene.time.delayedCall(140, () => {
        if (this.active && !this.dodging) this.invuln = false;
      });
    }
  }

  // Movimiento del tanque: más lento, salto cortito, orugas que ruedan.
  updateTank(time) {
    const scene = this.scene;
    let vx = 0;
    if (scene.btnLeft())  { vx = -CONST.PLAYER_SPEED * 0.7; this.dir = -1; }
    else if (scene.btnRight()) { vx = CONST.PLAYER_SPEED * 0.7; this.dir = 1; }
    this.setVelocityX(vx);
    this.setFlipX(this.dir < 0);

    const onGround = this.body.blocked.down || this.body.touching.down;
    this.onGround = onGround;
    if (scene.btnJumpJust() && onGround) {
      this.setVelocityY(-CONST.PLAYER_JUMP * 0.6);
      SFX.play('jump');
    }

    // Orugas: ruedan al moverse, quietas al parar.
    if (!this.anims.isPlaying) this.anims.play('tank-roll', true);
    if (vx === 0) this.anims.pause();
    else if (this.anims.isPaused) this.anims.resume();

    if (onGround && vx !== 0 && time > this.runDustAt) {
      this.runDustAt = time + 160;
      scene.spawnDust(this.x - this.dir * 30, this.y + 52, 2);
    }

    if (scene.btnShoot()) this.tryShoot(time);
    // En el tanque el botón de granada lanza un CAÑONAZO demoledor.
    if (scene.btnGrenadeJust()) this.fireCannonBlast(time);
  }

  stretch() {
    this.scene.tweens.add({ targets: this, scaleY: ITA_SCALE * 1.12, scaleX: ITA_SCALE * 0.92, duration: 120, yoyo: true });
  }
  squash() {
    this.scene.tweens.add({ targets: this, scaleY: ITA_SCALE * 0.85, scaleX: ITA_SCALE * 1.12, duration: 90, yoyo: true });
  }

  // Ángulo de disparo (8 direcciones) según stick/cruceta. A pie se puede
  // apuntar arriba, en diagonal y abajo (en el aire). En el tanque el cañón
  // es fijo y horizontal.
  aimAngle() {
    const dir = this.dir;
    if (this.mode === 'tank') return dir > 0 ? 0 : Math.PI;
    const sc = this.scene;
    const ax = sc.btnRight() ? 1 : sc.btnLeft() ? -1 : 0;
    const ay = sc.aimUp() ? -1 : sc.aimDown() ? 1 : 0;
    if (ay === 0) return dir > 0 ? 0 : Math.PI;                 // horizontal
    if (ay > 0 && this.onGround) return dir > 0 ? 0 : Math.PI;  // no dispares al piso
    if (ax === 0) return ay < 0 ? -Math.PI / 2 : Math.PI / 2;   // recto arriba/abajo
    return Math.atan2(ay, ax);                                  // diagonal
  }

  tryShoot(time) {
    let wpn = WEAPONS[this.weapon];
    if (time < this.lastShot + wpn.cooldown) return;
    this.lastShot = time;

    if (this.weapon !== 'escuadra' && (this.ammo[this.weapon] || 0) <= 0) {
      this.weapon = 'escuadra';
      wpn = WEAPONS[this.weapon];
    }

    const tank = this.mode === 'tank';
    const ang0 = this.aimAngle();
    const reach = tank ? 78 : 30;
    const baseY = this.y - (tank ? 4 : 6);
    const gx = this.x + Math.cos(ang0) * reach;
    const gy = baseY + Math.sin(ang0) * reach;

    for (let i = 0; i < wpn.pellets; i++) {
      const spread = wpn.spread ? Phaser.Math.FloatBetween(-wpn.spread, wpn.spread) : 0;
      const ang = ang0 + spread;
      this.scene.spawnPlayerBullet(gx, gy, Math.cos(ang) * wpn.speed, Math.sin(ang) * wpn.speed, wpn);
    }

    // El cañón es ilimitado; las demás armas (salvo escuadra) gastan munición.
    if (this.weapon !== 'escuadra' && this.weapon !== 'canon') {
      this.ammo[this.weapon] -= 1;
      if (this.ammo[this.weapon] <= 0) this.weapon = 'escuadra';
    }

    const fdir = Math.cos(ang0) >= 0 ? 1 : -1;
    this.scene.muzzle(gx, gy, fdir, wpn.color);
    if (!tank) this.scene.spawnCasing(this.x + this.dir * 4, baseY, -this.dir);
    if (tank) this.scene.cameras.main.shake(120, 0.006);
    SFX.play(wpn.explosive ? 'shoot_big' : 'shoot');
  }

  throwGrenade() {
    if (this.grenades <= 0) return;
    this.grenades -= 1;
    this.scene.spawnGrenade(this.x + this.dir * 18, this.y - 10, this.dir);
    SFX.play('throw');
  }

  // Cuchillazo a quemarropa (Ita / La Choco). Si hay un enemigo enfrente y
  // muy cerca, se apuñala en vez de disparar (mismo botón). Devuelve true
  // cuando hay un objetivo a melee (aunque el cooldown impida golpear), para
  // que el jugador no malgaste balas con el enemigo encima.
  tryMelee(time) {
    if (this.mode === 'tank') return false;
    const range = this.meleeRange, dir = this.dir;
    const scene = this.scene;

    let target = null, td = range;
    const enemies = scene.enemies ? scene.enemies.getChildren() : [];
    for (const e of enemies) {
      if (!e.active || e._dying) continue;
      if (Math.abs(e.y - this.y) > 52) continue;
      const dx = e.x - this.x;
      if (dir > 0 ? dx < -14 : dx > 14) continue;   // debe estar al frente
      const ad = Math.abs(dx);
      if (ad <= range && ad < td) { td = ad; target = e; }
    }

    const boss = scene.boss;
    let bossInRange = false;
    if (boss && boss.active && !boss.dead) {
      const dx = boss.x - this.x;
      if (Math.abs(boss.y - this.y) < 80 && Math.abs(dx) <= range + 26 &&
          (dir > 0 ? dx > -24 : dx < 24)) bossInRange = true;
    }

    if (!target && !bossInRange) return false;

    if (time >= this.lastMelee + 300) {
      this.lastMelee = time;
      scene.meleeSlash(this.x + dir * 28, this.y - 4, dir);
      SFX.play('slash');
      if (target) target.hit(100);          // un tajo liquida a un chairo
      if (bossInRange) boss.hit(45);
      // pequeño "punch" de escala (no toca la posición para no pelear con la física)
      this.scene.tweens.add({
        targets: this, scaleX: ITA_SCALE * 1.12, scaleY: ITA_SCALE * 0.94,
        duration: 70, yoyo: true,
      });
    }
    return true;
  }

  // Cañonazo del tanque (botón de granada). Proyectil explosivo pesado.
  fireCannonBlast(time) {
    if (this.mode !== 'tank') return;
    if (time < this.lastCannon + 650) return;
    this.lastCannon = time;
    const dir = this.dir;
    const gx = this.x + dir * 82, gy = this.y - 4;
    const shell = { dmg: 240, speed: 820, color: 0xfff0b0, size: 4, explosive: true };
    this.scene.spawnPlayerBullet(gx, gy, dir * shell.speed, 0, shell);
    this.scene.muzzle(gx, gy, dir, shell.color);
    this.scene.boom(gx + dir * 12, gy, 0.9);
    this.scene.cameras.main.shake(220, 0.012);
    SFX.play('cannon');
  }

  giveWeapon(type) {
    if (!WEAPONS[type] || type === 'escuadra') return;
    this.ammo[type] = (this.ammo[type] || 0) + WEAPONS[type].ammo;
    // En el tanque guardamos el arma para cuando bajemos; no soltamos el cañón.
    if (this.mode === 'tank') { this.prevWeapon = type; return; }
    this.weapon = type;
  }

  heal(n) { this.hp = Math.min(this.maxHp, this.hp + n); }

  takeHit(dmg) {
    if (this.invuln || !this.active) return;

    // En el tanque el daño lo absorbe el blindaje; al agotarse, Ita sale a pie.
    if (this.mode === 'tank') {
      this.shield -= dmg;
      SFX.play('hurt');
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(60, () => { if (this.active) this.clearTint(); });
      this.scene.cameras.main.shake(120, 0.006);
      if (this.shield <= 0) this.exitTank(false);
      return;
    }

    this.hp -= dmg;
    SFX.play('hurt');
    if (this.hp <= 0) { this.hp = 0; this.scene.playerDied(); return; }
    this.invuln = true;
    this.scene.time.delayedCall(900, () => { this.invuln = false; });
    this.scene.tweens.add({
      targets: this, alpha: 0.25, yoyo: true, repeat: 5, duration: 75,
      onComplete: () => this.setAlpha(1),
    });
  }
}

window.Player = Player;
