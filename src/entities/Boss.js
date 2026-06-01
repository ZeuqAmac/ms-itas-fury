// ============================================================
//  Boss — jefe de nivel (IA, fases, voleas, refuerzos)
// ============================================================

const BOSS_SCALE = 2.4;

class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cfg) {
    super(scene, x, y, 'boss_' + cfg.type + '_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(BOSS_SCALE);
    this.setDepth(11);
    this.body.setSize(30, 64);
    this.body.setOffset(13, 12);
    this.setCollideWorldBounds(true);

    this.cfg = cfg;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.nextShot = scene.time.now + 700;
    this.nextBurst = scene.time.now + 2600;
    this.nextSpecial = scene.time.now + 4000;
    this.contactCd = 0;
    this.dead = false;
    this.raging = false;

    this.play('boss-' + cfg.type);
  }

  // abanico de balas APUNTADO hacia Ita
  fireFan(n, spread, speed, dmg) {
    const p = this.scene.player;
    if (!p) return;
    const dir = this.flipX ? -1 : 1;
    const gx = this.x + dir * 30, gy = this.y - 10;
    const aim = Math.atan2(p.y - gy, p.x - gx);
    for (let i = 0; i < n; i++) {
      const a = aim + (i - (n - 1) / 2) * spread;
      this.scene.spawnEnemyBullet(gx, gy, Math.cos(a) * speed, Math.sin(a) * speed, dmg);
    }
    this.scene.muzzle(gx, gy, dir, 0xffaa55);
  }

  update(time) {
    if (!this.active || this.dead) return;
    const p = this.scene.player;
    if (!p || !p.active) { this.setVelocityX(0); return; }

    const dx = p.x - this.x;
    const dir = Math.sign(dx) || 1;
    this.setFlipX(dx < 0);                 // mira hacia Ita
    const dist = Math.abs(dx);
    const rage = this.hp < this.maxHp * 0.5;
    if (rage && !this.raging) {             // aviso al entrar en furia
      this.raging = true;
      this.scene.banner('¡EL JEFE SE ENOJÓ!', '#ff3b3b');
      this.scene.cameras.main.shake(300, 0.012);
    }
    const spd = rage ? 155 : 100;

    // persigue de cerca
    let vx = 0;
    if (dist > 210) vx = dir * spd;
    else if (dist < 130) vx = -dir * spd;
    this.setVelocityX(vx);

    // volea apuntada
    if (time > this.nextShot) {
      this.nextShot = time + (rage ? 820 : 1250);
      this.fireFan(rage ? 6 : 4, rage ? 0.14 : 0.17, rage ? 540 : 470, 16);
    }

    // ráfaga especial (abanico amplio)
    if (time > this.nextBurst) {
      this.nextBurst = time + (rage ? 3200 : 4800);
      this.fireFan(rage ? 11 : 9, 0.17, 430, 16);
    }

    // refuerzos (chairos)
    if (time > this.nextSpecial) {
      this.nextSpecial = time + (rage ? 4200 : 6200);
      this.scene.spawnChairo(this.x - dir * 50);
      this.scene.spawnChairo(this.x - dir * 95);
      if (rage) this.scene.spawnChairo(this.x - dir * 140);
    }
  }

  hit(dmg) {
    if (this.dead || !this.active) return;
    this.hp -= dmg;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => { if (this.active) this.clearTint(); });
    if (this.hp <= 0) this.die();
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.setActive(false);
    this.body.enable = false;
    this.setVelocity(0, 0);
    // secuencia de explosiones
    this.scene.time.addEvent({
      delay: 130, repeat: 8,
      callback: () => this.scene.boom(
        this.x + Phaser.Math.Between(-34, 34),
        this.y + Phaser.Math.Between(-40, 30), 1.5),
    });
    this.scene.tweens.add({ targets: this, alpha: 0, duration: 1200, onComplete: () => this.destroy() });
    this.scene.onBossDefeated();
  }
}

window.Boss = Boss;
