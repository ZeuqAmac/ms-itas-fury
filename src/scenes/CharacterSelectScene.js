// ============================================================
//  CharacterSelectScene — elige personaje (extensible)
//  Las tarjetas se generan desde CHARACTERS (config.js).
//  Personajes bloqueados quedan listos para el futuro.
// ============================================================

class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  create() {
    const W = CONST.WIDTH, H = CONST.HEIGHT;

    // --- Fondo (reusa arte del juego) ---
    this.add.image(0, 0, 'sky_culiacan').setOrigin(0, 0).setDepth(-30);
    this.add.tileSprite(0, H - 70, W, 90, 'ground').setOrigin(0, 0).setDepth(-10).setAlpha(0.9);
    this.add.rectangle(0, 0, W, H, 0x140a14, 0.42).setOrigin(0, 0).setDepth(-20);

    // --- Título ---
    this.add.text(W / 2, 30, 'ELIGE TU PERSONAJE', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '34px', color: '#ffd24a',
      stroke: '#2b0a10', strokeThickness: 6,
    }).setOrigin(0.5, 0);

    // --- Tarjetas ---
    const previewScale = { ita: 2.3, choco: 2.3, tanque: 1.55, lucky: 2.5 };
    const n = CHARACTERS.length;
    const cw = 196, gap = 18, panelW = 178, panelH = 300;
    const totalW = n * cw + (n - 1) * gap;
    const x0 = (W - totalW) / 2 + cw / 2;
    const cyTop = 96;

    this.cards = [];
    this.selIndex = CHARACTERS.findIndex(c => !c.locked);
    if (this.selIndex < 0) this.selIndex = 0;

    CHARACTERS.forEach((ch, i) => {
      const cx = x0 + i * (cw + gap);
      const cy = cyTop + panelH / 2;

      const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x20131c, 0.92)
        .setStrokeStyle(3, 0x6e1423).setDepth(1);

      // preview del personaje
      const feetY = cyTop + 178;
      if (ch.sprite) {
        const spr = this.add.sprite(cx, feetY, ch.sprite).setOrigin(0.5, 1).setDepth(2)
          .setScale(previewScale[ch.id] || 2);
        if (ch.anim && this.anims.exists(ch.anim)) spr.play(ch.anim);
        if (ch.locked) spr.setTint(0x4a4a4a);
      } else {
        this.add.text(cx, feetY - 60, '?', {
          fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '88px', color: '#5a5a5a',
        }).setOrigin(0.5).setDepth(2);
      }

      // nombre + etiqueta + descripción
      this.add.text(cx, cyTop + 190, ch.name, {
        fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '22px',
        color: ch.locked ? '#888' : '#ffd24a', stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5, 0).setDepth(3);
      this.add.text(cx, cyTop + 216, ch.tag, {
        fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#ffe9c0',
      }).setOrigin(0.5, 0).setDepth(3);
      this.add.text(cx, cyTop + 238, ch.desc, {
        fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#c9b79a',
        align: 'center', wordWrap: { width: panelW - 22 }, lineSpacing: 2,
      }).setOrigin(0.5, 0).setDepth(3);

      // candado para bloqueados
      if (ch.locked) {
        this.add.rectangle(cx, cy, panelW, panelH, 0x000000, 0.45).setDepth(4);
        this.add.text(cx, cyTop + 60, '🔒', { fontSize: '46px' }).setOrigin(0.5).setDepth(5);
        this.add.text(cx, cyTop + 250, 'PRÓXIMAMENTE', {
          fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '13px', color: '#ff9a9a',
        }).setOrigin(0.5, 0).setDepth(5);
      }

      // marco de selección
      const sel = this.add.rectangle(cx, cy, panelW + 10, panelH + 10)
        .setStrokeStyle(5, 0xffd24a).setDepth(6).setVisible(false);

      // zona táctil
      const zone = this.add.zone(cx, cy, panelW, panelH).setDepth(7).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        if (ch.locked) { this.cameras.main.shake(120, 0.004); SFX.play('hurt'); return; }
        if (this.selIndex === i) { this.startGame(); return; }   // segundo toque = jugar
        this.select(i);
        SFX.play('powerup');
      });

      this.cards.push({ ch, panel, sel });
    });

    // --- Botón JUGAR ---
    this.playBtn = this.add.text(W / 2, H - 30, '▶  JUGAR', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '24px', color: '#2b1a0e',
      backgroundColor: '#ffd24a', padding: { x: 22, y: 8 },
    }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: this.playBtn, scale: 1.06, yoyo: true, repeat: -1, duration: 650 });
    this.playBtn.on('pointerdown', () => this.startGame());

    this.add.text(14, H - 22, '↩ Toca una tarjeta para elegir · doble toque para jugar', {
      fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#c9a23a',
    }).setOrigin(0, 0.5).setDepth(10);

    // --- Teclado ---
    this.input.keyboard.on('keydown-LEFT', () => this.move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
    this.input.keyboard.on('keydown-A', () => this.move(-1));
    this.input.keyboard.on('keydown-D', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());

    this.select(this.selIndex);
  }

  move(d) {
    let i = this.selIndex;
    for (let k = 0; k < CHARACTERS.length; k++) {
      i = (i + d + CHARACTERS.length) % CHARACTERS.length;
      if (!CHARACTERS[i].locked) { this.select(i); SFX.play('powerup'); return; }
    }
  }

  select(i) {
    this.selIndex = i;
    this.cards.forEach((c, k) => c.sel.setVisible(k === i));
  }

  startGame() {
    const ch = CHARACTERS[this.selIndex];
    if (!ch || ch.locked) return;
    GAME_STATE.character = ch.id;
    GAME_STATE.level = 0;
    GAME_STATE.lives = 3;
    GAME_STATE.score = 0;
    this.scene.start('GameScene');
  }
}

window.CharacterSelectScene = CharacterSelectScene;
