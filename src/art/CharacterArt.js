// ============================================================
//  CharacterArt — sprites pixel-art por código (canvas 2D)
//  Estilo Metal Slug: contorno negro + sombreado por tonos.
//  Se dibuja a baja resolución; el motor lo escala nearest.
// ============================================================

const CharacterArt = {

  build(scene) {
    this._buildIta(scene);
    this._buildChoco(scene);
    this._buildLucky(scene);
    this._buildChairo(scene);
    this._buildPow(scene);
    this._buildBoss(scene);
    this._buildHelo(scene);
    this._buildTank(scene);
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
    ['idle0', 'idle1', 'run0', 'run1', 'run2', 'run3', 'jump', 'up',
      'updiag0', 'updiag1', 'updiag2', 'updiag3'].forEach(fr => {
      this._sprite(scene, 'ita_' + fr, W, H, p => this._drawIta(p, fr));
    });
  },

  _drawIta(p, fr) {
    const skin = 0xe8b184, skinHi = 0xf4c79a, skinSh = 0xc28a5c;
    const hair = 0x4d2e15, hairMid = 0x774925, hairHi = 0xa3692f;
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
    // apuntar arriba en diagonal: reusa el ciclo de piernas de correr
    if (fr === 'updiag0') { lf = 3; lb = -3; }
    if (fr === 'updiag1') { lf = 1; lb = 1; bob = -1; }
    if (fr === 'updiag2') { lf = -3; lb = 3; }
    if (fr === 'updiag3') { lf = 1; lb = 1; bob = -1; }
    const oy = bob;

    const leg = (x, y) => {
      p(camo, x, y, 7, 14); p(camoD, x, y, 2, 14);
      p(camoL, x + 3, y + 2, 2, 3); p(blot, x + 1, y + 7, 3, 3); p(camoL, x + 2, y + 10, 2, 2);
      p(ink, x, y + 9, 7, 1);                       // rodillera
      p(boot, x, y + 14, 7, 4); p(bootHi, x, y + 14, 7, 1);
    };

    // --- cabello trasero (melena larga, voluminosa y ondulada) ---
    p(hair, 2, 3 + oy, 11, 26);                     // mata principal
    p(hair, 0, 9 + oy, 3, 14);                      // onda externa (volumen)
    p(hair, 1, 22 + oy, 4, 9);                      // rizo bajo
    p(hair, 4, 27 + oy, 8, 13);                     // largo que cae
    p(hairMid, 3, 6 + oy, 4, 20); p(hairHi, 4, 9 + oy, 2, 14);
    p(hairHi, 2, 16 + oy, 1, 8);                    // brillo de la onda

    // --- brazo trasero ---
    p(skinSh, 7, 17 + oy, 4, 9);

    // --- piernas ---
    leg(11 + lb, 31 + oy);
    leg(17 + lf, 31 + oy);

    // --- torso: chaleco negro abierto + top teal ---
    p(vest, 9, 15 + oy, 15, 16); p(vestMid, 9, 15 + oy, 15, 2); p(vestHi, 9, 15 + oy, 2, 16);
    p(top, 14, 16 + oy, 6, 6); p(topHi, 14, 16 + oy, 2, 6);
    p(skin, 16, 16 + oy, 2, 3);                     // escote
    p(skin, 14, 22 + oy, 6, 7);                     // ombligo a la vista (chaleco abierto)
    p(skinSh, 14, 22 + oy, 1, 7); p(skinSh, 16, 25 + oy, 1, 1);
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
    if (fr === 'up') {
      // apuntar recto hacia arriba (AK vertical, a la derecha de la cabeza)
      p(skin, 18, 17 + oy, 4, 6); p(skin, 20, 12 + oy, 4, 6); p(glove, 22, 9 + oy, 5, 4);
      p(wood, 23, 20 + oy, 4, 6);                     // culata
      p(gun, 23, 16 + oy, 5, 6);                      // cajón
      p(mag, 19, 18 + oy, 4, 5); p(mag, 17, 21 + oy, 3, 3);   // cargador curvo
      p(gun, 24, 0 + oy, 3, 18); p(gunHi, 24, 0 + oy, 1, 18); // cañón vertical
      p(gun, 22, 8 + oy, 2, 2);                       // alza
    } else if (fr.indexOf('updiag') === 0) {
      // apuntar en diagonal hacia arriba-adelante
      p(skin, 19, 17 + oy, 4, 4); p(skin, 22, 14 + oy, 4, 4); p(glove, 25, 11 + oy, 5, 4);
      p(wood, 16, 23 + oy, 4, 4);                     // culata abajo-izq
      for (let i = 0; i < 12; i++) p(gun, 20 + i, 21 + oy - i, 3, 3);    // cañón diagonal
      for (let i = 0; i < 12; i++) p(gunHi, 20 + i, 21 + oy - i, 1, 1);
      p(mag, 20, 24 + oy, 4, 4); p(mag, 21, 27 + oy, 3, 3);              // cargador
      p(gun, 31, 9 + oy, 3, 3);                       // boca
    } else {
      p(skin, 19, 17 + oy, 4, 5); p(skin, 21, 20 + oy, 6, 3);
      p(glove, 26, 20 + oy, 5, 3); p(0x2a2a2a, 26, 20 + oy, 5, 1);
      p(wood, 16, 22 + oy, 5, 4);                      // culata de madera
      p(gun, 20, 21 + oy, 3, 6);                       // cajón
      p(gun, 21, 22 + oy, 13, 2); p(gunHi, 21, 22 + oy, 13, 1);   // cañón
      p(mag, 22, 24 + oy, 4, 5); p(mag, 24, 28 + oy, 3, 3);       // cargador curvo
      p(gun, 32, 21 + oy, 2, 2);                       // alza
    }
  },

  // -------------------------------------------------------
  //  LA CHOCO  (34 x 50) — Prisionera 4027
  //  Overol amarillo + top negro, melena rubia rizada y voluminosa.
  // -------------------------------------------------------
  _buildChoco(scene) {
    const W = 34, H = 50;
    ['idle0', 'idle1', 'run0', 'run1', 'run2', 'run3', 'jump', 'up',
      'updiag0', 'updiag1', 'updiag2', 'updiag3'].forEach(fr => {
      this._sprite(scene, 'choco_' + fr, W, H, p => this._drawChoco(p, fr));
    });
  },

  _drawChoco(p, fr) {
    const skin = 0xe8b184, skinHi = 0xf4c79a, skinSh = 0xc28a5c;
    const hair = 0x8a5a22, hairMid = 0xb6822f, hairHi = 0xe6bc5e;   // rubio rojizo rizado
    const top = 0x1b1b1b, topMid = 0x333333, topHi = 0x4a4a4a;       // top negro
    const suit = 0xe0a92a, suitSh = 0xa87c18, suitHi = 0xf6c84e;     // overol amarillo
    const boot = 0x281a0e, bootHi = 0x4a331c;
    const gun = 0x242424, gunHi = 0x6e6e6e, mag = 0x171717;
    const glove = 0x141414, eyeW = 0xf7f2ea, ink = 0x0a0a0a;
    const lip = 0xbe5566, teeth = 0xffffff, brow = 0x4a2f12, blush = 0xe79a86, zip = 0x9a7414;

    let bob = 0, lf = 0, lb = 0;
    if (fr === 'idle1') bob = 1;
    if (fr === 'run0') { lf = 3; lb = -3; }
    if (fr === 'run1') { lf = 1; lb = 1; bob = -1; }
    if (fr === 'run2') { lf = -3; lb = 3; }
    if (fr === 'run3') { lf = 1; lb = 1; bob = -1; }
    if (fr === 'jump') { lf = 2; lb = -4; bob = -2; }
    // apuntar arriba en diagonal: reusa el ciclo de piernas de correr
    if (fr === 'updiag0') { lf = 3; lb = -3; }
    if (fr === 'updiag1') { lf = 1; lb = 1; bob = -1; }
    if (fr === 'updiag2') { lf = -3; lb = 3; }
    if (fr === 'updiag3') { lf = 1; lb = 1; bob = -1; }
    const oy = bob;

    // pierna con overol amarillo + bota
    const leg = (x, y) => {
      p(suit, x, y, 7, 14); p(suitSh, x, y, 2, 14); p(suitHi, x + 4, y + 1, 1, 11);
      p(suitSh, x, y + 9, 7, 1);                      // pliegue rodilla
      p(boot, x, y + 14, 7, 4); p(bootHi, x, y + 14, 7, 1);
    };

    // --- cabello trasero (melena rubia muy voluminosa y rizada) ---
    p(hair, 1, 3 + oy, 12, 27);                     // mata principal
    p(hair, 0, 8 + oy, 3, 16);                      // onda externa (volumen)
    p(hair, 1, 23 + oy, 5, 11);                     // rizo bajo
    p(hair, 4, 28 + oy, 9, 13);                     // largo que cae
    p(hairMid, 2, 6 + oy, 5, 22); p(hairHi, 3, 9 + oy, 2, 15);
    p(hairHi, 1, 17 + oy, 1, 9);                    // brillo de la onda

    // --- brazo trasero ---
    p(skinSh, 7, 17 + oy, 4, 9);

    // --- piernas ---
    leg(11 + lb, 31 + oy);
    leg(17 + lf, 31 + oy);

    // --- torso: top negro + overol amarillo amarrado a la cintura ---
    p(top, 9, 15 + oy, 15, 14); p(topMid, 9, 15 + oy, 15, 2); p(topHi, 9, 15 + oy, 2, 14);
    p(skin, 16, 15 + oy, 3, 3);                     // escote
    p(skin, 12, 16 + oy, 2, 2);                     // hombro a la vista
    // mangas del overol amarradas a la cintura
    p(suit, 8, 27 + oy, 17, 5); p(suitSh, 8, 30 + oy, 17, 2); p(suitHi, 8, 27 + oy, 17, 1);
    p(suit, 7, 31 + oy, 4, 6); p(suitSh, 7, 31 + oy, 1, 6);     // manga colgando
    p(zip, 16, 17 + oy, 1, 10);                     // cierre del top

    // --- cuello + cabeza ---
    p(skin, 15, 13 + oy, 4, 3);
    p(skin, 11, 4 + oy, 12, 11);
    p(skinSh, 20, 5 + oy, 3, 9); p(skinHi, 12, 5 + oy, 3, 4);
    p(blush, 12, 11 + oy, 2, 1); p(blush, 20, 11 + oy, 2, 1);
    // ojos
    p(eyeW, 13, 8 + oy, 3, 3); p(ink, 14, 8 + oy, 2, 3);
    p(eyeW, 18, 8 + oy, 3, 3); p(ink, 19, 8 + oy, 2, 3);
    p(brow, 13, 6 + oy, 3, 1); p(brow, 18, 6 + oy, 3, 1);
    // boca
    p(lip, 14, 12 + oy, 6, 2); p(teeth, 15, 12 + oy, 4, 1);

    // --- cabello frente/top (rizos voluminosos) + mechón sobre el hombro ---
    p(hair, 8, 0 + oy, 17, 6); p(hairMid, 9, 1 + oy, 15, 2); p(hairHi, 11, 0 + oy, 8, 1);
    p(hair, 8, 5 + oy, 3, 7);                        // fleco izq
    p(hair, 22, 4 + oy, 4, 9);                       // fleco der
    p(hair, 24, 14 + oy, 4, 14); p(hairHi, 25, 16 + oy, 1, 9);  // mechón sobre el hombro

    // --- brazo delantero (guante) + subfusil ---
    if (fr === 'up') {
      // apuntar recto hacia arriba (subfusil vertical)
      p(skin, 18, 17 + oy, 4, 6); p(skin, 20, 12 + oy, 4, 6); p(glove, 22, 9 + oy, 5, 4);
      p(gun, 23, 16 + oy, 5, 8);                       // cuerpo
      p(mag, 19, 19 + oy, 4, 6);                       // cargador recto
      p(gun, 24, 2 + oy, 3, 15); p(gunHi, 24, 2 + oy, 1, 15);   // cañón corto
      p(gun, 24, 0 + oy, 3, 2);                        // boca
    } else if (fr.indexOf('updiag') === 0) {
      // apuntar en diagonal hacia arriba-adelante
      p(skin, 19, 17 + oy, 4, 4); p(skin, 22, 14 + oy, 4, 4); p(glove, 25, 11 + oy, 5, 4);
      p(gun, 19, 22 + oy, 4, 5);                       // cajón
      for (let i = 0; i < 9; i++) p(gun, 21 + i, 20 + oy - i, 3, 3);    // cañón diagonal
      for (let i = 0; i < 9; i++) p(gunHi, 21 + i, 20 + oy - i, 1, 1);
      p(mag, 21, 25 + oy, 3, 5);                       // cargador
      p(gun, 29, 11 + oy, 3, 3);                       // boca
    } else {
      p(skin, 19, 17 + oy, 4, 5); p(skin, 21, 20 + oy, 6, 3);
      p(glove, 26, 20 + oy, 5, 3); p(0x2a2a2a, 26, 20 + oy, 5, 1);
      p(gun, 20, 21 + oy, 4, 6);                       // cajón
      p(gun, 22, 22 + oy, 11, 2); p(gunHi, 22, 22 + oy, 11, 1);   // cañón corto
      p(mag, 22, 24 + oy, 3, 5);                        // cargador recto
      p(gun, 31, 21 + oy, 2, 2);                        // alza
    }
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
  //  CHAIRO  (28 x 48) — 3 variantes: pistola, bazuca, machete
  // -------------------------------------------------------
  _buildChairo(scene) {
    const W = 28, H = 48;
    ['walk0', 'walk1', 'walk2', 'walk3'].forEach(fr => {
      this._sprite(scene, 'chairo_' + fr, W, H, p => this._drawChairo(p, fr, ''));
      this._sprite(scene, 'chairoB_' + fr, 36, H, p => this._drawChairo(p, fr, 'B'));
      this._sprite(scene, 'chairoM_' + fr, W, H, p => this._drawChairo(p, fr, 'M'));
    });
  },

  _drawChairo(p, fr, variant) {
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
    if (variant === 'B') {
      // bandana roja (chairo bazuca)
      p(0xb02a2a, 7, 1 + oy, 14, 5); p(0xd44a4a, 8, 1 + oy, 12, 1);
      p(0xb02a2a, 5, 4 + oy, 3, 6); p(0x8a1f1f, 5, 8 + oy, 2, 3);  // nudo colgando
    } else if (variant === 'M') {
      // greña suelta (chairo machete)
      p(0x1a140d, 7, 1 + oy, 14, 5); p(0x2e2418, 8, 1 + oy, 12, 1);
      p(0x1a140d, 7, 5 + oy, 3, 5); p(0x1a140d, 19, 5 + oy, 3, 4);
    } else {
      p(cap, 7, 1 + oy, 14, 5); p(capHi, 8, 1 + oy, 12, 1); p(cap, 18, 4 + oy, 6, 2);
    }
    p(brow, 10, 7 + oy, 4, 2); p(brow, 15, 7 + oy, 4, 2);
    p(0x111111, 11, 9 + oy, 2, 2); p(0x111111, 16, 9 + oy, 2, 2);
    p(0x111111, 12, 13 + oy, 5, 1);

    // brazo delantero + arma según variante
    if (variant === 'B') {
      // tubo de bazuca al hombro + cohete asomando
      p(skin, 18, 17 + oy, 4, 4); p(skin, 20, 14 + oy, 4, 4);
      p(0x474d33, 6, 11 + oy, 26, 6); p(0x5e6645, 6, 11 + oy, 26, 2);  // tubo
      p(0x2e3322, 6, 11 + oy, 3, 6);                                   // boca trasera
      p(0xd23b2e, 32, 12 + oy, 4, 4);                                  // punta del cohete
    } else if (variant === 'M') {
      // machete por delante
      p(skin, 18, 17 + oy, 4, 4); p(skin, 20, 16 + oy, 4, 4);
      p(0x3a2a18, 23, 16 + oy, 3, 4);                                  // empuñadura
      p(0xc8ccd2, 24, 11 + oy, 3, 6); p(0xc8ccd2, 25, 6 + oy, 3, 7);   // hoja en alto
      p(0xf0f3f6, 26, 6 + oy, 1, 11);                                  // filo
    } else {
      p(skin, 18, 17 + oy, 4, 4); p(skin, 20, 19 + oy, 5, 3);
      p(gun, 24, 19 + oy, 6, 3); p(gunHi, 24, 19 + oy, 6, 1);
    }
  },

  // -------------------------------------------------------
  //  PRISIONERO (30 x 46) — rescatable estilo Metal Slug:
  //  señor de rancho con sombrero, atado con soga.
  // -------------------------------------------------------
  _buildPow(scene) {
    ['tied0', 'tied1', 'free'].forEach(fr => {
      this._sprite(scene, 'pow_' + fr, 30, 46, p => this._drawPow(p, fr));
    });
  },

  _drawPow(p, fr) {
    const skin = 0xd9a066, skinSh = 0xb07f4a;
    const shirt = 0xe6dfc8, shirtSh = 0xc2b896, pant = 0x6b5436, pantSh = 0x4e3d26;
    const hat = 0xd9bc6a, hatSh = 0xb0954a, beard = 0xe8e4da, rope = 0x8a6b45;
    const ink = 0x0a0a0a, boot = 0x3a2a18;
    const oy = fr === 'tied1' ? 1 : 0;
    const free = fr === 'free';

    // piernas (hincado si está atado, parado si está libre)
    p(pant, 9, 31 + oy, 6, 11); p(pantSh, 9, 31 + oy, 2, 11);
    p(pant, 16, 31 + oy, 6, 11); p(pantSh, 16, 31 + oy, 2, 11);
    p(boot, 8, 42 + oy, 7, 3); p(boot, 16, 42 + oy, 7, 3);   // huaraches

    // torso
    p(shirt, 8, 16 + oy, 15, 16); p(shirtSh, 8, 28 + oy, 15, 4); p(shirtSh, 20, 16 + oy, 3, 16);
    if (free) {
      // brazos arriba (¡rescatado!)
      p(shirt, 5, 8 + oy, 4, 10); p(skin, 5, 4 + oy, 4, 5);
      p(shirt, 22, 8 + oy, 4, 10); p(skin, 22, 4 + oy, 4, 5);
    } else {
      // brazos pegados + soga
      p(shirt, 5, 17 + oy, 4, 11); p(shirt, 22, 17 + oy, 4, 11);
      p(rope, 5, 19 + oy, 21, 2); p(rope, 5, 24 + oy, 21, 2);
      p(0x6e5436, 11, 19 + oy, 2, 7);                        // nudo
    }

    // cabeza con barba y sombrero
    p(skin, 10, 6 + oy, 11, 10); p(skinSh, 18, 7 + oy, 3, 8);
    p(beard, 10, 12 + oy, 11, 5); p(0xcfc9bc, 10, 15 + oy, 11, 2);
    p(ink, 12, 9 + oy, 2, 2); p(ink, 17, 9 + oy, 2, 2);
    p(hat, 6, 2 + oy, 19, 4); p(hatSh, 6, 5 + oy, 19, 1);    // ala
    p(hat, 11, 0 + oy, 9, 4); p(hatSh, 11, 0 + oy, 2, 4);    // copa
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
  //  HELICÓPTERO "EL HALCÓN" (104 x 56) — jefe volador del N3.
  //  Verde militar, piloto chairo, cañón de mentón y coheteras.
  // -------------------------------------------------------
  _buildHelo(scene) {
    ['0', '1'].forEach(fr => {
      this._sprite(scene, 'boss_halcon_' + fr, 104, 56, p => this._drawHelo(p, fr));
    });
    if (!scene.anims.exists('boss-halcon')) {
      scene.anims.create({
        key: 'boss-halcon',
        frames: [{ key: 'boss_halcon_0' }, { key: 'boss_halcon_1' }],
        frameRate: 14, repeat: -1,
      });
    }
  },

  _drawHelo(p, fr) {
    const hull = 0x4a5d33, hullHi = 0x6b8049, hullSh = 0x32401f;
    const rotor = 0x1c1c1c, glass = 0x8fd6e8, glassHi = 0xcdf2fa;
    const metal = 0x2a2d31, metalHi = 0x55595e, gold = 0xe9c45a, red = 0xd23b2e;
    const skin = 0xcf9a63, cap = 0x14110d, vest = 0x6e1423;

    // --- rotor principal (2 posiciones de giro = blur) ---
    p(metal, 50, 8, 5, 5);                                  // mástil
    if (fr === '0') { p(rotor, 6, 5, 92, 3); }
    else { p(rotor, 24, 5, 56, 3); p(rotor, 12, 6, 8, 2); p(rotor, 84, 6, 8, 2); }

    // --- botalón de cola (izquierda) + rotor de cola ---
    p(hull, 4, 20, 28, 8); p(hullHi, 4, 20, 28, 2); p(hullSh, 4, 26, 28, 2);
    p(hull, 2, 9, 6, 14); p(hullSh, 6, 9, 2, 14);           // aleta vertical
    p(rotor, 0, fr === '0' ? 8 : 12, 2, fr === '0' ? 16 : 8); // rotor de cola girando
    p(gold, 10, 21, 6, 5);                                  // insignia dorada

    // --- fuselaje (morro a la derecha) ---
    p(hull, 28, 13, 52, 26); p(hullHi, 28, 13, 52, 4); p(hullSh, 28, 33, 52, 6);
    p(hull, 80, 17, 12, 18); p(hullSh, 80, 30, 12, 5);      // morro
    p(hull, 92, 21, 6, 10);                                 // punta
    // cabina con piloto chairo
    p(glass, 62, 16, 18, 12); p(glassHi, 63, 17, 6, 3);
    p(cap, 66, 17, 8, 3); p(skin, 67, 20, 6, 5); p(vest, 66, 25, 8, 3);
    p(0x111111, 68, 21, 2, 2); p(0x111111, 71, 21, 2, 2);   // lentes
    // detalle del costado
    p(hullSh, 34, 22, 22, 2); p(red, 36, 16, 10, 3);        // franja roja

    // --- coheteras bajo las alas cortas ---
    p(metal, 36, 38, 18, 7); p(metalHi, 36, 38, 18, 2);
    p(red, 52, 39, 3, 2); p(red, 52, 42, 3, 2);             // puntas de cohetes
    // --- cañón de mentón (apunta abajo-adelante) ---
    p(metal, 74, 38, 6, 7); p(metal, 78, 43, 10, 4); p(metalHi, 78, 43, 10, 1);

    // --- patines de aterrizaje ---
    p(metal, 40, 44, 3, 7); p(metal, 66, 44, 3, 7);
    p(metalHi, 32, 51, 48, 3);
  },

  // -------------------------------------------------------
  //  TANQUE "El Slug" (74 x 48) — Ita asomada, cañón y orugas
  // -------------------------------------------------------
  _buildTank(scene) {
    const W = 74, H = 48;
    ['0', '1'].forEach(fr => {
      Pixel.sprite(scene, 'tank_body' + fr, W, H, (p, ctx) => this._drawTank(p, ctx, fr));
    });
  },

  _drawTank(p, ctx, fr) {
    const hull = 0x5d6b39, hullHi = 0x83924f, hullSh = 0x3d4824;
    const tread = 0x1f2124, treadHi = 0x3a3d40, wheel = 0x4a4d50, hub = 0x80868c;
    const barrel = 0x2f3236, barrelHi = 0x5a5f64, muzzle = 0x111316;
    const glass = 0x8fe0e0, glassHi = 0xc9f6f6, frame = 0x2e3622, gold = 0xe9c45a;
    const skin = 0xe8b184, hair = 0x4a2e16, hairHi = 0x7a4a22, ink = 0x0a0a0a;

    // --- Orugas (banda + ruedas + cleats que avanzan) ---
    p(tread, 2, 32, 70, 14);
    p(treadHi, 2, 32, 70, 2);
    p(0x101214, 2, 44, 70, 2);
    const arc = (x, y, r, c) => { ctx.fillStyle = Pixel.col(c); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
    [10, 22, 34, 46, 58, 68].forEach(wx => { arc(wx, 38, 5, wheel); arc(wx, 38, 2, hub); });
    const off = fr === '1' ? 4 : 0;
    for (let x = 4; x < 72; x += 8) { p(treadHi, ((x + off) % 70) + 2, 32, 3, 2); p(0x101214, ((x + off + 4) % 70) + 2, 43, 3, 1); }

    // --- Casco / hull (con bisel frontal) ---
    p(hullSh, 6, 28, 60, 6);
    p(hull, 8, 16, 56, 16); p(hullHi, 8, 16, 56, 3); p(hullSh, 8, 29, 56, 3);
    ctx.fillStyle = Pixel.col(hull); ctx.beginPath();
    ctx.moveTo(60, 16); ctx.lineTo(70, 24); ctx.lineTo(60, 32); ctx.fill();   // morro inclinado
    ctx.fillStyle = Pixel.col(hullSh); ctx.beginPath();
    ctx.moveTo(64, 26); ctx.lineTo(70, 24); ctx.lineTo(64, 32); ctx.fill();
    // estrella dorada en el costado
    p(gold, 16, 22, 4, 2); p(gold, 17, 20, 2, 6); p(gold, 14, 23, 8, 2);

    // --- Cabina / domo donde Ita se asoma ---
    p(frame, 22, 4, 22, 13); p(frame, 22, 4, 22, 2);
    p(glass, 24, 7, 18, 9); p(glassHi, 24, 7, 6, 2);
    // Ita asomada
    p(hair, 28, 1, 12, 7); p(hairHi, 29, 2, 3, 3);
    p(skin, 30, 4, 8, 6);
    p(ink, 31, 6, 2, 2); p(ink, 35, 6, 2, 2);   // ojos
    p(0xbe5566, 32, 9, 4, 1);                     // sonrisa

    // --- Cañón (apunta a la derecha) ---
    p(barrel, 40, 19, 30, 7); p(barrelHi, 40, 19, 30, 2);
    p(barrel, 38, 17, 8, 11);                      // base del cañón
    p(muzzle, 68, 18, 5, 9); p(barrelHi, 68, 18, 5, 1);  // boca

    // --- Sombra de contacto inferior ---
    p(0x101214, 6, 45, 62, 1);
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
    mk('ita-up', ['ita_up'], 1, 0);
    mk('ita-updiag', ['ita_updiag0', 'ita_updiag1', 'ita_updiag2', 'ita_updiag3'], 12, -1);
    mk('choco-idle', ['choco_idle0', 'choco_idle1'], 3, -1);
    mk('choco-run', ['choco_run0', 'choco_run1', 'choco_run2', 'choco_run3'], 12, -1);
    mk('choco-jump', ['choco_jump'], 1, 0);
    mk('choco-up', ['choco_up'], 1, 0);
    mk('choco-updiag', ['choco_updiag0', 'choco_updiag1', 'choco_updiag2', 'choco_updiag3'], 12, -1);
    mk('lucky-idle', ['lucky_idle0', 'lucky_idle1'], 4, -1);
    mk('lucky-walk', ['lucky_walk0', 'lucky_walk1'], 9, -1);
    mk('chairo-walk', ['chairo_walk0', 'chairo_walk1', 'chairo_walk2', 'chairo_walk3'], 8, -1);
    mk('chairoB-walk', ['chairoB_walk0', 'chairoB_walk1', 'chairoB_walk2', 'chairoB_walk3'], 7, -1);
    mk('chairoM-walk', ['chairoM_walk0', 'chairoM_walk1', 'chairoM_walk2', 'chairoM_walk3'], 14, -1);
    mk('pow-tied', ['pow_tied0', 'pow_tied1'], 2, -1);
    mk('tank-roll', ['tank_body0', 'tank_body1'], 8, -1);
  },
};

window.CharacterArt = CharacterArt;
