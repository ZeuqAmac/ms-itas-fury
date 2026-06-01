// ============================================================
//  Lucky — compañero perro artillero (camina y dispara)
// ============================================================

const LUCKY_SCALE = 1.95;

class Lucky extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'lucky_idle0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(LUCKY_SCALE);
    this.setDepth(9);
    this.body.setSize(24, 24);
    this.body.setOffset(7, 4);

    this.hp = 160;
    this.maxHp = 160;
    this.nextShot = 0;

    this.play('lucky-idle');
  }

  update(time) {
    if (!this.active) return;
    const p = this.scene.player;
    if (!p || !p.active) { this.setVelocityX(0); return; }

    // --- Sigue a Ita caminando, por detrás ---
    const tx = p.x - p.dir * 64;
    const dx = tx - this.x;
    let vx = 0;
    if (Math.abs(dx) > 26) vx = Phaser.Math.Clamp(dx * 5, -300, 300);
    this.setVelocityX(vx);

    const onGround = this.body.blocked.down || this.body.touching.down;
    // salta si Ita está más arriba o si choca con una pared
    if (onGround && (p.y < this.y - 70 || this.body.blocked.left || this.body.blocked.right)) {
      this.setVelocityY(-580);
    }

    // --- Dispara al enemigo más cercano ---
    let faceDir = (vx !== 0) ? Math.sign(vx) : (p.dir);
    const e = this.scene.nearestEnemy(this.x, 640);
    if (e) {
      faceDir = Math.sign(e.x - this.x) || faceDir;
      if (time > this.nextShot) {
        this.nextShot = time + 190;
        const gx = this.x + faceDir * 28, gy = this.y - 2;
        const ang = Math.atan2(e.y - gy, e.x - gx);
        this.scene.spawnLuckyBullet(gx, gy, Math.cos(ang) * 840, Math.sin(ang) * 840);
        this.scene.muzzle(gx, gy, faceDir, 0x88f4ff);
      }
    }
    this.setFlipX(faceDir < 0);

    // --- Animación ---
    if (onGround && Math.abs(vx) > 15) this.anims.play('lucky-walk', true);
    else this.anims.play('lucky-idle', true);
  }

  hit(dmg) {
    if (!this.active) return;
    this.hp -= dmg;
    this.setTintFill(0xff6666);
    this.scene.time.delayedCall(60, () => { if (this.active) this.clearTint(); });
    if (this.hp <= 0) this.leave();
  }

  leave() {
    this.scene.boom(this.x, this.y, 1.2);
    this.scene.onLuckyLost();
    this.destroy();
  }
}

window.Lucky = Lucky;
