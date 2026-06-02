// ============================================================
//  GameScene — gameplay principal
// ============================================================

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.levelIndex = GAME_STATE.level;
    this.level = LEVELS[this.levelIndex];
    const W = this.level.width;
    const H = CONST.HEIGHT;

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    // --- Fondo parallax temático (catedral/mercado o jardín) ---
    SceneryArt.buildLevelBackground(this, this.level.theme, W);

    // --- Suelo (en segmentos, con huecos/pozos) ---
    this.floors = this.add.group();
    this.buildGround(W, this.level.gaps || []);

    // --- Plataformas (azoteas / repisas para subir) ---
    this.platforms = this.add.group();
    this.buildPlatforms(this.level.platforms || []);

    // --- Letrero sinaloense al inicio ---
    this.add.text(220, 180, '⟪ ' + this.level.name.toUpperCase() + ' ⟫', {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#2b1a0e',
      backgroundColor: '#ffd24a', padding: { x: 8, y: 4 },
    }).setDepth(1).setRotation(-0.04);

    // --- Grupos ---
    this.playerBullets = this.physics.add.group({ allowGravity: false });
    this.enemyBullets  = this.physics.add.group({ allowGravity: false });
    this.luckyBullets  = this.physics.add.group({ allowGravity: false });
    this.enemies       = this.add.group({ runChildUpdate: true });
    this.pickups       = this.physics.add.staticGroup();
    this.grenades      = this.physics.add.group();

    // --- Jugador ---
    this.player = new Player(this, 150, 300);
    this.physics.add.collider(this.player, this.floors);
    this.physics.add.collider(this.player, this.platforms);

    // --- Peligros (brasas / agua) — requiere que el jugador ya exista ---
    this.buildHazards(this.level.hazards || []);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(180, 120);

    // --- Lucky (aún no activo) ---
    this.lucky = null;

    // --- Enemigos del nivel ---
    this.level.enemies.forEach(e => this.spawnChairo(e.x));
    this.aliveEnemies = this.level.enemies.length;

    // --- Recogibles ---
    this.level.pickups.forEach(p => this.spawnPickup(p.x, p.type, p.y));

    // --- Jefe / Meta ---
    this.bossCfg = this.level.boss || null;
    this.boss = null;
    this.bossSpawned = false;
    this.levelDone = false;
    if (!this.bossCfg) {
      this.goalX = W - 160;
      this.goal = this.physics.add.staticImage(this.goalX, CONST.GROUND_Y - 80, 'goal');
      this.goal.body.setSize(40, 180);
    }

    // --- Colisiones / overlaps ---
    this.physics.add.collider(this.enemies, this.floors);
    this.physics.add.collider(this.grenades, this.floors, (a, b) => {
      this.explodeGrenade(a.body && a.body.immovable ? b : a);
    });
    this.physics.add.collider(this.grenades, this.platforms, (a, b) => {
      this.explodeGrenade(a.body && a.body.immovable ? b : a);
    });

    this.physics.add.overlap(this.playerBullets, this.enemies, this.hitEnemyWithBullet, null, this);
    this.physics.add.overlap(this.luckyBullets, this.enemies, this.hitEnemyWithLucky, null, this);
    this.physics.add.overlap(this.enemyBullets, this.player, this.hitPlayerWithBullet, null, this);
    this.physics.add.overlap(this.enemies, this.player, this.enemyTouchPlayer, null, this);
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);
    if (this.goal) this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

    // --- Controles ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,J,K,Z,SPACE');
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-M', () => this.toggleMute());
    this.touch = { left: false, right: false, shoot: false, jump: false, grenade: false };
    this.buildTouchControls();

    // --- HUD ---
    this.buildHUD();
    this.banner('¡VÁMONOS RECIO!', '#ffd24a');
  }

  // ---------- Helpers de input (teclado + táctil) ----------
  btnLeft()  { return this.cursors.left.isDown || this.wasd.A.isDown || this.touch.left; }
  btnRight() { return this.cursors.right.isDown || this.wasd.D.isDown || this.touch.right; }
  btnShoot() { return this.wasd.J.isDown || this.wasd.Z.isDown || this.touch.shoot; }
  btnJumpJust() {
    if (this.touch.jump) { this.touch.jump = false; return true; }
    return Phaser.Input.Keyboard.JustDown(this.cursors.up)
        || Phaser.Input.Keyboard.JustDown(this.wasd.W)
        || Phaser.Input.Keyboard.JustDown(this.wasd.SPACE);
  }
  btnGrenadeJust() {
    if (this.touch.grenade) { this.touch.grenade = false; return true; }
    return Phaser.Input.Keyboard.JustDown(this.wasd.K);
  }

  // Botones en pantalla (solo en dispositivos táctiles; ?touch en la URL los fuerza)
  buildTouchControls() {
    const force = (window.location.search || '').indexOf('touch') >= 0;
    if (!this.sys.game.device.input.touch && !force) return;

    const D = 3000, W = CONST.WIDTH, H = CONST.HEIGHT, yb = H - 72;
    const mk = (x, y, r, label, fs) => {
      this.add.circle(x, y, r, 0x000000, 0.3).setScrollFactor(0).setDepth(D)
        .setStrokeStyle(3, 0xffd24a, 0.7);
      this.add.text(x, y, label, {
        fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: (fs || 18) + 'px', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
      return this.add.zone(x, y, r * 2.1, r * 2.1).setScrollFactor(0).setDepth(D + 2).setInteractive();
    };
    const hold = (z, set) => {
      z.on('pointerdown', () => set(true));
      z.on('pointerup', () => set(false));
      z.on('pointerout', () => set(false));
      z.on('pointerupoutside', () => set(false));
    };

    hold(mk(72, yb, 42, '◀', 22), v => this.touch.left = v);
    hold(mk(176, yb, 42, '▶', 22), v => this.touch.right = v);
    hold(mk(W - 182, yb + 4, 52, 'TIRO', 16), v => this.touch.shoot = v);
    mk(W - 70, yb, 46, 'SALTO', 13).on('pointerdown', () => { this.touch.jump = true; });
    mk(W - 150, yb - 96, 34, '💣', 22).on('pointerdown', () => { this.touch.grenade = true; });
  }

  // ---------- Spawns ----------
  spawnChairo(x) {
    const c = new Chairo(this, x, CONST.GROUND_Y - 60);
    this.enemies.add(c);
    return c;
  }

  // Suelo en segmentos, dejando huecos (pozos) donde haya gaps.
  buildGround(W, gaps) {
    const gy = CONST.GROUND_Y;
    const tint = this.level.theme === 'jardin' ? 0xc7b27e : 0xffffff;
    const sorted = gaps.slice().sort((a, b) => a.x - b.x);
    let cursor = 0;
    const pieces = [];
    sorted.forEach(g => {
      if (g.x > cursor) pieces.push([cursor, g.x]);
      cursor = Math.max(cursor, g.x + g.w);
    });
    if (cursor < W) pieces.push([cursor, W]);
    pieces.forEach(([x1, x2]) => {
      const w = x2 - x1;
      const ts = this.add.tileSprite(x1, gy, w, 80, 'ground').setOrigin(0, 0).setDepth(0);
      if (tint !== 0xffffff) ts.setTint(tint);
      const body = this.add.rectangle(x1 + w / 2, gy + 40, w, 80);
      this.physics.add.existing(body, true);
      this.floors.add(body);
    });
  }

  // Peligros: franjas de brasas (fuego) o agua que dañan al tocarlas.
  buildHazards(list) {
    this.hazards = this.add.group();
    const gy = CONST.GROUND_Y;
    list.forEach(h => {
      const isWater = h.type === 'water';
      const bodyCol = isWater ? 0x1f6fb0 : 0xd83a14;
      const topCol  = isWater ? 0x6fc0e8 : 0xffb24a;
      this.add.rectangle(h.x + h.w / 2, gy + 18, h.w, 36, bodyCol, 0.82).setDepth(4);
      const shimmer = this.add.rectangle(h.x + h.w / 2, gy + 3, h.w, 7, topCol, 0.95).setDepth(5);
      this.tweens.add({ targets: shimmer, alpha: 0.4, yoyo: true, repeat: -1, duration: 480 });
      const z = this.add.zone(h.x + h.w / 2, gy + 6, h.w, 28);
      this.physics.add.existing(z, true);
      this.hazards.add(z);
    });
    this.physics.add.overlap(this.player, this.hazards, (a, b) => {
      const pl = (a instanceof Player) ? a : b;
      const now = this.time.now;
      if (now < (pl.hazCd || 0)) return;
      pl.hazCd = now + 600;
      pl.takeHit(12);
    });
  }

  // Construye plataformas tipo azotea: muro de soporte + repisa + cuerpo
  // de colisión "one-way" (solo se aterriza desde arriba).
  buildPlatforms(list) {
    list.forEach(pl => {
      const wallH = (CONST.GROUND_Y - pl.y) + 30;
      this.add.tileSprite(pl.x, pl.y + 6, pl.w, wallH, 'wall').setOrigin(0, 0).setDepth(0);
      this.add.tileSprite(pl.x, pl.y, pl.w, 22, 'ledge').setOrigin(0, 0).setDepth(1);
      const body = this.add.rectangle(pl.x + pl.w / 2, pl.y + 11, pl.w, 22);
      this.physics.add.existing(body, true);
      body.body.checkCollision.down = false;
      body.body.checkCollision.left = false;
      body.body.checkCollision.right = false;
      this.platforms.add(body);
    });
  }

  spawnPickup(x, type, y) {
    const py = (y !== undefined) ? y : CONST.GROUND_Y - 70;
    const c = this.pickups.create(x, py, 'crate');
    c.ptype = type;
    c.setDepth(6);

    const styles = {
      cuerno:   { tint: 0xff9933, letra: 'AK', col: '#3a1d00' },
      escopeta: { tint: 0xff5555, letra: 'SG', col: '#3a0000' },
      bazuca:   { tint: 0xdddddd, letra: 'RPG', col: '#222' },
      vida:     { tint: 0x4be36a, letra: '+', col: '#063b12' },
      lucky:    { tint: 0xffc24a, letra: 'LUCKY', col: '#3a2600' },
      tanque:   { tint: 0x9fb45a, letra: 'TANQUE', col: '#1d2608' },
    };
    const st = styles[type] || { tint: 0xffffff, letra: '?', col: '#000' };
    c.setTint(st.tint);
    const fs = st.letra.length > 3 ? '11px' : (st.letra.length > 2 ? '13px' : '18px');
    c.label = this.add.text(x, py, st.letra, {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: fs, color: st.col,
    }).setOrigin(0.5).setDepth(7);

    // flotación
    this.tweens.add({ targets: [c, c.label], y: '-=8', yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });
    return c;
  }

  // ---------- Disparos ----------
  spawnPlayerBullet(x, y, vx, vy, wpn) {
    const b = this.playerBullets.create(x, y, 'bullet');
    b.setTint(wpn.color).setDepth(7);
    b.setScale(wpn.size * 1.3, wpn.size);     // estela (alargada)
    b.setBlendMode(Phaser.BlendModes.ADD);
    b.body.setAllowGravity(false);
    b.setVelocity(vx, vy);
    b.rotation = Math.atan2(vy, vx);
    b.dmg = wpn.dmg;
    b.explosive = !!wpn.explosive;
    this.time.delayedCall(1500, () => { if (b.active) b.destroy(); });
  }

  spawnEnemyBullet(x, y, vx, vy, dmg) {
    const b = this.enemyBullets.create(x, y, 'ebullet');
    b.setDepth(7);
    b.body.setAllowGravity(false);
    b.setVelocity(vx, vy);
    b.dmg = dmg || 12;
    this.time.delayedCall(2500, () => { if (b.active) b.destroy(); });
  }

  spawnLuckyBullet(x, y, vx, vy) {
    const b = this.luckyBullets.create(x, y, 'lbullet');
    b.setDepth(7);
    b.body.setAllowGravity(false);
    b.setVelocity(vx, vy);
    b.rotation = Math.atan2(vy, vx);
    b.dmg = 22;
    this.time.delayedCall(1200, () => { if (b.active) b.destroy(); });
  }

  spawnGrenade(x, y, dir) {
    const gr = this.grenades.create(x, y, 'grenade');
    gr.setScale(1.3).setDepth(7);
    gr.setVelocity(dir * 320, -430);
    gr.setBounce(0.4);
    gr.setAngularVelocity(dir * 420);
    this.time.delayedCall(1200, () => this.explodeGrenade(gr));
  }

  explodeGrenade(gr) {
    if (!gr || !gr.active) return;
    this.boom(gr.x, gr.y, 1.5);
    this.areaDamage(gr.x, gr.y, 110, 120);
    gr.destroy();
  }

  // ---------- Efectos ----------
  muzzle(x, y, dir, color) {
    const ADD = Phaser.BlendModes.ADD;
    const f = this.add.image(x + dir * 10, y, 'spark').setTint(color).setScale(1.1, 0.7)
      .setDepth(11).setBlendMode(ADD);
    this.tweens.add({ targets: f, scaleX: 0, alpha: 0, duration: 100, onComplete: () => f.destroy() });
    // chispitas
    for (let i = 0; i < 3; i++) {
      const s = this.add.image(x + dir * 14, y, 'spark').setTint(0xffd24a).setScale(0.3).setDepth(11).setBlendMode(ADD);
      this.tweens.add({
        targets: s, x: x + dir * Phaser.Math.Between(20, 40), y: y + Phaser.Math.Between(-8, 8),
        scale: 0, alpha: 0, duration: 140, onComplete: () => s.destroy(),
      });
    }
    // humito
    const sm = this.add.image(x + dir * 16, y, 'smoke').setTint(0x999999).setScale(0.4).setDepth(10).setAlpha(0.5);
    this.tweens.add({ targets: sm, scale: 1, alpha: 0, y: y - 12, duration: 320, onComplete: () => sm.destroy() });
  }

  boom(x, y, scale = 1) {
    SFX.play('explosion');
    const ADD = Phaser.BlendModes.ADD;
    // núcleo blanco
    const core = this.add.image(x, y, 'spark').setTint(0xffffff).setScale(scale * 1.4).setDepth(31).setBlendMode(ADD);
    this.tweens.add({ targets: core, scale: scale * 3.6, alpha: 0, duration: 200, onComplete: () => core.destroy() });
    // anillo naranja
    const ring = this.add.image(x, y, 'spark').setTint(0xff7b1a).setScale(scale * 0.8).setDepth(30).setBlendMode(ADD);
    this.tweens.add({ targets: ring, scale: scale * 5, alpha: 0, duration: 360, onComplete: () => ring.destroy() });
    // humo
    for (let i = 0; i < 4; i++) {
      const sm = this.add.image(x + Phaser.Math.Between(-12, 12), y + Phaser.Math.Between(-12, 6), 'smoke')
        .setTint(0x4a4a4a).setScale(scale * 0.5).setDepth(28).setAlpha(0.6);
      this.tweens.add({
        targets: sm, y: sm.y - Phaser.Math.Between(20, 40), scale: scale * 1.4, alpha: 0,
        duration: Phaser.Math.Between(500, 800), onComplete: () => sm.destroy(),
      });
    }
    // chispas y debris
    for (let i = 0; i < 10; i++) {
      const p = this.add.image(x, y, 'spark').setTint(Phaser.Math.RND.pick([0xff7b00, 0xffd24a, 0xff3b00]))
        .setScale(scale * 0.5).setDepth(31).setBlendMode(ADD);
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const sp = Phaser.Math.Between(50, 160) * scale;
      this.tweens.add({
        targets: p, x: x + Math.cos(a) * sp, y: y + Math.sin(a) * sp,
        scale: 0, alpha: 0, duration: Phaser.Math.Between(280, 480), onComplete: () => p.destroy(),
      });
    }
    this.cameras.main.shake(130, 0.007 * scale);
  }

  spawnDust(x, y, n = 2) {
    for (let i = 0; i < n; i++) {
      const d = this.add.image(x + Phaser.Math.Between(-6, 6), y, 'dust')
        .setTint(0xcdbb95).setScale(0.4).setDepth(5).setAlpha(0.7);
      this.tweens.add({
        targets: d, y: y - Phaser.Math.Between(6, 16), x: d.x + Phaser.Math.Between(-12, 12),
        scale: 1, alpha: 0, duration: Phaser.Math.Between(300, 500), onComplete: () => d.destroy(),
      });
    }
  }

  spawnCasing(x, y, dir) {
    const c = this.physics.add.image(x, y, 'casing').setDepth(5).setTint(0xe9c45a);
    c.setVelocity(dir * Phaser.Math.Between(60, 120), -Phaser.Math.Between(180, 260));
    c.setAngularVelocity(Phaser.Math.Between(-400, 400));
    this.time.delayedCall(800, () => { if (c.active) c.destroy(); });
  }

  areaDamage(x, y, radius, dmg) {
    this.enemies.getChildren().slice().forEach(e => {
      if (e.active && Phaser.Math.Distance.Between(x, y, e.x, e.y) <= radius) e.hit(dmg);
    });
    if (this.boss && this.boss.active &&
        Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y) <= radius + 30) {
      this.boss.hit(dmg);
    }
  }

  nearestEnemy(x, maxDist) {
    let best = null, bd = maxDist;
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Math.abs(e.x - x);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }

  // ---------- Colisiones ----------
  // Nota: Phaser invierte el orden de los argumentos según sea sprite-vs-grupo
  // o grupo-vs-grupo. Por eso identificamos cada objeto por su tipo (instanceof)
  // en vez de confiar en la posición del argumento.
  hitEnemyWithBullet(a, b) {
    const enemy  = (a instanceof Chairo) ? a : b;
    const bullet = (a instanceof Chairo) ? b : a;
    if (!bullet.active || !enemy.active) return;
    if (bullet.explosive) {
      this.boom(bullet.x, bullet.y, 1.4);
      this.areaDamage(bullet.x, bullet.y, 95, bullet.dmg);
    } else {
      enemy.hit(bullet.dmg);
    }
    bullet.destroy();
  }

  hitEnemyWithLucky(a, b) {
    const enemy  = (a instanceof Chairo) ? a : b;
    const bullet = (a instanceof Chairo) ? b : a;
    if (!bullet.active || !enemy.active) return;
    enemy.hit(bullet.dmg);
    bullet.destroy();
  }

  hitPlayerWithBullet(a, b) {
    const player = (a instanceof Player) ? a : b;
    const bullet = (a instanceof Player) ? b : a;
    if (!bullet.active) return;
    const dmg = bullet.dmg || 12;
    bullet.destroy();
    player.takeHit(dmg);
  }

  enemyTouchPlayer(a, b) {
    const player = (a instanceof Player) ? a : b;
    const enemy  = (a instanceof Player) ? b : a;
    const now = this.time.now;
    if (now < (enemy.contactCd || 0)) return;
    enemy.contactCd = now + 700;
    player.takeHit(14);
  }

  collectPickup(a, b) {
    const player = (a instanceof Player) ? a : b;
    const crate  = (a instanceof Player) ? b : a;
    const type = crate.ptype;
    if (type === 'vida') {
      player.heal(40);
      this.floatText(crate.x, crate.y, '+40 VIDA', '#4be36a');
      SFX.play('heal');
    } else if (type === 'tanque') {
      player.enterTank(false);
      this.floatText(crate.x, crate.y, '¡TANQUE LISTO!', '#c7e36a');
      SFX.play('powerup');
    } else if (type === 'lucky') {
      this.giveLucky();
      this.floatText(crate.x, crate.y, '¡LUCKY AL ATAQUE!', '#ffd24a');
      SFX.play('lucky');
    } else {
      player.giveWeapon(type);
      this.floatText(crate.x, crate.y, '¡' + WEAPONS[type].name.toUpperCase() + '!', '#ff9933');
      SFX.play('powerup');
    }
    if (crate.label) crate.label.destroy();
    crate.destroy();
  }

  reachGoal() {
    if (this.levelDone) return;
    this.levelDone = true;
    this.completeLevel();
  }

  // ---------- Lucky ----------
  giveLucky() {
    if (this.lucky && this.lucky.active) {
      this.lucky.hp = this.lucky.maxHp;  // recarga si ya lo tienes
      return;
    }
    this.lucky = new Lucky(this, this.player.x - 60, this.player.y - 40);
    this.physics.add.collider(this.lucky, this.floors);
    this.physics.add.collider(this.lucky, this.platforms);
    this.physics.add.overlap(this.enemyBullets, this.lucky, (a, b) => {
      const lucky  = (a instanceof Lucky) ? a : b;
      const bullet = (a instanceof Lucky) ? b : a;
      if (!bullet.active) return;
      bullet.destroy(); lucky.hit(10);
    });
    this.physics.add.overlap(this.enemies, this.lucky, (a, b) => {
      const lucky = (a instanceof Lucky) ? a : b;
      const enemy = (a instanceof Lucky) ? b : a;
      const now = this.time.now;
      if (now < (enemy.contactCd || 0)) return;
      enemy.contactCd = now + 700;
      lucky.hit(12);
    });
  }

  onLuckyLost() {
    this.lucky = null;
    this.banner('¡PERDISTE A LUCKY!', '#ff6666');
  }

  // ---------- Jefe ----------
  spawnBoss() {
    this.bossSpawned = true;
    const x = Math.min(this.level.width - 120, this.player.x + 360);
    this.boss = new Boss(this, x, CONST.GROUND_Y - 90, this.bossCfg);
    this.physics.add.collider(this.boss, this.floors);
    this.physics.add.overlap(this.playerBullets, this.boss, this.hitBossWithBullet, null, this);
    this.physics.add.overlap(this.luckyBullets, this.boss, this.hitBossWithLucky, null, this);
    this.physics.add.overlap(this.boss, this.player, this.bossTouchPlayer, null, this);
    this.banner('¡JEFE:  ' + this.bossCfg.name + '!', '#ff4d4d');
    this.cameras.main.shake(320, 0.012);
  }

  hitBossWithBullet(a, b) {
    const boss = (a instanceof Boss) ? a : b;
    const bullet = (a instanceof Boss) ? b : a;
    if (!bullet.active || !boss.active) return;
    if (bullet.explosive) {
      this.boom(bullet.x, bullet.y, 1.4);
      this.areaDamage(bullet.x, bullet.y, 95, bullet.dmg);
    } else {
      boss.hit(bullet.dmg);
    }
    bullet.destroy();
  }

  hitBossWithLucky(a, b) {
    const boss = (a instanceof Boss) ? a : b;
    const bullet = (a instanceof Boss) ? b : a;
    if (!bullet.active || !boss.active) return;
    boss.hit(bullet.dmg);
    bullet.destroy();
  }

  bossTouchPlayer(a, b) {
    const boss = (a instanceof Boss) ? a : b;
    const pl = (a instanceof Boss) ? b : a;
    const now = this.time.now;
    if (now < (boss.contactCd || 0)) return;
    boss.contactCd = now + 700;
    pl.takeHit(18);
  }

  onBossDefeated() {
    GAME_STATE.score += 1000;
    this.banner('¡JEFE DERROTADO!', '#4be36a');
    this.time.delayedCall(1100, () => this.completeLevel());
  }

  // ---------- Muertes / progreso ----------
  onChairoKilled(c) {
    GAME_STATE.score += 100;
    this.aliveEnemies = Math.max(0, this.aliveEnemies - 1);
  }

  playerDied() {
    if (this.levelDone) return;
    this.player.setActive(false).setVisible(false);
    this.boom(this.player.x, this.player.y, 1.4);
    GAME_STATE.lives -= 1;

    if (GAME_STATE.lives <= 0) {
      this.time.delayedCall(900, () => {
        this.scene.start('EndScene', { win: false });
      });
    } else {
      this.banner('¡TE DIERON CRANK! Vidas: ' + GAME_STATE.lives, '#ff6666');
      this.time.delayedCall(1100, () => this.scene.restart());
    }
  }

  completeLevel() {
    this.physics.pause();
    const isLast = this.levelIndex >= LEVELS.length - 1;
    SFX.play('win');
    this.banner(isLast ? '¡TERMINASTE EL JUEGO!' : '¡NIVEL COMPLETADO!', '#4be36a');
    this.time.delayedCall(1600, () => {
      if (isLast) {
        this.scene.start('EndScene', { win: true });
      } else {
        GAME_STATE.level += 1;
        this.scene.restart();
      }
    });
  }

  togglePause() {
    if (this.physics.world.isPaused) this.physics.resume();
    else this.physics.pause();
  }

  // ---------- HUD ----------
  buildHUD() {
    const d = 1000;
    this.hudGfx = this.add.graphics().setScrollFactor(0).setDepth(d);
    const txtStyle = { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#ffffff' };
    this.hudWeapon = this.add.text(16, 42, '', txtStyle).setScrollFactor(0).setDepth(d + 1);
    this.hudScore  = this.add.text(CONST.WIDTH - 16, 14, '', txtStyle).setOrigin(1, 0).setScrollFactor(0).setDepth(d + 1);
    this.hudLevel  = this.add.text(CONST.WIDTH - 16, 36, '', { ...txtStyle, fontSize: '13px', color: '#ffd24a' }).setOrigin(1, 0).setScrollFactor(0).setDepth(d + 1);
    this.hudLucky  = this.add.text(16, 66, '', { ...txtStyle, fontSize: '13px', color: '#66f0ff' }).setScrollFactor(0).setDepth(d + 1);
    this.hudBoss   = this.add.text(CONST.WIDTH / 2, 22, '', {
      ...txtStyle, fontStyle: 'bold', fontSize: '14px', color: '#ffd24a', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d + 1).setVisible(false);

    // Botón de silencio (también funciona con tecla M)
    this.muteBtn = this.add.text(CONST.WIDTH - 12, 58, SFX.muted ? '🔇' : '🔊', {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#ffffff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(3000).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => this.toggleMute());
  }

  toggleMute() {
    const m = SFX.toggleMute();
    if (this.muteBtn) this.muteBtn.setText(m ? '🔇' : '🔊');
  }

  drawHUD() {
    const g = this.hudGfx;
    g.clear();
    // barra de vida
    const x = 16, y = 14, w = 220, h = 18;
    g.fillStyle(0x000000, 0.55).fillRoundedRect(x - 3, y - 3, w + 6, h + 6, 4);
    g.fillStyle(0x3a0d0d, 1).fillRoundedRect(x, y, w, h, 3);
    const hpFrac = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
    const col = hpFrac > 0.5 ? 0x4be36a : hpFrac > 0.25 ? 0xffd24a : 0xff4444;
    g.fillStyle(col, 1).fillRoundedRect(x, y, Math.max(2, w * hpFrac), h, 3);

    // corazones de vidas
    for (let i = 0; i < GAME_STATE.lives; i++) {
      g.fillStyle(0xff4d6d, 1).fillCircle(x + w + 22 + i * 22, y + 8, 7);
    }

    // barra de blindaje del tanque (debajo de la vida)
    if (this.player.mode === 'tank' && this.player.maxShield > 0) {
      const sy = y + h + 6;
      g.fillStyle(0x000000, 0.55).fillRoundedRect(x - 3, sy - 3, w + 6, 14, 4);
      g.fillStyle(0x16240a, 1).fillRoundedRect(x, sy, w, 8, 3);
      const sf = Phaser.Math.Clamp(this.player.shield / this.player.maxShield, 0, 1);
      g.fillStyle(0xc7e36a, 1).fillRoundedRect(x, sy, Math.max(2, w * sf), 8, 3);
    }

    const wpn = WEAPONS[this.player.weapon];
    const ammoVal = this.player.ammo[this.player.weapon];
    const ammo = wpn.ammo === Infinity ? '∞' : (ammoVal || 0);
    const icon = this.player.mode === 'tank' ? '🛡️' : '🔫';
    this.hudWeapon.setText(icon + ' ' + wpn.name + '  [' + ammo + ']   💣 x' + this.player.grenades);
    this.hudScore.setText('PUNTOS: ' + GAME_STATE.score);
    this.hudLevel.setText('Nivel ' + (this.levelIndex + 1) + ': ' + this.level.name);
    if (this.lucky && this.lucky.active) {
      const lf = Math.ceil(this.lucky.hp);
      this.hudLucky.setText('🐶 Lucky HP: ' + lf);
    } else {
      this.hudLucky.setText('');
    }

    // barra de vida del jefe
    if (this.boss && this.boss.active && !this.boss.dead) {
      const bw = 420, bx = (CONST.WIDTH - bw) / 2, by = 40;
      g.fillStyle(0x000000, 0.5).fillRoundedRect(bx - 3, by - 3, bw + 6, 26, 4);
      g.fillStyle(0x3a0d0d, 1).fillRoundedRect(bx, by, bw, 20, 3);
      const frac = Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);
      g.fillStyle(0xff3b3b, 1).fillRoundedRect(bx, by, Math.max(2, bw * frac), 20, 3);
      this.hudBoss.setText(this.bossCfg.name).setVisible(true);
    } else {
      this.hudBoss.setVisible(false);
    }
  }

  floatText(x, y, msg, color) {
    const t = this.add.text(x, y - 30, msg, {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '16px', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, y: y - 80, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  banner(msg, color) {
    const t = this.add.text(CONST.WIDTH / 2, 120, msg, {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '34px', color,
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    this.tweens.add({ targets: t, scale: { from: 0.6, to: 1 }, duration: 250, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 1100, duration: 500, onComplete: () => t.destroy() });
  }

  // ---------- Loop ----------
  update(time) {
    if (this.player.active) this.player.update(time);
    if (this.lucky && this.lucky.active) this.lucky.update(time);

    // jefe: aparece al pasar el trigger y se actualiza
    if (this.bossCfg && !this.bossSpawned && this.player.x > this.bossCfg.triggerX) this.spawnBoss();
    if (this.boss && this.boss.active) this.boss.update(time);

    // caída a un pozo: Ita muere; Lucky regresa con Ita; chairos se eliminan
    if (this.player.active && this.player.y > CONST.HEIGHT + 80) this.playerDied();
    if (this.lucky && this.lucky.active && this.lucky.y > CONST.HEIGHT + 100) {
      this.lucky.setPosition(this.player.x, this.player.y - 60);
      this.lucky.setVelocity(0, 0);
    }
    this.enemies.getChildren().forEach(e => {
      if (e.active && e.y > CONST.HEIGHT + 120) e.destroy();
    });

    // limpiar balas fuera del mundo
    const W = this.level.width;
    [this.playerBullets, this.enemyBullets, this.luckyBullets].forEach(grp => {
      grp.getChildren().forEach(b => {
        if (b.x < -50 || b.x > W + 50 || b.y < -50 || b.y > CONST.HEIGHT + 50) b.destroy();
      });
    });

    this.drawHUD();
  }
}

window.GameScene = GameScene;
