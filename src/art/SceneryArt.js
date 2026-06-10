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
    this._sky(scene, 'sky_malecon',  [0x1f8fcf, 0x7fcfe2, 0xffe6ac]);
    this._sky(scene, 'sky_sierra',   [0x1d2a52, 0x7a5a72, 0xe8915a]);
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
    // --- Sierra de Sinaloa ---
    this._sierraHills(scene);
    this._pine(scene);
    this._agave(scene);
    this._cabin(scene);
    // --- Malecón de Mazatlán ---
    this._sea(scene);
    this._islands(scene);
    this._faro(scene);
    this._railing(scene);
    this._umbrella(scene);
    this._panga(scene);
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

  // ---------- Cerros de la sierra (tileable, sin contorno) ----------
  _sierraHills(scene) {
    const W = 512, H = 220;
    Pixel.sprite(scene, 'sierra_hills', W, H, (p, ctx) => {
      // cordillera lejana (morada por la bruma del atardecer)
      ctx.fillStyle = 'rgba(82,62,92,0.85)';
      ctx.beginPath(); ctx.moveTo(0, H);
      ctx.lineTo(0, 120); ctx.lineTo(90, 46); ctx.lineTo(180, 110); ctx.lineTo(280, 30);
      ctx.lineTo(380, 96); ctx.lineTo(470, 56); ctx.lineTo(512, 100); ctx.lineTo(512, H);
      ctx.fill();
      // cordillera cercana (más oscura) con silueta de pinos en la cresta
      ctx.fillStyle = 'rgba(48,52,42,0.95)';
      ctx.beginPath(); ctx.moveTo(0, H);
      ctx.lineTo(0, 160); ctx.lineTo(120, 96); ctx.lineTo(250, 150); ctx.lineTo(360, 86);
      ctx.lineTo(460, 140); ctx.lineTo(512, 120); ctx.lineTo(512, H);
      ctx.fill();
      const tree = (x, y, s) => {
        ctx.fillStyle = 'rgba(34,38,30,0.95)';
        ctx.beginPath(); ctx.moveTo(x - 5 * s, y); ctx.lineTo(x, y - 14 * s); ctx.lineTo(x + 5 * s, y); ctx.fill();
      };
      tree(60, 130, 1); tree(120, 98, 1.2); tree(200, 130, 0.9); tree(360, 88, 1.2);
      tree(420, 116, 1); tree(490, 126, 0.8);
    }, null);
  },

  // ---------- Pino serrano ----------
  _pine(scene) {
    Pixel.sprite(scene, 'pine', 70, 150, (p, ctx) => {
      const dk = 0x24422a, md = 0x33593a, hi = 0x47734c, trunk = 0x5e4429;
      p(trunk, 31, 96, 8, 54); p(0x4a3520, 31, 96, 3, 54);
      // copa en capas triangulares
      const layer = (y, half, col) => {
        ctx.fillStyle = Pixel.col(col);
        ctx.beginPath(); ctx.moveTo(35 - half, y + 28); ctx.lineTo(35, y); ctx.lineTo(35 + half, y + 28); ctx.fill();
      };
      layer(72, 30, dk); layer(46, 26, md); layer(22, 21, md); layer(2, 16, hi);
      // nieve de luz en las puntas
      p(hi, 33, 2, 4, 4); p(hi, 30, 26, 4, 3);
    });
  },

  // ---------- Maguey / agave ----------
  _agave(scene) {
    Pixel.sprite(scene, 'agave', 64, 46, (p, ctx) => {
      const dk = 0x3f7a52, md = 0x559a68, hi = 0x7fc08a;
      const blade = (x0, y0, x1, y1, w, col) => {
        ctx.strokeStyle = Pixel.col(col); ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y1 - 14, x1, y1); ctx.stroke();
      };
      blade(32, 44, 6, 16, 6, dk); blade(32, 44, 58, 16, 6, dk);
      blade(32, 44, 14, 6, 6, md); blade(32, 44, 50, 6, 6, md);
      blade(32, 44, 24, 2, 7, hi); blade(32, 44, 40, 2, 7, hi);
      blade(32, 44, 32, 0, 7, md);
      p(0x8a6b45, 26, 40, 12, 6);                          // base de tierra
    });
  },

  // ---------- Cabaña serrana (madera + lámina) ----------
  _cabin(scene) {
    Pixel.sprite(scene, 'cabin', 150, 140, (p, ctx) => {
      const wood = 0x8a5f38, woodSh = 0x6b4628, woodHi = 0xa87a4c;
      const roof = 0x707880, roofSh = 0x4e555c;
      // techo de lámina a dos aguas
      ctx.fillStyle = Pixel.col(roof);
      ctx.beginPath(); ctx.moveTo(0, 42); ctx.lineTo(75, 4); ctx.lineTo(150, 42); ctx.fill();
      p(roofSh, 0, 38, 150, 5);
      for (let x = 14; x < 145; x += 18) p(roofSh, x, 16 + Math.abs(75 - x) / 4, 3, 22);  // canales
      // muros de tablones
      p(wood, 10, 42, 130, 98); p(woodHi, 10, 42, 130, 4);
      for (let y = 56; y < 138; y += 14) p(woodSh, 10, y, 130, 2);
      // puerta y ventana con luz cálida
      p(0x3a2a18, 62, 88, 26, 52); p(0x52391f, 64, 90, 22, 4);
      p(0x2a1d12, 22, 66, 26, 24); p(0xffd86a, 25, 69, 20, 18);
      p(0x2a1d12, 102, 66, 26, 24); p(0xffd86a, 105, 69, 20, 18);
    });
  },

  // ---------- Mar (banda de oleaje, tileable) ----------
  _sea(scene) {
    Pixel.sprite(scene, 'sea', 128, 150, (p, ctx) => {
      const top = 0x2f74a8, mid = 0x3f93bf, low = 0x5db4d0, foam = 0xbfe6ef;
      p(top, 0, 0, 128, 46); p(mid, 0, 46, 128, 54); p(low, 0, 100, 128, 50);
      p(foam, 0, 0, 128, 3);                          // línea de horizonte
      // crestas de oleaje escalonadas
      for (let y = 12; y < 150; y += 15) {
        const off = ((y / 15) % 2) * 12;
        for (let x = off; x < 128; x += 26) p(foam, x, y, 11, 2);
      }
    }, null);
  },

  // ---------- Islas lejanas (las tres islas de Mazatlán) ----------
  _islands(scene) {
    Pixel.sprite(scene, 'islands', 512, 120, (p, ctx) => {
      const dome = (cx, r, col) => {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(cx, 120, r, Math.PI, Math.PI * 2); ctx.fill();
      };
      dome(120, 70, 'rgba(64,92,108,0.85)');
      dome(250, 96, 'rgba(54,80,96,0.9)');           // la más grande (Isla de Venados)
      dome(400, 64, 'rgba(70,98,114,0.82)');
      // bruma en la base
      p(0x9fc9d6, 0, 112, 512, 8);
    }, null);
  },

  // ---------- Faro de Mazatlán (sobre cerro rocoso) ----------
  _faro(scene) {
    Pixel.sprite(scene, 'faro', 96, 250, (p, ctx) => {
      const rock = 0x6e6256, rockSh = 0x4e463c, rockHi = 0x8a7d6c, green = 0x4f7a3c;
      const tower = 0xf2efe6, towerSh = 0xccc4b2, red = 0xd23b2e, redSh = 0x9e2a20;
      const glass = 0xffe9a0, deck = 0x33373a;
      // cerro
      ctx.fillStyle = Pixel.col(rock);
      ctx.beginPath(); ctx.moveTo(0, 250); ctx.lineTo(26, 150); ctx.lineTo(54, 196); ctx.lineTo(96, 250); ctx.fill();
      p(rockSh, 0, 214, 96, 36);
      p(rockHi, 22, 152, 8, 36);
      p(green, 60, 196, 22, 10); p(green, 8, 220, 18, 8);   // matorrales
      // torre blanca
      p(tower, 34, 44, 24, 110); p(towerSh, 52, 44, 6, 110);
      p(tower, 30, 150, 32, 20); p(towerSh, 54, 150, 8, 20);  // base ensanchada
      // galería
      p(deck, 30, 36, 32, 10);
      // linterna (rojo) + vidrio
      p(red, 34, 16, 24, 20); p(redSh, 52, 16, 6, 20);
      p(glass, 39, 20, 14, 12);
      p(red, 37, 6, 18, 10); p(redSh, 50, 6, 5, 10);          // cúpula
      p(0xffffff, 41, 22, 6, 4);                              // destello
    });
  },

  // ---------- Barandal del malecón (balaustrada blanca, tileable) ----------
  _railing(scene) {
    Pixel.sprite(scene, 'railing', 64, 50, (p, ctx) => {
      const wh = 0xf2ead6, sh = 0xcabd9c, base = 0xbfae86;
      p(base, 0, 44, 64, 6);                          // zócalo corrido
      p(wh, 0, 8, 64, 6); p(sh, 0, 14, 64, 2);        // pasamanos superior
      for (let x = 3; x < 64; x += 12) { p(wh, x, 16, 6, 28); p(sh, x + 4, 16, 2, 28); }  // balaustres
      p(wh, 0, 0, 64, 5); p(sh, 0, 5, 64, 1);         // remate
    });
  },

  // ---------- Sombrilla de playa ----------
  _umbrella(scene) {
    Pixel.sprite(scene, 'umbrella', 76, 98, (p, ctx) => {
      const pole = 0x8a6b45, poleHi = 0xab8a5c, red = 0xe23b3b, white = 0xf4f0e6;
      const cx = 38, cy = 44, r = 34;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = Pixel.col(i % 2 ? red : white);
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); ctx.fill();
      }
      p(0xb02a2a, 4, 42, 68, 4);                       // borde
      p(pole, 36, 44, 4, 48); p(poleHi, 36, 44, 1, 48);
      p(0xe4cd92, 26, 90, 24, 8);                       // montículo de arena
    });
  },

  // ---------- Panga (lancha de pescador, flota en el mar) ----------
  _panga(scene) {
    Pixel.sprite(scene, 'panga', 88, 40, (p, ctx) => {
      const hull = 0x2f6fa0, hullHi = 0x57a0c4, trim = 0xe8c038, mast = 0x8a5a2a, sail = 0xf4f0e6;
      ctx.fillStyle = Pixel.col(hull);
      ctx.beginPath(); ctx.moveTo(6, 14); ctx.lineTo(82, 14); ctx.lineTo(70, 34); ctx.lineTo(18, 34); ctx.fill();
      p(trim, 6, 14, 76, 4); p(hullHi, 10, 30, 60, 3);
      p(mast, 40, 0, 4, 14);                            // mástil
      ctx.fillStyle = Pixel.col(sail);
      ctx.beginPath(); ctx.moveTo(44, 1); ctx.lineTo(60, 13); ctx.lineTo(44, 13); ctx.fill();  // vela
    });
  },

  // -------------------------------------------------------
  //  Construir el fondo del nivel (capas parallax)
  // -------------------------------------------------------
  buildLevelBackground(scene, theme, W) {
    const gy = CONST.GROUND_Y;

    // El malecón de Mazatlán y la sierra tienen su propia composición.
    if (theme === 'malecon') { this._buildMalecon(scene, W, gy); return; }
    if (theme === 'sierra') { this._buildSierra(scene, W, gy); return; }

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

  // -------------------------------------------------------
  //  Fondo de la Sierra (cordilleras, pinos, cabañas, magueyes)
  // -------------------------------------------------------
  _buildSierra(scene, W, gy) {
    // cielo de atardecer serrano
    scene.add.image(0, 0, 'sky_sierra').setOrigin(0, 0).setScrollFactor(0).setDepth(-30);

    // cordilleras al fondo (doble capa de parallax)
    scene.add.tileSprite(0, gy - 200, W, 220, 'sierra_hills')
      .setOrigin(0, 0).setScrollFactor(0.18).setDepth(-26);
    scene.add.tileSprite(0, gy - 130, W, 220, 'sierra_hills')
      .setOrigin(0, 0).setScrollFactor(0.38).setDepth(-24).setTint(0x9a8a9a).setAlpha(0.8);

    // cabañas y pinos en la capa media
    let i = 0;
    for (let x = 200; x < W; x += 460) {
      if (i % 3 === 1) {
        scene.add.image(x, gy + 10, 'cabin').setOrigin(0.5, 1).setScrollFactor(0.55)
          .setDepth(-19).setScale(0.95).setTint(0xd8c8c0);
      } else {
        scene.add.image(x, gy + 8, 'pine').setOrigin(0.5, 1).setScrollFactor(0.55)
          .setDepth(-20).setScale(0.9).setTint(0xb8a8b0);
      }
      i++;
    }

    // magueyes a media distancia
    for (let x = 340; x < W - 160; x += 530) {
      scene.add.image(x, gy + 8, 'agave').setOrigin(0.5, 1).setScrollFactor(0.8)
        .setDepth(-12).setTint(0xd0c8b8);
    }

    // pinos y magueyes en primer plano
    for (let x = 280; x < W - 180; x += 560) {
      scene.add.image(x, gy + 6, 'pine').setOrigin(0.5, 1).setScrollFactor(1).setDepth(2).setScale(1.1);
    }
    for (let x = 520; x < W - 160; x += 640) {
      scene.add.image(x, gy + 8, 'agave').setOrigin(0.5, 1).setScrollFactor(1).setDepth(3);
    }

    // props de guerra (sacos, tambos, escombros) para cobertura visual
    for (let x = 640; x < W - 240; x += 520) {
      scene.add.image(x, gy + 9, 'sandbags').setOrigin(0.5, 1).setScrollFactor(1)
        .setDepth(4).setScale(1.15);
    }
    for (let x = 420, j = 0; x < W - 200; x += 620, j++) {
      const img = scene.add.image(x, gy + 9, 'barrel').setOrigin(0.5, 1).setScrollFactor(1).setDepth(4);
      if (j % 2 === 1) img.setFlipX(true);
    }
    for (let x = 220; x < W; x += 340) {
      scene.add.image(x, gy + 12, 'rubble').setOrigin(0.5, 1).setScrollFactor(1).setDepth(3).setAlpha(0.95);
    }

    // viñeta atmosférica
    scene.add.image(0, 0, 'vignette').setOrigin(0, 0).setScrollFactor(0).setDepth(900);
  },

  // -------------------------------------------------------
  //  Fondo del Malecón de Mazatlán (mar, islas, faro, barandal)
  // -------------------------------------------------------
  _buildMalecon(scene, W, gy) {
    // cielo tropical
    scene.add.image(0, 0, 'sky_malecon').setOrigin(0, 0).setScrollFactor(0).setDepth(-30);

    // mar en el horizonte (debajo lo tapa el suelo del malecón)
    scene.add.tileSprite(0, gy - 152, W, 190, 'sea').setOrigin(0, 0).setScrollFactor(0.25).setDepth(-26);
    // las tres islas, en grupos dispersos sobre el horizonte
    for (let x = 240; x < W; x += 1600) {
      scene.add.image(x, gy - 98, 'islands').setOrigin(0.5, 1).setScrollFactor(0.32)
        .setDepth(-25).setScale(0.8);
    }

    // pangas meciéndose en el mar
    for (let x = 300, i = 0; x < W; x += 760, i++) {
      const b = scene.add.image(x, gy - 92, 'panga').setOrigin(0.5, 1).setScrollFactor(0.4)
        .setDepth(-24).setScale(0.9);
      if (i % 2) b.setFlipX(true);
      scene.tweens.add({ targets: b, y: b.y - 5, yoyo: true, repeat: -1, duration: 1400 + i * 130, ease: 'Sine.inOut' });
    }

    // faros como puntos de referencia
    for (let x = 470, i = 0; x < W; x += 1550, i++) {
      scene.add.image(x, gy + 10, 'faro').setOrigin(0.5, 1).setScrollFactor(0.55).setDepth(-20).setScale(0.95);
    }

    // palmeras lejanas (parallax medio)
    for (let x = 220; x < W; x += 360) {
      scene.add.image(x, gy + 8, 'palm').setOrigin(0.5, 1).setScrollFactor(0.8).setDepth(-12)
        .setScale(0.95).setTint(0xdfeecb);
    }

    // barandal del malecón detrás de la acción
    scene.add.tileSprite(0, gy - 38, W, 50, 'railing').setOrigin(0, 0).setScrollFactor(1).setDepth(1);

    // palmeras y sombrillas en primer plano
    for (let x = 360; x < W - 160; x += 520) {
      scene.add.image(x, gy + 6, 'palm').setOrigin(0.5, 1).setScrollFactor(1).setDepth(2).setScale(1.1);
    }
    for (let x = 540, i = 0; x < W - 160; x += 470, i++) {
      const u = scene.add.image(x, gy + 8, 'umbrella').setOrigin(0.5, 1).setScrollFactor(1).setDepth(3);
      if (i % 2) u.setFlipX(true);
    }

    // unos tambos de cobertura (sin saturar la playa)
    for (let x = 780, i = 0; x < W - 200; x += 900, i++) {
      const img = scene.add.image(x, gy + 9, 'barrel').setOrigin(0.5, 1).setScrollFactor(1).setDepth(4);
      if (i % 2) img.setFlipX(true);
    }

    // viñeta atmosférica
    scene.add.image(0, 0, 'vignette').setOrigin(0, 0).setScrollFactor(0).setDepth(900);
  },
};

window.SceneryArt = SceneryArt;
