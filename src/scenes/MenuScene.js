// ============================================================
//  MenuScene — portada: una sola escena compuesta (no recortes)
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = CONST.WIDTH, H = CONST.HEIGHT;
    const gy = H - 60;                 // línea de suelo
    const ADD = Phaser.BlendModes.ADD;

    // --- Escena de fondo (mismos assets del juego => se ve "hecha") ---
    this.add.image(0, 0, 'sky_culiacan').setOrigin(0, 0).setDepth(-30);
    this.add.tileSprite(0, gy - 150, W, 200, 'skyline_far').setOrigin(0, 0).setDepth(-25).setAlpha(0.7);

    // monumentos al fondo
    this.add.image(W * 0.30, gy + 8, 'cathedral').setOrigin(0.5, 1).setDepth(-20).setScale(0.82);
    this.add.image(W * 0.92, gy + 8, 'market').setOrigin(0.5, 1).setDepth(-20).setScale(0.85);
    this.add.image(W * 0.46, gy + 6, 'palm').setOrigin(0.5, 1).setDepth(-15).setScale(1.0);

    // suelo
    this.add.tileSprite(0, gy, W, 80, 'ground').setOrigin(0, 0).setDepth(0);

    // explosiones de ambiente (detrás de los personajes)
    const boomFx = (x, y, s) => {
      const img = this.add.image(x, y, 'spark').setTint(0xff7b1a).setBlendMode(ADD)
        .setDepth(4).setScale(s * 0.4).setAlpha(0.9);
      this.tweens.add({
        targets: img, scale: s, alpha: 0, duration: 850, repeat: -1,
        repeatDelay: Phaser.Math.Between(500, 1400),
        onRepeat: () => img.setScale(s * 0.4).setAlpha(0.9),
      });
    };
    boomFx(W * 0.86, H * 0.42, 3.2);
    boomFx(W * 0.40, H * 0.55, 2.2);

    // --- Personajes (sprites del juego, transparentes y animados) ---
    this.add.sprite(W * 0.53, gy + 2, 'lucky_idle0').setOrigin(0.5, 1).setDepth(8).setScale(4.6).play('lucky-idle');
    this.add.sprite(W * 0.69, gy + 2, 'ita_idle0').setOrigin(0.5, 1).setDepth(10).setScale(6).play('ita-idle');

    // placas de nombre
    this.add.text(W * 0.69, gy + 16, 'ITA ITA', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '20px', color: '#ffd24a', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(20);
    this.add.text(W * 0.53, gy + 16, 'LUCKY', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '13px', color: '#ffc24a', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(20);

    // viñeta suave para unificar
    this.add.rectangle(0, 0, W, H, 0x140a14, 0.18).setOrigin(0, 0).setDepth(15);

    // --- Título tipo banner ---
    this.add.rectangle(W * 0.05, 56, 470, 72, 0x6e1423, 0.9).setOrigin(0, 0).setDepth(30).setStrokeStyle(3, 0xffd24a);
    this.add.text(W * 0.072, 63, "MS ITA'S FURY", {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '48px', color: '#ffd24a', stroke: '#2b0a10', strokeThickness: 7,
    }).setOrigin(0, 0).setDepth(31);
    this.add.text(W * 0.075, 116, 'METAL SLUG · SINALOENSE', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '17px', color: '#ffffff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0, 0).setDepth(31);

    // tagline
    this.add.text(W * 0.072, 158,
      'Limpia las calles de chairos con Ita Ita\ny su perro artillero Lucky.', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#ffe9c0', lineSpacing: 5, stroke: '#000', strokeThickness: 3,
    }).setOrigin(0, 0).setDepth(31);

    // --- Botón jugar ---
    const start = this.add.text(W * 0.30, H - 30, '▶  TOCA O PRESIONA ENTER PARA EMPEZAR', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '19px', color: '#2b1a0e',
      backgroundColor: '#ffd24a', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: start, alpha: 0.4, yoyo: true, repeat: -1, duration: 600 });

    const go = () => {
      SFX.unlock();
      this.scene.start('CharacterSelectScene');
    };
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);
    this.input.once('pointerdown', go);

    // Aviso de control detectado (Gamepad API): confirma que el navegador lo ve.
    this._padTxt = this.add.text(W / 2, H - 62, '', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '15px', color: '#9fe9ff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(40);
    this._go = go;
    // pequeña espera para no "heredar" un botón sostenido de la escena anterior
    this._padReady = false;
    this.time.delayedCall(350, () => { this._padReady = true; });
  }

  // Sondeo del gamepad (más confiable que el evento 'down' entre mandos)
  update() {
    const gp = this.input.gamepad;
    const p = (gp && gp.total) ? gp.getPad(0) : null;
    if (!p) return;
    if (this._padTxt && !this._padTxt.text) {
      this._padTxt.setText('🎮 ¡Control detectado! Presiona un botón para empezar');
    }
    if (this._padReady && !this._started && p.buttons.some(b => b && b.pressed)) {
      this._started = true; this._go();
    }
  }
}

window.MenuScene = MenuScene;
