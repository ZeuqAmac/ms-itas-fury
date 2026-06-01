// ============================================================
//  MS Ita's Fury — arranque de Phaser
// ============================================================

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1a1020',
  pixelArt: true,
  // Escalado responsive: se ajusta a cualquier pantalla manteniendo 16:9
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONST.WIDTH,
    height: CONST.HEIGHT,
  },
  // Multi-touch (mover + disparar al mismo tiempo en móvil)
  input: { activePointers: 3 },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: CONST.GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, EndScene],
};

// Estado global compartido entre escenas (progreso del jugador)
window.GAME_STATE = {
  level: 0,
  lives: 3,
  score: 0,
};

const game = new Phaser.Game(config);
window.game = game;

// El audio del navegador requiere un gesto del usuario: arrancamos en el
// primer toque/tecla y lanzamos la música.
const startAudio = () => {
  SFX.resume();
  SFX.startMusic();
  window.removeEventListener('pointerdown', startAudio);
  window.removeEventListener('keydown', startAudio);
};
window.addEventListener('pointerdown', startAudio);
window.addEventListener('keydown', startAudio);
