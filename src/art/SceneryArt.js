// ============================================================
//  SceneryArt — fondos pixel-art en capas (parallax) con
//  contorno estilo Metal Slug. Inspirado en Sinaloa:
//  Catedral de Culiacán, Mercado Garmendia, Jardín Botánico.
// ============================================================

const SceneryArt = {

  build(scene) {
    this._vignette(scene);
    this._sky(scene, 'sky_culiacan', [0x274a6e, 0x6e7f8c, 0xe79a52]);
    this._sky(scene, 'sky_jardin',   [0x6fb0d6, 0x9fc9c0, 0xd9ecb0]);
    this._skyline(scene);
    this._colonial(scene);
    this._market(scene);
    this._cathedral(scene);
    this._house(scene);
    this._palm(scene);
    this._planter(scene);
    this._sandbags(scene);
    this._barrel(scene);
    this._rubble(scene);
  },

  // ---------- Sacos terreros (barricada estilo Metal Slug) ----------
  _sandbags(scene) {
    Pixel.sprite(scene, 'sandbags', 76, 44, (p, ctx) => {
      const tan = 0xb89a5e, tanSh = 0x8f7440, tanHi = 0xd4b87a, str = 0x6e5a30;
      const bag = (x, y) => {
        p(tan, x, y, 18, 11); p(tanHi, x, y, 18, 3); p(tanSh, x, y + 8, 18, 3);
        p(str, x + 8, y, 2, 11);              // costura
        p(tanSh, x, y, 2, 11);
      };
      // tres hileras escalonadas
      for (let i = 0; i < 4; i++) bag(2 + i * 18, 32);
      for (let i = 0; i < 3; i++) bag(11 + i * 18, 21);
      for (let i = 0; i < 2; i++) bag(20 + i * 18, 10);
    });
  },

  // ---------- Tambo de petróleo (oxidado, con franja de peligro) ----------
  _barrel(scene) {
    Pixel.sprite(scene, 'barrel', 30, 44, (p, ctx) => {
      const body = 0xb44a2a, bodyHi = 0xd66a44, bodySh = 0x7e3018, ring = 0x3a2418;
      p(body, 4, 2, 22, 40); p(bodyHi, 6, 2, 4, 40); p(bodySh, 22, 2, 4, 40);
      p(ring, 4, 2, 22, 3); p(ring, 4, 39, 22, 3);
      p(ring, 4, 19, 22, 3);
      // franja de peligro
      p(0xe8c038, 4, 9, 22, 6);
      for (let x = 4; x < 26; x += 6) p(0x1c1c1c, x, 9, 3, 6);
      p(0x2a1810, 9, 5, 12, 2);             // tapa
    });
  },

  // ---------- Escombros / cascajo (textura de guerra MS) ----------
  _rubble(scene) {
    Pixel.sprite(scene, 'rubble', 64, 22, (p, ctx) => {
      const a = 0x7a6450, b = 0x5e4c3a, c = 0x9a836a, d = 0x3e3226;
      p(b, 0, 10, 64, 12);
      const chunk = (x, y, w, h, col) => { p(col, x, y, w, h); p(d, x, y + h - 1, w, 1); };
      chunk(2, 12, 12, 8, a); chunk(16, 14, 9, 6, c); chunk(27, 11, 14, 9, a);
      chunk(43, 13, 10, 7, c); chunk(54, 12, 9, 8, a);
      p(c, 6, 9, 4, 3); p(c, 33, 8, 5, 3); p(c, 49, 9, 4, 3);
    });
  },

  // ---------- Viñeta atmosférica (marco cinemático estilo MS) ----------
  _vignette(scene) {
    const W = CONST.WIDTH, H = CONST.HEIGHT;
    Pixel.sprite(scene, 'vignette', W, H, (p, ctx) => {
      const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.28, W / 2, H / 2, H * 0.9);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.72, 'rgba(18,9,7,0.12)');
      g.addColorStop(1, 'rgba(8,5,5,0.58)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // franjas oscuras arriba/abajo para encuadre
      const tg = ctx.createLinearGradient(0, 0, 0, 60);
      tg.addColorStop(0, 'rgba(8,5,8,0.5)'); tg.addColorStop(1, 'rgba(8,5,8,0)');
      ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 60);
    }, null);
  },

  // ---------- Cielo (gradiente + sol + nubes), sin contorno ----------
  _sky(scene, key, colors) {
    const W = CONST.WIDTH, H = CONST.HEIGHT;
    Pixel.sprite(scene, key, W, H, (p, ctx) => {
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, Pixel.col(colors[0]));
      gr.addColorStop(0.55, Pixel.col(colors[1]));
      gr.addColorStop(1, Pixel.col(colors[2]));
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      // sol
      ctx.fillStyle = 'rgba(255,238,190,0.9)';
      ctx.beginPath(); ctx.arc(W * 0.72, H * 0.3, 46, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,210,140,0.22)';
      ctx.beginPath(); ctx.arc(W * 0.72, H * 0.3, 72, 0, 7); ctx.fill();
      // nubes
      const cloud = (cx, cy, s, a) => {
        ctx.fillStyle = `rgba(240,225,200,${a})`;
        ctx.beginPath(); ctx.ellipse(cx, cy, 90 * s, 30 * s, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - 42 * s, cy + 8 * s, 58 * s, 22 * s, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 46 * s, cy + 6 * s, 62 * s, 22 * s, 0, 0, 7); ctx.fill();
      };
      cloud(180, 90, 1.0, 0.55); cloud(540, 70, 1.3, 0.45);
      cloud(770, 140, 0.9, 0.5); cloud(360, 160, 0.8, 0.38);
    }, null);
  },

  // ---------- Silueta lejana, sin contorno ----------
  _skyline(scene) {
    const W = 512, H = 200;
    Pixel.sprite(scene, 'skyline_far', W, H, (p, ctx) => {
      // cerros
      ctx.fillStyle = 'rgba(74,90,106,0.7)';
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(120, H - 90); ctx.lineTo(240, H); ctx.fill();
      ctx.beginPath(); ctx.moveTo(200, H); ctx.lineTo(360, H - 120); ctx.lineTo(512, H); ctx.fill();
      // edificios
      let x = 0;
      while (x < W) {
        const bw = 30 + (x * 7 % 36), bh = 60 + (x * 13 % 90);
        p(0x394757, x, H - bh, bw, bh);
        x += bw + 6;
      }
    }, null);
  },

  // ---------- Edificio colonial crema ----------
  _colonial(scene) {
    Pixel.sprite(scene, 'colonial', 150, 220, (p, ctx) => {
      p(0xe9dcc0, 0, 0, 150, 220);
      p(0xd8c49e, 0, 0, 150, 10);
      p(0xcbb488, 0, 206, 150, 14);
      for (let yy = 28; yy < 180; yy += 56) {
        for (let xx = 16; xx < 122; xx += 46) {
          p(0x6b4f3a, xx, yy, 24, 34);
          p(0x8a6b4f, xx + 3, yy + 4, 18, 6);
        }
      }
      p(0xbfa784, 0, 0, 150, 2); p(0xbfa784, 0, 218, 150, 2);
    });
  },

  // ---------- Mercado Garmendia (amarillo con arcos) ----------
  _market(scene) {
    Pixel.sprite(scene, 'market', 240, 150, (p, ctx) => {
      p(0xf2c14e, 0, 0, 240, 150);
      p(0xe0a92e, 0, 0, 240, 16);
      p(0xc98f1f, 0, 16, 240, 4);
      // arcos
      for (let xx = 14; xx < 220; xx += 42) {
        p(0x5b3b22, xx, 80, 28, 70);
        ctx.fillStyle = Pixel.col(0x5b3b22);
        ctx.beginPath(); ctx.arc(xx + 14, 80, 14, Math.PI, 0); ctx.fill();
        ctx.fillStyle = Pixel.col(0x7a5436);
        ctx.beginPath(); ctx.arc(xx + 14, 82, 10, Math.PI, 0); ctx.fill();
      }
      for (let xx = 18; xx < 222; xx += 40) p(0xfff3cf, xx, 28, 22, 26);
      p(0x8a1c2e, 64, 4, 112, 12);
    });
  },

  // ---------- Catedral de Culiacán (dos torres) ----------
  _cathedral(scene) {
    Pixel.sprite(scene, 'cathedral', 200, 300, (p, ctx) => {
      const cream = 0xf3ead2, creamSh = 0xddccaa, roof = 0x9c6b3f, dark = 0x6b4f3a, gold = 0xd9b24a;
      const tri = (x1, y1, x2, y2, x3, y3, c) => {
        ctx.fillStyle = Pixel.col(c);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.fill();
      };
      p(cream, 60, 90, 80, 210); p(creamSh, 60, 90, 8, 210);
      tri(60, 90, 100, 56, 140, 90, cream);
      p(dark, 86, 210, 28, 90);
      ctx.fillStyle = Pixel.col(0x8a6b4f); ctx.beginPath(); ctx.arc(100, 210, 14, Math.PI, 0); ctx.fill();
      ctx.fillStyle = Pixel.col(gold); ctx.beginPath(); ctx.arc(100, 150, 12, 0, 7); ctx.fill();
      ctx.fillStyle = Pixel.col(cream); ctx.beginPath(); ctx.arc(100, 150, 6, 0, 7); ctx.fill();
      const tower = (tx) => {
        p(cream, tx, 70, 40, 230); p(creamSh, tx, 70, 6, 230);
        p(dark, tx + 8, 96, 10, 22); p(dark, tx + 22, 96, 10, 22);
        tri(tx - 4, 70, tx + 20, 30, tx + 44, 70, roof);
        p(gold, tx + 18, 16, 4, 16); p(gold, tx + 13, 20, 14, 4);
      };
      tower(20); tower(140);
    });
  },

  // ---------- Casa sinaloense (decoración / soporte de plataforma) ----------
  _house(scene) {
    Pixel.sprite(scene, 'house', 150, 170, (p, ctx) => {
      const wall = 0xd97b46, wallSh = 0xb45f33, wallHi = 0xe99a68;
      p(wall, 0, 20, 150, 150);
      p(wallHi, 0, 20, 150, 6);
      p(wallSh, 0, 150, 150, 20);
      // pretil / azotea
      p(0xc26336, 0, 8, 150, 16);
      p(0x8a3f22, 0, 8, 150, 4);
      // puerta
      p(0x4a2c17, 62, 104, 26, 66);
      p(0x6b4226, 64, 106, 22, 4);
      // ventanas con marco
      const win = (x, y) => { p(0x2a1d12, x, y, 30, 30); p(0x7fb3c9, x + 4, y + 4, 22, 22); p(0xffffff, x + 4, y + 4, 22, 4); };
      win(16, 52); win(104, 52);
      // teja decorativa
      p(0x8a3f22, 0, 24, 150, 3);
    });
  },

  // ---------- Palmera ----------
  _palm(scene) {
    Pixel.sprite(scene, 'palm', 90, 170, (p, ctx) => {
      for (let i = 0; i < 10; i++) p(0x8a6b45, 40 + ((i * 3) % 5), 150 - i * 12, 12, 13);
      p(0x6e5436, 40, 140, 12, 30);
      const frond = (ang, len) => {
        for (let t = 0; t < len; t += 4) {
          const x = 46 + Math.cos(ang) * t;
          const y = 32 + Math.sin(ang) * t + (t * t) * 0.004;
          p(t < len * 0.6 ? 0x3f8f3a : 0x2f7030, x, y, 6, 6);
        }
      };
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) frond(a, 52);
      ctx.fillStyle = Pixel.col(0x6b4f2a); ctx.beginPath(); ctx.arc(46, 34, 6, 0, 7); ctx.fill();
    });
  },

  // ---------- Jardinera con flores ----------
  _planter(scene) {
    Pixel.sprite(scene, 'planter', 90, 56, (p, ctx) => {
      for (let i = 0; i < 7; i++) p(0x2f7d33, 6 + i * 12, 10 + (i % 2) * 6, 10, 28);
      for (let i = 0; i < 6; i++) p(0x46a04a, 10 + i * 13, 6, 7, 20);
      const fl = [0xf2c14e, 0xe2503b, 0xf2c14e, 0xe2503b, 0xffd86a];
      for (let i = 0; i < 5; i++) { ctx.fillStyle = Pixel.col(fl[i]); ctx.beginPath(); ctx.arc(14 + i * 16, 8, 5, 0, 7); ctx.fill(); }
      p(0x9a8a76, 2, 36, 86, 20);
      p(0x7d6e5c, 2, 36, 86, 5);
    });
  },

  // -------------------------------------------------------
  //  Construir el fondo del nivel (capas parallax)
  // -------------------------------------------------------
  buildLevelBackground(scene, theme, W) {
    const gy = CONST.GROUND_Y;

    scene.add.image(0, 0, theme === 'jardin' ? 'sky_jardin' : 'sky_culiacan')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-30);

    scene.add.tileSprite(0, gy - 150, W, 200, 'skyline_far')
      .setOrigin(0, 0).setScrollFactor(0.2).setDepth(-25);

    // capa media: landmarks / casas (scrollFactor 0.5)
    if (theme === 'jardin') {
      let i = 0;
      for (let x = 80; x < W; x += 240) {
        const key = (i % 2 === 0) ? 'house' : 'colonial';
        scene.add.image(x, gy + 12, key).setOrigin(0.5, 1).setScrollFactor(0.5).setDepth(-20)
          .setScale(0.85).setTint(0xe3eccb);
        i++;
      }
    } else {
      let t = 0;
      for (let x = 120; x < W; x += 280) {
        const key = t % 4 === 1 ? 'cathedral' : t % 4 === 2 ? 'market' : t % 4 === 3 ? 'house' : 'colonial';
        scene.add.image(x, gy + 12, key).setOrigin(0.5, 1).setScrollFactor(0.5)
          .setDepth(key === 'market' ? -19 : -20);
        t++;
      }
    }

    // primer plano: palmeras y jardineras (scrollFactor 1, detrás del jugador)
    const palmStep = theme === 'jardin' ? 420 : 680;
    for (let x = 260; x < W - 200; x += palmStep) {
      scene.add.image(x, gy + 6, 'palm').setOrigin(0.5, 1).setScrollFactor(1).setDepth(2).setScale(1.05);
    }
    const planterStep = theme === 'jardin' ? 320 : 560;
    for (let x = 420; x < W - 200; x += planterStep) {
      scene.add.image(x, gy + 8, 'planter').setOrigin(0.5, 1).setScrollFactor(1).setDepth(3);
    }

    // --- Props "de guerra" estilo Metal Slug (sacos, tambos, escombros) ---
    // Se reparten de forma determinista para servir de cobertura/decoración.
    for (let x = 520, i = 0; x < W - 240; x += 470, i++) {
      scene.add.image(x, gy + 9, 'sandbags').setOrigin(0.5, 1).setScrollFactor(1)
        .setDepth(4).setScale(1.15);
    }
    for (let x = 360, i = 0; x < W - 200; x += 540, i++) {
      const img = scene.add.image(x, gy + 9, 'barrel').setOrigin(0.5, 1).setScrollFactor(1).setDepth(4);
      if (i % 2 === 1) img.setFlipX(true);
    }
    for (let x = 180; x < W; x += 300) {
      scene.add.image(x, gy + 12, 'rubble').setOrigin(0.5, 1).setScrollFactor(1).setDepth(3).setAlpha(0.95);
    }

    // viñeta atmosférica fija (encuadra y oscurece los bordes)
    scene.add.image(0, 0, 'vignette').setOrigin(0, 0).setScrollFactor(0).setDepth(900);
  },
};

window.SceneryArt = SceneryArt;
