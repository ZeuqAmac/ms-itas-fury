// ============================================================
//  BootScene — genera TODO el arte por código (sin imágenes)
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this.genBullets();
    this.genFx();
    this.genSlash();
    this.genCrate();
    this.genGround();
    this.genGroundMalecon();
    this.genGroundSierra();
    this.genGoal();
    this.genGrenade();
    this.genBomb();
    this.genRocket();
    this.genAimArrow();
    this.genPlatform();

    // Sprites pixel-art + fondos + cajas de pertrechos
    CharacterArt.build(this);
    SceneryArt.build(this);
    PickupArt.build(this);

    this.scene.start('MenuScene');
  }

  // --- Balas ---
  genBullets() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 20, 6, 3);
    g.generateTexture('bullet', 20, 6);
    g.clear();
    g.fillStyle(0xff5a3c, 1).fillCircle(7, 7, 7);
    g.fillStyle(0xffd0a0, 1).fillCircle(5, 5, 3);
    g.generateTexture('ebullet', 14, 14);
    g.clear();
    g.fillStyle(0x88f4ff, 1).fillRoundedRect(0, 0, 16, 6, 3);
    g.generateTexture('lbullet', 16, 6);
    g.destroy();
  }

  // --- Efectos: spark, glow, humo, casquillo, polvo ---
  genFx() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1).fillCircle(8, 8, 8);
    g.generateTexture('spark', 16, 16);
    g.clear();
    // glow radial suave
    for (let r = 16; r > 0; r--) {
      g.fillStyle(0xffffff, 0.06).fillCircle(16, 16, r);
    }
    g.generateTexture('glow', 32, 32);
    g.clear();
    // humo
    g.fillStyle(0xffffff, 1).fillCircle(12, 12, 12);
    g.generateTexture('smoke', 24, 24);
    g.clear();
    // casquillo
    g.fillStyle(0xd9b24a, 1).fillRect(0, 0, 5, 3);
    g.generateTexture('casing', 5, 3);
    g.clear();
    // polvo
    g.fillStyle(0xffffff, 1).fillCircle(6, 6, 6);
    g.generateTexture('dust', 12, 12);
    g.destroy();
  }

  // --- Tajo de cuchillo (medialuna estilo Metal Slug) ---
  genSlash() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = 30, cy = 32, r = 24;
    const a0 = Phaser.Math.DegToRad(-74), a1 = Phaser.Math.DegToRad(74);
    // contorno oscuro
    g.lineStyle(11, 0x10151c, 1);
    g.beginPath(); g.arc(cx, cy, r, a0, a1, false); g.strokePath();
    // filo blanco grueso
    g.lineStyle(8, 0xffffff, 1);
    g.beginPath(); g.arc(cx, cy, r, a0, a1, false); g.strokePath();
    // brillo celeste interior
    g.lineStyle(3, 0x9fe9ff, 1);
    g.beginPath(); g.arc(cx, cy, r, Phaser.Math.DegToRad(-60), Phaser.Math.DegToRad(60), false); g.strokePath();
    // destellos en las puntas
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, 4);
    g.fillCircle(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, 4);
    g.generateTexture('slash', 64, 64);
    g.destroy();
  }

  // --- Caja de pickup ---
  genCrate() {
    const s = 46;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, s, s, 6);
    g.lineStyle(4, 0x000000, 1).strokeRoundedRect(2, 2, s - 4, s - 4, 6);
    g.lineStyle(3, 0x00000055, 1);
    g.beginPath(); g.moveTo(4, 4); g.lineTo(s - 4, s - 4); g.strokePath();
    g.beginPath(); g.moveTo(s - 4, 4); g.lineTo(4, s - 4); g.strokePath();
    g.generateTexture('crate', s, s);
    g.destroy();
  }

  // --- Suelo (plaza/concreto sinaloense) ---
  genGround() {
    const w = 64, h = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x6b6f73, 1).fillRect(0, 0, w, h);          // concreto
    g.fillStyle(0x8a8f93, 1).fillRect(0, 0, w, 8);          // superficie
    g.fillStyle(0x595d61, 1);
    g.fillRect(0, 8, w, 2);
    // juntas de loseta
    g.lineStyle(1, 0x4e5256, 1);
    g.beginPath(); g.moveTo(32, 0); g.lineTo(32, h); g.strokePath();
    g.beginPath(); g.moveTo(0, 40); g.lineTo(w, 40); g.strokePath();
    // piedritas
    g.fillStyle(0x55595d, 1);
    g.fillRect(12, 24, 4, 4); g.fillRect(44, 52, 5, 3); g.fillRect(22, 60, 3, 3);
    g.generateTexture('ground', w, h);
    g.destroy();
  }

  // --- Suelo del malecón (baldosa clara + arena) ---
  genGroundMalecon() {
    const w = 64, h = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xe4cd92, 1).fillRect(0, 0, w, h);          // baldosa arenosa
    g.fillStyle(0xf2dca6, 1).fillRect(0, 0, w, 8);          // superficie clara
    g.fillStyle(0xc9ad78, 1).fillRect(0, 8, w, 2);
    // juntas de baldosa
    g.lineStyle(1, 0xbfa06a, 1);
    g.beginPath(); g.moveTo(32, 0); g.lineTo(32, h); g.strokePath();
    g.beginPath(); g.moveTo(0, 40); g.lineTo(w, 40); g.strokePath();
    // motitas de arena
    g.fillStyle(0xd8bd84, 1);
    g.fillRect(12, 22, 3, 3); g.fillRect(45, 52, 4, 3); g.fillRect(22, 60, 3, 3); g.fillRect(50, 18, 3, 3);
    g.fillStyle(0xf0e0b4, 1);
    g.fillRect(8, 50, 2, 2); g.fillRect(38, 28, 2, 2); g.fillRect(56, 64, 2, 2);
    g.generateTexture('ground_malecon', w, h);
    g.destroy();
  }

  // --- Suelo de la sierra (terracería con piedras) ---
  genGroundSierra() {
    const w = 64, h = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x7a5a38, 1).fillRect(0, 0, w, h);          // tierra
    g.fillStyle(0x96703f, 1).fillRect(0, 0, w, 8);          // superficie
    g.fillStyle(0x5e4429, 1).fillRect(0, 8, w, 2);
    // rodadas de troca en la terracería
    g.fillStyle(0x6b4d2e, 1).fillRect(0, 3, w, 2);
    // piedras y raíces
    g.fillStyle(0x8d8475, 1);
    g.fillRect(10, 26, 6, 4); g.fillRect(40, 50, 7, 5); g.fillRect(24, 64, 5, 4);
    g.fillStyle(0x52391f, 1);
    g.fillRect(30, 20, 8, 2); g.fillRect(6, 46, 10, 2); g.fillRect(48, 30, 9, 2);
    g.generateTexture('ground_sierra', w, h);
    g.destroy();
  }

  // --- Bomba del helicóptero ---
  genBomb() {
    Pixel.sprite(this, 'bomb', 12, 20, (p) => {
      p(0x44484e, 2, 0, 3, 4); p(0x44484e, 7, 0, 3, 4);   // aletas
      p(0x2e3236, 3, 3, 6, 12);                            // cuerpo
      p(0x5a5f64, 4, 4, 1, 10);                            // brillo
      p(0xd23b2e, 3, 9, 6, 2);                             // franja roja
      p(0x1c1e22, 3, 15, 6, 3); p(0x1c1e22, 4, 18, 4, 2);  // punta
    });
  }

  // --- Cohete del chairo bazuca ---
  genRocket() {
    Pixel.sprite(this, 'rocket', 22, 8, (p) => {
      p(0x3a3f45, 4, 2, 13, 4);                            // tubo
      p(0x5a5f64, 4, 2, 13, 1);                            // brillo
      p(0xd23b2e, 17, 1, 4, 6); p(0xff8a6a, 18, 2, 2, 2);  // punta roja
      p(0x2a2d31, 0, 0, 4, 3); p(0x2a2d31, 0, 5, 4, 3);    // aletas
    });
  }

  // --- Flecha indicadora de puntería ---
  genAimArrow() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffe066, 1).fillTriangle(1, 1, 1, 15, 15, 8);
    g.lineStyle(2, 0x6e3a00, 1).strokeTriangle(1, 1, 1, 15, 15, 8);
    g.generateTexture('aim_arrow', 16, 16);
    g.destroy();
  }

  // --- Granada (forma de piña) ---
  genGrenade() {
    Pixel.sprite(this, 'grenade', 16, 20, (p) => {
      p(0x466b2f, 4, 7, 9, 11);                 // cuerpo
      p(0x33521f, 4, 7, 3, 11);                 // sombra
      p(0x5e8a3f, 10, 8, 2, 8);                 // brillo
      p(0x2c451b, 4, 10, 9, 1); p(0x2c451b, 4, 13, 9, 1);   // rejilla
      p(0x2c451b, 7, 7, 1, 11); p(0x2c451b, 10, 7, 1, 11);
      p(0x6b6b6b, 6, 3, 5, 4); p(0x8a8a8a, 6, 3, 5, 1);     // tapa
      p(0x9a9a9a, 11, 3, 3, 8);                 // palanca
      p(0xd9b24a, 3, 2, 3, 2);                  // anilla
    });
  }

  // --- Plataforma (ledge) + muro (soporte) ---
  genPlatform() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // ledge 64x22
    g.fillStyle(0x7a6a52, 1).fillRect(0, 0, 64, 22);
    g.fillStyle(0x9a8a6a, 1).fillRect(0, 0, 64, 7);
    g.fillStyle(0x5e5040, 1).fillRect(0, 7, 64, 2);
    g.fillStyle(0x3a2f24, 1).fillRect(0, 20, 64, 2);
    g.lineStyle(1, 0x5e5040, 1);
    for (let x = 0; x < 64; x += 16) { g.beginPath(); g.moveTo(x, 9); g.lineTo(x, 22); g.strokePath(); }
    g.generateTexture('ledge', 64, 22);
    g.clear();
    // muro 64x64 (ladrillo)
    g.fillStyle(0xb45f33, 1).fillRect(0, 0, 64, 64);
    g.fillStyle(0x9a4f2a, 1);
    for (let y = 0; y < 64; y += 12) {
      for (let x = ((y / 12) % 2) * 8; x < 64; x += 24) g.fillRect(x, y, 20, 10);
    }
    g.generateTexture('wall', 64, 64);
    g.destroy();
  }

  // --- Meta de nivel (poste con bandera) ---
  genGoal() {
    const w = 70, h = 190;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x2b2b2b, 1).fillRect(8, 0, 8, h);
    g.fillStyle(0x2ecc71, 1).fillTriangle(16, 6, 16, 50, 66, 28);
    g.fillStyle(0xffffff, 1).fillRect(20, 16, 8, 8);
    g.generateTexture('goal', w, h);
    g.destroy();
  }
}

window.BootScene = BootScene;
