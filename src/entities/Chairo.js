// ============================================================
//  Chairo — enemigo básico (pixel-art animado).
//  Variantes: 'pistola' (camina y dispara), 'bazuca' (mantiene
//  distancia y lanza cohetes) y 'machete' (corre a cuchillarte).
// ============================================================

const CHAIRO_SCALE = 1.85;

const CHAIRO_TYPES = {
  pistola: { hp: 60, speed: [55, 90],   tex: 'chairo',  anim: 'chairo-walk',  score: 100, touchDmg: 14 },
  bazuca:  { hp: 85, speed: [40, 60],   tex: 'chairoB', anim: 'chairoB-walk', score: 200, touchDmg: 14 },
  machete: { hp: 50, speed: [145, 180], tex: 'chairoM', anim: 'chairoM-walk', score: 150, touchDmg: 20 },
};

class Chairo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const cfg = CHAIRO_TYPES[type] || CHAIRO_TYPES.pistola;
    super(scene, x, y, cfg.tex + '_walk0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(CHAIRO_SCALE);
    this.setDepth(8);
    this.body.setSize(12, 44);
    this.body.setOffset(8, 3);
    this.setCollideWorldBounds(false);

    this.type = CHAIRO_TYPES[type] ? type : 'pistola';
    this.hp = cfg.hp;
    this.score = cfg.score;
    this.touchDmg = cfg.touchDmg;
    this.speed = Phaser.Math.Between(cfg.speed[0], cfg.speed[1]);
    this.nextShot = scene.time.now + Phaser.Math.Between(800, 2200);
    this.contactCd = 0;
    this._dying = false;

    this.play(cfg.anim);
  }

  update(time) {
    if (!this.active) return;
    const p = this.scene.player;
    if (!p || !p.active) { this.setVelocityX(0); return; }

    const dx = p.x - this.x;
    const dir = Math.sign(dx) || 1;
    this.setFlipX(dir < 0);
    const dist = Math.abs(dx);

    if (this.type === 'machete') {
      // corre directo al jugador (embiste cuando lo tiene cerca)
      const rush = dist < 160 ? 1.4 : 1;
      this.setVelocityX(dir * this.speed * rush);
      return;
    }

    if (this.type === 'bazuca') {
      // mantiene distancia media y lanza cohetes lentos
      if (dist > 420) this.setVelocityX(dir * this.speed);
      else if (dist < 240) this.setVelocityX(-dir * this.speed);
      else this.setVelocityX(0);
      if (dist < 560 && Math.abs(p.y - this.y) < 150 && time > this.nextShot) {
        this.nextShot = time + Phaser.Math.Between(2600, 4000);
        this.scene.spawnEnemyRocket(this.x + dir * 30, this.y - 16, dir * 300, 0);
        this.scene.muzzle(this.x + dir * 30, this.y - 16, dir, 0xffaa55);
      }
      return;
    }

    // 'pistola' (comportamiento clásico)
    if (dist > 80) this.setVelocityX(dir * this.speed);
    else this.setVelocityX(0);

    if (dist < 480 && Math.abs(p.y - this.y) < 130 && time > this.nextShot) {
      this.nextShot = time + Phaser.Math.Between(1300, 2400);
      this.scene.spawnEnemyBullet(this.x + dir * 22, this.y - 6, dir * 380, 0);
      this.scene.muzzle(this.x + dir * 22, this.y - 6, dir, 0xffaa55);
    }
  }

  hit(dmg) {
    if (!this.active || this._dying) return;
    this.hp -= dmg;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => { if (this.active) this.clearTint(); });
    if (this.hp <= 0) this.die();
  }

  die() {
    if (this._dying) return;
    this._dying = true;
    this.scene.onChairoKilled(this);
    this.scene.boom(this.x, this.y - 10, 0.9);
    this.setActive(false);
    this.body.enable = false;
    this.setVelocity(0, 0);
    this.scene.tweens.add({
      targets: this,
      angle: Phaser.Math.Between(-140, 140),
      y: this.y - 14,
      alpha: 0,
      scaleY: this.scaleY * 0.8,
      duration: 320,
      ease: 'Quad.in',
      onComplete: () => this.destroy(),
    });
  }
}

window.Chairo = Chairo;
