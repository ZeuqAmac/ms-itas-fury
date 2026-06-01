// ============================================================
//  Chairo — enemigo básico (pixel-art animado)
// ============================================================

const CHAIRO_SCALE = 1.85;

class Chairo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'chairo_walk0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(CHAIRO_SCALE);
    this.setDepth(8);
    this.body.setSize(12, 44);
    this.body.setOffset(8, 3);
    this.setCollideWorldBounds(false);

    this.hp = 60;
    this.speed = Phaser.Math.Between(55, 90);
    this.nextShot = scene.time.now + Phaser.Math.Between(800, 2200);
    this.contactCd = 0;
    this._dying = false;

    this.play('chairo-walk');
  }

  update(time) {
    if (!this.active) return;
    const p = this.scene.player;
    if (!p || !p.active) { this.setVelocityX(0); return; }

    const dx = p.x - this.x;
    const dir = Math.sign(dx) || 1;
    this.setFlipX(dir < 0);
    const dist = Math.abs(dx);

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
