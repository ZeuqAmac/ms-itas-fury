// ============================================================
//  EndScene — victoria o game over
// ============================================================

class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }

  create(data) {
    const W = CONST.WIDTH, H = CONST.HEIGHT;
    const win = !!(data && data.win);
    SFX.play(win ? 'win' : 'gameover');

    this.add.image(0, 0, 'sky_culiacan').setOrigin(0, 0);
    this.add.rectangle(0, 0, W, H, 0x000000, win ? 0.4 : 0.6).setOrigin(0, 0);

    this.add.text(W / 2, 140, win ? '¡GANASTE!' : 'GAME OVER', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '64px',
      color: win ? '#4be36a' : '#ff4d4d', stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, 210, win
      ? 'Ita Ita y Lucky limpiaron Sinaloa de chairos. ¡Puro Sinaloa!'
      : 'Los chairos te dieron baje... ¡La próxima es la buena!', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3, align: 'center', wordWrap: { width: W - 120 },
    }).setOrigin(0.5);

    this.add.text(W / 2, 280, 'PUNTOS: ' + GAME_STATE.score, {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '30px', color: '#ffd24a',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    const btn = this.add.text(W / 2, 380, '▶  JUGAR DE NUEVO', {
      fontFamily: 'Trebuchet MS', fontStyle: 'bold', fontSize: '24px', color: '#2b1a0e',
      backgroundColor: '#ffd24a', padding: { x: 16, y: 10 },
    }).setOrigin(0.5);
    this.tweens.add({ targets: btn, alpha: 0.45, yoyo: true, repeat: -1, duration: 600 });

    const go = () => this.scene.start('MenuScene');
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);
    this.input.once('pointerdown', go);
    if (this.input.gamepad) this.input.gamepad.once('down', go);
  }
}

window.EndScene = EndScene;
