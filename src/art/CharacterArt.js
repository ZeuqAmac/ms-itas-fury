// ============================================================
//  CharacterArt — sprites pixel-art por código (canvas 2D)
//  Estilo Metal Slug: contorno negro + sombreado por tonos.
//  Se dibuja a baja resolución; el motor lo escala nearest.
// ============================================================

const CharacterArt = {

  build(scene) {
    this._buildIta(scene);
    this._buildLucky(scene);
    this._buildChairo(scene);
    this._buildBoss(scene);
    this._anims(scene);
  },

  _sprite(scene, key, W, H, draw) {
    Pixel.sprite(scene, key, W, H, (p) => draw(p));
  },

  // -------------------------------------------------------
  //  ITA  (34 x 50)
  // -------------------------------------------------------
  _buildIta(scene) {
    const W = 34, H = 50;
    ['idle0', 'idle1', 'run0', 'run1', 'run2', 'run3', 'jump'].forEach(fr => {
      this._sprite(scene, 'ita_' + fr, W, H, p => this._drawIta(p, fr));
    });
  },

  _drawIta(p, fr) {
    const skin = 0xe8b184, skinHi = 0xf4c79a, skinSh = 0xc28a5c;
    const hair = 0x3a2412, hairMid = 0x5a3a1d, hairHi = 0x8a5a2c;
    const vest = 0x1e1e1e, vestMid = 0x343434, vestHi = 0x4c4c4c;
    const top = 0x2f8f8f, topHi = 0x57bcbc;
    const camo = 0x6e7a44, camoD = 0x49532c, camoL = 0x93a05f, blot = 0x383f1e;
    const boot = 0x281a0e, bootHi = 0x4a331c;
    const gun = 0x242424, gunHi = 0x6e6e6e, wood = 0x6b3f1f, mag = 0x171717;
    const glove = 0x141414, eyeW = 0xf7f2ea, ink = 0x0a0a0a;
    const lip = 0xbe5566, teeth = 0xffffff, brow = 0x2a1a0e, blush = 0xe79a86, buckle = 0xd9b24a;

    let bob = 0, lf = 0, lb = 0;
    if (fr === 'idle1') bob = 1;
    if (fr === 'run0') { lf = 3; lb = -3; }
    if (fr === 'run1') { lf = 1; lb = 1; bob = -1; }
    if (fr === 'run2') { lf = -3; lb = 3; }
    if (fr === 'run3') { lf = 1; lb = 1; bob = -1; }
    if (fr === 'jump') { lf = 2; lb = -4; bob = -2; }
    const oy = bob;

    const leg = (x, y) => {
      p(camo, x, y, 7, 14); p(camoD, x, y, 2, 14);
      p(camoL, x + 3, y + 2, 2, 3); p(blot, x + 1, y + 7, 3, 3); p(camoL, x + 2, y + 10, 2, 2);
      p(ink, x, y + 9, 7, 1);                       // rodillera
      p(boot, x, y + 14, 7, 4); p(bootHi, x, y + 14, 7, 1);
    };

    // --- cabello trasero (melena larga y ondulada) ---
    p(hair, 3, 4 + oy, 9, 24);
    p(hair, 2, 11 + oy, 3, 12);                     // onda externa
    p(hair, 4, 26 + oy, 7, 12);                     // largo
    p(hairMid, 4, 6 + oy, 3, 18); p(hairHi, 5, 9 + oy, 2, 12);

    // --- brazo trasero ---
    p(skinSh, 7, 17 + oy, 4, 9);

    // --- piernas ---
    leg(11 + lb, 31 + oy);
    leg(17 + lf, 31 + oy);

    // --- torso: chaleco negro abierto + top teal ---
    p(vest, 9, 15 + oy, 15, 16); p(vestMid, 9, 15 + oy, 15, 2); p(vestHi, 9, 15 + oy, 2, 16);
    p(top, 14, 16 + oy, 6, 8); p(topHi, 14, 16 + oy, 2, 8);
    p(skin, 16, 16 + oy, 2, 3);                     // escote
    p(ink, 13, 16 + oy, 1, 14); p(ink, 20, 16 + oy, 1, 14);   // cierres
    p(0x121212, 10, 23 + oy, 3, 4); p(0x121212, 20, 23 + oy, 3, 4); // bolsas
    p(0x2a1d12, 9, 29 + oy, 15, 3); p(buckle, 15, 29 + oy, 4, 3);   // cinturón

    // --- cuello + cabeza ---
    p(skin, 15, 13 + oy, 4, 3);
    p(skin, 11, 4 + oy, 12, 11);
    p(skinSh, 20, 5 + oy, 3, 9); p(skinHi, 12, 5 + oy, 3, 4);
    p(blush, 12, 11 + oy, 2, 1); p(blush, 20, 11 + oy, 2, 1);
    // ojos grandes
    p(eyeW, 13, 8 + oy, 3, 3); p(ink, 14, 8 + oy, 2, 3);
    p(eyeW, 18, 8 + oy, 3, 3); p(ink, 19, 8 + oy, 2, 3);
    p(brow, 13, 6 + oy, 3, 1); p(brow, 18, 6 + oy, 3, 1);
    // sonrisa con dientes
    p(lip, 14, 12 + oy, 6, 2); p(teeth, 15, 12 + oy, 4, 1);

    // --- cabello frente/top (volumen) + mechón sobre el hombro ---
    p(hair, 9, 0 + oy, 15, 6); p(hairMid, 10, 1 + oy, 13, 2); p(hairHi, 12, 0 + oy, 7, 1);
    p(hair, 9, 5 + oy, 3, 6);                        // fleco izq
    p(hair, 22, 4 + oy, 3, 8);                       // fleco der
    p(hair, 23, 14 + oy, 4, 13); p(hairHi, 24, 16 + oy, 1, 8);  // mechón sobre el hombro

    // --- brazo delantero (guante) + cuerno de chivo (AK) ---
    p(skin, 19, 17 + oy, 4, 5); p(skin, 21, 20 + oy, 6, 3);
    p(glove, 26, 20 + oy, 5, 3); p(0x2a2a2a, 26, 20 + oy, 5, 1);
    p(wood, 16, 22 + oy, 5, 4);                      // culata de madera
    p(gun, 20, 21 + oy, 3, 6);                       // cajón
    p(gun, 21, 22 + oy, 13, 2); p(gunHi, 21, 22 + oy, 13, 1);   // cañón
    p(mag, 22, 24 + oy, 4, 5); p(mag, 24, 28 + oy, 3, 3);       // cargador curvo
    p(gun, 32, 21 + oy, 2, 2);                       // alza
  },

  // -------------------------------------------------------
  //  LUCKY  (36 x 30)
  // -------------------------------------------------------
  _buildLucky(scene) {
    const W = 36, H = 30;
    ['idle0', 'idle1', 'walk0', 'walk1'].forEach(fr => {
      this._sprite(scene, 'lucky_' + fr, W, H, p => this._drawLucky(p, fr));
    });
  },

  _drawLucky(p, fr) {
    const fur = 0xe07b2e, furMid = 0xc4661f, furHi = 0xf4a04a, cream = 0xf7d9a0;
    const ear = 0xab571c, nose = 0x141414, eye = 0x141414, shine = 0xffffff;
    const gun = 0x2a2a2a, gunHi = 0x5a5a5a, tongue = 0xe25b5b;
    let bob = 0, tail = 0, lf = 0, lb = 0;
    if (fr === 'idle1') { bob = 1; tail = -1; }
    if (fr === 'walk0') { lf = 2; lb = -2; }
    if (fr === 'walk1') { lf = -2; lb = 2; bob = 1; tail = -1; }
    const oy = bob;

    // cola
    p(fur, 1, 7 + oy + tail, 9, 13); p(furHi, 2, 8 + oy + tail, 4, 8); p(cream, 3, 11 + oy + tail, 2, 4);
    p(fur, 0, 9 + oy + tail, 2, 3); p(fur, 1, 16 + oy + tail, 2, 3);
    // cuerpo
    p(fur, 8, 12 + oy, 16, 12); p(furHi, 8, 12 + oy, 16, 3); p(furMid, 8, 21 + oy, 16, 3);
    p(cream, 12, 17 + oy, 8, 6);
    p(fur, 9, 23 + oy, 3, 3); p(fur, 19, 23 + oy, 3, 3);
    p(fur, 10 + lb, 24 + oy, 4, 4); p(fur, 17 + lf, 24 + oy, 4, 4);
    // cabeza
    p(fur, 20, 5 + oy, 14, 15); p(furHi, 20, 5 + oy, 14, 3); p(cream, 26, 13 + oy, 7, 5);
    p(fur, 19, 12 + oy, 2, 4); p(fur, 33, 12 + oy, 2, 4);
    p(ear, 21, 1 + oy + tail, 4, 6); p(ear, 30, 1 + oy - tail, 4, 6);
    p(fur, 22, 2 + oy + tail, 2, 4); p(fur, 31, 2 + oy - tail, 2, 4);
    p(eye, 24, 10 + oy, 2, 3); p(eye, 29, 10 + oy, 2, 3);
    p(shine, 24, 10 + oy, 1, 1); p(shine, 29, 10 + oy, 1, 1);
    p(nose, 32, 14 + oy, 3, 2); p(tongue, 28, 18 + oy, 3, 2);
    // minigun
    p(gun, 20, 16 + oy, 4, 7); p(gun, 22, 18 + oy, 14, 4); p(gunHi, 28, 18 + oy, 8, 1);
    p(0x111111, 34, 18 + oy, 2, 4);
  },

  // -------------------------------------------------------
  //  CHAIRO  (28 x 48)
  // -------------------------------------------------------
  _buildChairo(scene) {
    const W = 28, H = 48;
    ['walk0', 'walk1', 'walk2', 'walk3'].forEach(fr => {
      this._sprite(scene, 'chairo_' + fr, W, H, p => this._drawChairo(p, fr));
    });
  },

  _drawChairo(p, fr) {
    const skin = 0xcf9a63, skinSh = 0xa97a48, skinHi = 0xe0b27a;
    const pant = 0x21409c, pantSh = 0x16296b, pantHi = 0x3257c4;
    const vest = 0x6e1423, vestHi = 0x991c30, vestSh = 0x4e0e19;
    const shirt = 0xe6e6e6, shirtSh = 0xbdbdbd, cap = 0x14110d, capHi = 0x2a241a;
    const boot = 0x111111, brow = 0x000000, gun = 0x222222, gunHi = 0x555555, stubble = 0x6b5235;

    let lf = 0, lb = 0, bob = 0;
    if (fr === 'walk0') { lf = 2; lb = -2; }
    if (fr === 'walk1') bob = -1;
    if (fr === 'walk2') { lf = -2; lb = 2; }
    if (fr === 'walk3') bob = -1;
    const oy = bob;

    const leg = (x) => {
      p(pant, x, 30 + oy, 6, 13); p(pantSh, x, 30 + oy, 2, 13); p(pantHi, x + 4, 30 + oy, 1, 13);
      p(boot, x, 43 + oy, 7, 4);
    };
    leg(8 + lb); leg(14 + lf);

    p(skinSh, 5, 17 + oy, 4, 10);                         // brazo trasero
    p(shirt, 9, 15 + oy, 10, 16); p(shirtSh, 9, 27 + oy, 10, 4);
    p(vest, 8, 15 + oy, 4, 15); p(vest, 16, 15 + oy, 4, 15);
    p(vestHi, 8, 15 + oy, 1, 15); p(vestSh, 18, 15 + oy, 2, 15);
    p(0x111111, 8, 29 + oy, 12, 2);                       // cinturón

    // cabeza
    p(skin, 9, 4 + oy, 11, 11); p(skinSh, 17, 5 + oy, 3, 9); p(skinHi, 10, 5 + oy, 2, 4);
    p(stubble, 10, 12 + oy, 9, 3);
    p(cap, 7, 1 + oy, 14, 5); p(capHi, 8, 1 + oy, 12, 1); p(cap, 18, 4 + oy, 6, 2);
    p(brow, 10, 7 + oy, 4, 2); p(brow, 15, 7 + oy, 4, 2);
    p(0x111111, 11, 9 + oy, 2, 2); p(0x111111, 16, 9 + oy, 2, 2);
    p(0x111111, 12, 13 + oy, 5, 1);

    // brazo delantero + pistola
    p(skin, 18, 17 + oy, 4, 4); p(skin, 20, 19 + oy, 5, 3);
    p(gun, 24, 19 + oy, 6, 3); p(gunHi, 24, 19 + oy, 6, 1);
  },

  // -------------------------------------------------------
  //  JEFES (56 x 78) — 2 variantes por paleta
  // -------------------------------------------------------
  _buildBoss(scene) {
    const PAL = {
      patron: {
        skin: 0xcf9a63, skinSh: 0xa97a48, vest: 0x6e1423, vestHi: 0x991c30,
        pants: 0x1f3a93, pantsSh: 0x16296b, cap: 0x14110d, gold: 0xe9c45a,
        gun: 0x2a2a2a, gunHi: 0x5a5a5a, shades: 0x111111,
      },
      general: {
        skin: 0xcf9a63, skinSh: 0xa97a48, vest: 0x3a4a2a, vestHi: 0x55663a,
        pants: 0x4a4030, pantsSh: 0x342c20, cap: 0x2a3320, gold: 0xb8b8b8,
        gun: 0x232323, gunHi: 0x555555, shades: 0x111111,
      },
    };
    Object.keys(PAL).forEach(type => {
      ['0', '1'].forEach(fr => {
        this._sprite(scene, 'boss_' + type + '_' + fr, 56, 78, p => this._drawBoss(p, fr, PAL[type]));
      });
      const key = 'boss-' + type;
      if (!scene.anims.exists(key)) {
        scene.anims.create({ key, frames: [{ key: 'boss_' + type + '_0' }, { key: 'boss_' + type + '_1' }], frameRate: 2, repeat: -1 });
      }
    });
  },

  _drawBoss(p, fr, c) {
    const oy = fr === '1' ? 1 : 0;
    const ink = 0x0a0a0a;
    const leg = (x) => {
      p(c.pants, x, 52 + oy, 12, 20); p(c.pantsSh, x, 52 + oy, 3, 20);
      p(ink, x - 1, 72 + oy, 14, 6);          // bota
    };
    // piernas
    leg(15); leg(29);
    // brazo trasero
    p(c.skinSh, 5, 30 + oy, 8, 18);
    // torso (corpulento) + chaleco
    p(c.vest, 9, 28 + oy, 36, 26); p(c.vestHi, 9, 28 + oy, 36, 3); p(c.vestHi, 9, 28 + oy, 3, 26);
    p(0xdedede, 24, 30 + oy, 8, 22);          // camisa
    // bandolera + balas
    p(0x3a2a18, 11, 33 + oy, 32, 4);
    for (let bx = 13; bx < 42; bx += 5) p(c.gold, bx, 34 + oy, 2, 2);
    // cinturón
    p(ink, 9, 50 + oy, 36, 4); p(c.gold, 24, 50 + oy, 7, 4);
    // cadena de oro
    p(c.gold, 22, 40 + oy, 12, 2);
    // cabeza
    p(c.skin, 19, 12 + oy, 18, 17); p(c.skinSh, 33, 13 + oy, 4, 15);
    p(0x1a140d, 19, 25 + oy, 18, 5);          // barba
    // gorra
    p(c.cap, 17, 6 + oy, 22, 8); p(c.cap, 35, 10 + oy, 9, 3);
    p(ink, 19, 16 + oy, 16, 2);               // ceja
    // lentes oscuros
    p(c.shades, 21, 18 + oy, 15, 4); p(0x333333, 21, 18 + oy, 15, 1);
    // brazo delantero + arma pesada
    p(c.skin, 41, 30 + oy, 8, 8); p(c.skin, 45, 37 + oy, 8, 4);
    p(c.gun, 40, 34 + oy, 16, 10); p(c.gunHi, 40, 34 + oy, 16, 2);
    p(c.gun, 52, 36 + oy, 4, 3); p(c.gun, 52, 41 + oy, 4, 3);   // cañones
  },

  // -------------------------------------------------------
  //  Animaciones
  // -------------------------------------------------------
  _anims(scene) {
    const mk = (key, frames, frameRate, repeat) => {
      if (scene.anims.exists(key)) return;
      scene.anims.create({ key, frames: frames.map(f => ({ key: f })), frameRate, repeat });
    };
    mk('ita-idle', ['ita_idle0', 'ita_idle1'], 3, -1);
    mk('ita-run', ['ita_run0', 'ita_run1', 'ita_run2', 'ita_run3'], 12, -1);
    mk('ita-jump', ['ita_jump'], 1, 0);
    mk('lucky-idle', ['lucky_idle0', 'lucky_idle1'], 4, -1);
    mk('lucky-walk', ['lucky_walk0', 'lucky_walk1'], 9, -1);
    mk('chairo-walk', ['chairo_walk0', 'chairo_walk1', 'chairo_walk2', 'chairo_walk3'], 8, -1);
  },
};

window.CharacterArt = CharacterArt;
