// ============================================================
//  PickupArt — cajas de pertrechos pixel-art (una por tipo).
//  Caja de madera con marco metálico + franja de color que
//  identifica el arma, e icono del arma encima. Estilo Metal Slug.
// ============================================================

const PickupArt = {
  // banda de color por tipo: [color, brillo]
  BANDS: {
    cuerno:   [0xff9933, 0xffc266],
    escopeta: [0xff5555, 0xff8a8a],
    bazuca:   [0xcfcfcf, 0xf0f0f0],
    vida:     [0x4be36a, 0x8af0a0],
    lucky:    [0xffc24a, 0xffe09a],
    tanque:   [0x9fb45a, 0xc4d488],
  },

  build(scene) {
    Object.keys(this.BANDS).forEach(type => {
      Pixel.sprite(scene, 'pickup_' + type, 44, 40, (p, ctx) => {
        const b = this.BANDS[type];
        this._crate(p, b[0], b[1]);
        this['_icon_' + type](p, ctx);
      });
    });
  },

  // ---------- Caja base (madera + marco metálico + franja) ----------
  _crate(p, band, bandHi) {
    const wood = 0xa9763a, woodHi = 0xc6924c, woodSh = 0x6e4a22;
    const metal = 0x4a4030, metalHi = 0x6e6048, bolt = 0xc9cf9a;
    p(wood, 5, 5, 34, 33); p(woodHi, 5, 5, 34, 3); p(woodSh, 5, 33, 34, 5);
    p(woodSh, 21, 5, 1, 33);                          // junta central
    // esquineras metálicas
    p(metal, 5, 5, 34, 4); p(metal, 5, 34, 34, 4);
    p(metal, 5, 5, 4, 33); p(metal, 35, 5, 4, 33);
    p(metalHi, 5, 5, 34, 1); p(metalHi, 5, 5, 1, 33);
    [[7, 7], [35, 7], [7, 34], [35, 34]].forEach(([x, y]) => p(bolt, x, y, 2, 2));
    // franja de color (código por arma)
    p(band, 6, 14, 32, 14); p(bandHi, 6, 14, 32, 2); p(0x14110a, 6, 27, 32, 1);
  },

  // ---------- Iconos de arma ----------
  _icon_cuerno(p) {                 // AK / cuerno de chivo
    const gun = 0x232323, gmHi = 0x5a5a5a, wd = 0x7a4a1f;
    p(wd, 9, 18, 4, 5);
    p(gun, 12, 19, 18, 3); p(gmHi, 12, 19, 18, 1);
    p(gun, 29, 18, 4, 2);
    p(gun, 17, 22, 3, 6); p(gun, 19, 26, 3, 3);       // cargador curvo
    p(gun, 14, 22, 2, 3);
  },

  _icon_escopeta(p) {               // recortada (dos cañones)
    const gun = 0x232323, gmHi = 0x5a5a5a, wd = 0x7a4a1f;
    p(gun, 10, 18, 16, 2); p(gmHi, 10, 18, 16, 1);
    p(gun, 10, 21, 16, 2);
    p(wd, 24, 17, 7, 9);
    p(wd, 13, 23, 3, 6);
  },

  _icon_bazuca(p, ctx) {            // RPG (tubo + ojiva)
    const gun = 0x39392f, gmHi = 0x66664f, warhead = 0x9a3b2a;
    p(gun, 8, 18, 18, 5); p(gmHi, 8, 18, 18, 1);
    ctx.fillStyle = Pixel.col(warhead);
    ctx.beginPath(); ctx.moveTo(26, 16); ctx.lineTo(34, 20.5); ctx.lineTo(26, 25); ctx.fill();
    p(gun, 12, 23, 4, 5);
    p(gun, 6, 16, 3, 3);
  },

  _icon_vida(p) {                   // botiquín (cruz roja)
    const wht = 0xf4f4ee, red = 0xe23b3b, redSh = 0xb02a2a;
    p(wht, 13, 14, 16, 14);
    p(red, 19, 16, 4, 10); p(red, 15, 19, 12, 4);
    p(redSh, 19, 24, 4, 2);
  },

  _icon_lucky(p) {                  // hueso (Lucky)
    const cream = 0xf2e4bf, creamSh = 0xcbb98c;
    p(cream, 15, 20, 14, 3);
    p(cream, 12, 17, 5, 4); p(cream, 12, 22, 5, 4);
    p(cream, 27, 17, 5, 4); p(cream, 27, 22, 5, 4);
    p(creamSh, 15, 22, 14, 1);
  },

  _icon_tanque(p) {                 // tanque
    const olv = 0x5d6b39, olvHi = 0x83924f, trk = 0x222426, gun = 0x33352f;
    p(olv, 10, 21, 22, 5); p(olvHi, 10, 21, 22, 1);
    p(olv, 15, 17, 12, 5);
    p(gun, 25, 18, 11, 2);
    p(trk, 11, 26, 20, 3);
  },
};

window.PickupArt = PickupArt;
