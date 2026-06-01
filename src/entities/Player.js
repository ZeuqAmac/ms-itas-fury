// ============================================================
//  Player — Ita Ita (sprite pixel-art animado)
// ============================================================

const ITA_SCALE = 2.2;

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ita_idle0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

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
    this.invuln = false;
    this.wasOnGround = true;
    this.runDustAt = 0;

    this.play('ita-idle');
  }

  update(time) {
    if (!this.active) return;
    const scene = this.scene;

    let vx = 0;
    if (scene.btnLeft())  { vx = -CONST.PLAYER_SPEED; this.dir = -1; }
    else if (scene.btnRight()) { vx = CONST.PLAYER_SPEED; this.dir = 1; }
    this.setVelocityX(vx);
    this.setFlipX(this.dir < 0);

    const onGround = this.body.blocked.down || this.body.touching.down;
    if (scene.btnJumpJust() && onGround) {
      this.setVelocityY(-CONST.PLAYER_JUMP);
      this.stretch();
      SFX.play('jump');
    }

    // animación según estado
    if (!onGround) this.anims.play('ita-jump', true);
    else if (vx !== 0) this.anims.play('ita-run', true);
    else this.anims.play('ita-idle', true);

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

    if (scene.btnShoot()) this.tryShoot(time);
    if (scene.btnGrenadeJust()) this.throwGrenade();
  }

  stretch() {
    this.scene.tweens.add({ targets: this, scaleY: ITA_SCALE * 1.12, scaleX: ITA_SCALE * 0.92, duration: 120, yoyo: true });
  }
  squash() {
    this.scene.tweens.add({ targets: this, scaleY: ITA_SCALE * 0.85, scaleX: ITA_SCALE * 1.12, duration: 90, yoyo: true });
  }

  tryShoot(time) {
    let wpn = WEAPONS[this.weapon];
    if (time < this.lastShot + wpn.cooldown) return;
    this.lastShot = time;

    if (this.weapon !== 'escuadra' && (this.ammo[this.weapon] || 0) <= 0) {
      this.weapon = 'escuadra';
      wpn = WEAPONS[this.weapon];
    }

    const dir = this.dir;
    const gx = this.x + dir * 34;
    const gy = this.y - 6;

    for (let i = 0; i < wpn.pellets; i++) {
      const spread = wpn.spread ? Phaser.Math.FloatBetween(-wpn.spread, wpn.spread) : 0;
      const ang = (dir > 0 ? 0 : Math.PI) + spread;
      this.scene.spawnPlayerBullet(gx, gy, Math.cos(ang) * wpn.speed, Math.sin(ang) * wpn.speed, wpn);
    }

    if (this.weapon !== 'escuadra') {
      this.ammo[this.weapon] -= 1;
      if (this.ammo[this.weapon] <= 0) this.weapon = 'escuadra';
    }

    this.scene.muzzle(gx, gy, dir, wpn.color);
    this.scene.spawnCasing(this.x + dir * 4, gy, -dir);
    SFX.play(wpn.explosive ? 'shoot_big' : 'shoot');
  }

  throwGrenade() {
    if (this.grenades <= 0) return;
    this.grenades -= 1;
    this.scene.spawnGrenade(this.x + this.dir * 18, this.y - 10, this.dir);
    SFX.play('throw');
  }

  giveWeapon(type) {
    if (!WEAPONS[type] || type === 'escuadra') return;
    this.ammo[type] = (this.ammo[type] || 0) + WEAPONS[type].ammo;
    this.weapon = type;
  }

  heal(n) { this.hp = Math.min(this.maxHp, this.hp + n); }

  takeHit(dmg) {
    if (this.invuln || !this.active) return;
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
