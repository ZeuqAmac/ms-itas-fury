// ============================================================
//  MS Ita's Fury — configuración global, armas y niveles
// ============================================================

const CONST = {
  WIDTH: 960,
  HEIGHT: 540,
  GRAVITY: 1500,
  GROUND_Y: 470,          // y de la superficie del suelo
  PLAYER_SPEED: 240,
  PLAYER_JUMP: 640,
};

// Paleta sinaloense
const COLORS = {
  cielo1: 0xff9b54,       // atardecer
  cielo2: 0xffd6a0,
  edificio: 0x3a2f4a,
  edificio2: 0x2a2236,
  suelo: 0x6b4a2b,
  sueloTop: 0x86603a,
  pantalonChairo: 0x1f3a93,   // pantalón azul
  vestChairo: 0x6e1423,       // chaleco guindo
  piel: 0xd9a066,
};

// --- Armas (estética + nombres sinaloenses) ---
// dmg: daño por proyectil | cooldown: ms entre disparos
// speed: velocidad de la bala | pellets: balas por disparo
// spread: dispersión (rad) | ammo: munición inicial (Infinity = ilimitada)
const WEAPONS = {
  escuadra: {
    name: 'Escuadra', dmg: 28, cooldown: 260, speed: 760,
    pellets: 1, spread: 0, ammo: Infinity, color: 0xffe066, size: 1,
  },
  cuerno: {
    name: 'Cuerno de Chivo', dmg: 20, cooldown: 85, speed: 900,
    pellets: 1, spread: 0.04, ammo: 220, color: 0xff9933, size: 1,
  },
  escopeta: {
    name: 'Escopeta Recortada', dmg: 16, cooldown: 540, speed: 720,
    pellets: 6, spread: 0.34, ammo: 36, color: 0xff5555, size: 1,
  },
  bazuca: {
    name: 'Bazuca', dmg: 140, cooldown: 950, speed: 600,
    pellets: 1, spread: 0, ammo: 10, color: 0xffffff, size: 2, explosive: true,
  },
  // Cañón del tanque (solo se usa al ir montado en el tanque)
  canon: {
    name: 'Cañón del Tanque', dmg: 120, cooldown: 600, speed: 700,
    pellets: 1, spread: 0, ammo: Infinity, color: 0xffe9a0, size: 3, explosive: true,
  },
};

// Orden de "poder" para decidir si un pickup mejora el arma actual
const WEAPON_ORDER = ['escuadra', 'cuerno', 'escopeta', 'bazuca'];

// --- Personajes seleccionables ---
// locked: aún no jugable (placeholder para futuros personajes).
// vehicle: true => arranca el nivel montado en el tanque.
const CHARACTERS = [
  {
    id: 'ita', name: 'ITA ITA', tag: 'La Reina de Sinaloa',
    desc: 'Ágil y letal. Cuerno de chivo, granada piña y cuchillo a quemarropa.',
    sprite: 'ita_idle0', anim: 'ita-idle', scale: 5.4, locked: false,
  },
  {
    id: 'choco', name: 'LA CHOCO', tag: 'La Prisionera 4027',
    desc: 'Ruda y sin miedo. Reparte plomo y puñaladas cuando se le acercan.',
    sprite: 'choco_idle0', anim: 'choco-idle', scale: 5.4, locked: false,
  },
  {
    id: 'tanque', name: 'EL TANQUE', tag: 'Blindado "El Slug"',
    desc: 'Blindaje pesado y cañonazos demoledores. Rudo pero lento.',
    sprite: 'tank_body0', anim: 'tank-roll', scale: 3.0, vehicle: true, locked: false,
  },
  {
    id: 'lucky', name: 'LUCKY', tag: 'Perro artillero',
    desc: 'Próximamente jugable. Por ahora te acompaña en el nivel.',
    sprite: 'lucky_idle0', anim: 'lucky-idle', scale: 4.6, locked: true,
  },
];

// --- Niveles ---
// enemies: {x, type?} posición de spawn; type ∈ 'pistola' (def) | 'bazuca' | 'machete'
// pickups: {x, type}  type ∈ armas | 'vida' | 'lucky' | 'tanque'
// pows: {x} prisioneros rescatables (dan arma/puntos, estilo Metal Slug)
// Cada nivel termina al llegar a la meta (goalX = width - 200)
const LEVELS = [
  {
    name: 'Culiacán en Llamas',
    theme: 'culiacan',
    width: 6200,
    // jefe final: aparece al pasar triggerX; hay que derrotarlo
    boss: { type: 'patron', name: 'EL PATRÓN', hp: 1800, triggerX: 5350 },
    // huecos/pozos en el suelo: {x, w}
    gaps: [{ x: 2700, w: 150 }, { x: 4950, w: 140 }],
    // peligros: {x, w, type} type ∈ 'fire' | 'water'
    hazards: [{ x: 1150, w: 90, type: 'fire' }, { x: 3500, w: 110, type: 'fire' }],
    // plataformas: {x: izquierda, y: superficie, w: ancho}
    platforms: [
      { x: 1400, y: 384, w: 150 },
      { x: 1650, y: 322, w: 150 },
      { x: 1900, y: 262, w: 180 },   // azotea con recompensa
      { x: 3000, y: 360, w: 150 },
      { x: 3260, y: 360, w: 150 },
      { x: 4200, y: 344, w: 180 },
      { x: 4500, y: 286, w: 160 },
      { x: 5450, y: 372, w: 220 },
    ],
    enemies: [
      { x: 700 }, { x: 1050 }, { x: 1300 }, { x: 1750 }, { x: 2150 }, { x: 2200 },
      { x: 2600 }, { x: 2950 }, { x: 3300 }, { x: 3350, type: 'machete' }, { x: 3800 }, { x: 4100 },
      { x: 4400 }, { x: 4800, type: 'bazuca' }, { x: 5100 }, { x: 5150 }, { x: 5600, type: 'machete' }, { x: 5900 },
    ],
    pows: [{ x: 2050 }, { x: 4650 }],
    pickups: [
      { x: 1050, type: 'cuerno' },
      { x: 1500, type: 'vida' },
      { x: 1965, y: 236, type: 'bazuca' },   // azotea
      { x: 2400, type: 'lucky' },
      { x: 3120, y: 334, type: 'vida' },      // plataforma
      { x: 3700, type: 'escopeta' },
      { x: 4560, y: 260, type: 'cuerno' },    // plataforma alta
      { x: 5000, type: 'vida' },
      { x: 3650, type: 'tanque' },            // ¡sube al tanque!
      { x: 5700, type: 'bazuca' },
    ],
  },
  {
    name: 'El Malecón de Mazatlán',
    theme: 'malecon',
    width: 7200,
    boss: { type: 'general', name: 'EL GENERAL', hp: 2600, triggerX: 6250 },
    // canales de mar: hay que brincarlos (caer = pierdes vida)
    gaps: [
      { x: 1500, w: 150 }, { x: 2750, w: 170 }, { x: 3850, w: 150 }, { x: 5050, w: 150 },
    ],
    // charcos de marea / agua que daña al tocarla
    hazards: [
      { x: 900, w: 120, type: 'water' },
      { x: 4400, w: 130, type: 'water' },
      { x: 5750, w: 120, type: 'water' },
    ],
    // Plataformas a MUCHAS alturas: escaleras que suben y bajan, repisas
    // bajas pegadas al agua y miradores altos sobre el faro.
    platforms: [
      // primera subida escalonada hasta un mirador
      { x: 700, y: 430, w: 150 },
      { x: 950, y: 372, w: 150 },
      { x: 1200, y: 312, w: 160 },     // mirador con recompensa
      { x: 1430, y: 392, w: 120 },     // bajada hacia el canal
      { x: 1640, y: 424, w: 130 },     // repisa baja (al ras del mar)
      // tramo medio: techos de palapas a distinta altura
      { x: 2050, y: 360, w: 160 },
      { x: 2300, y: 300, w: 150 },
      { x: 2560, y: 360, w: 150 },
      { x: 2730, y: 414, w: 130 },     // brinco bajo sobre el 2º canal
      // gran escalera hacia el mirador del faro
      { x: 3150, y: 410, w: 140 },
      { x: 3380, y: 348, w: 140 },
      { x: 3610, y: 286, w: 150 },
      { x: 3840, y: 224, w: 160 },     // mirador ALTO (bazuca)
      // descenso tras el 3er canal
      { x: 4080, y: 300, w: 140 },
      { x: 4320, y: 380, w: 150 },
      // tramo bajo cerca del agua
      { x: 4650, y: 432, w: 150 },
      { x: 5020, y: 412, w: 150 },     // brinco sobre el canal grande
      // último ascenso a la pelea
      { x: 5350, y: 358, w: 150 },
      { x: 5600, y: 298, w: 160 },
      { x: 5880, y: 360, w: 150 },
      { x: 6300, y: 372, w: 240 },     // explanada del jefe
    ],
    enemies: [
      { x: 620 }, { x: 1080 }, { x: 1320 }, { x: 1750 }, { x: 1950 },
      { x: 2250 }, { x: 2480, type: 'machete' }, { x: 2980 }, { x: 3300, type: 'bazuca' }, { x: 3550 },
      { x: 4060 }, { x: 4250 }, { x: 4600 }, { x: 4900 }, { x: 5300 },
      { x: 5550, type: 'machete' }, { x: 5950 }, { x: 6100, type: 'bazuca' }, { x: 6450 }, { x: 6650 },
    ],
    pows: [{ x: 1680 }, { x: 4480 }],
    pickups: [
      { x: 760, type: 'escopeta' },
      { x: 1200, y: 286, type: 'vida' },     // mirador
      { x: 1900, type: 'cuerno' },
      { x: 2300, y: 274, type: 'lucky' },    // sobre palapa
      { x: 2980, type: 'vida' },
      { x: 3840, y: 198, type: 'bazuca' },   // mirador alto del faro
      { x: 4250, y: 354, type: 'escopeta' },
      { x: 5300, type: 'tanque' },           // ¡tanque en recta despejada hacia el jefe!
      { x: 5600, y: 272, type: 'cuerno' },
      { x: 5950, type: 'vida' },
      { x: 6500, type: 'bazuca' },
    ],
  },
  {
    name: 'La Sierra Brava',
    theme: 'sierra',
    width: 7600,
    // jefe volador: helicóptero artillado (vuela, ametralla y suelta bombas)
    boss: { type: 'halcon', name: 'EL HALCÓN', hp: 3200, triggerX: 6650, flying: true },
    // barrancas de la sierra
    gaps: [{ x: 1750, w: 160 }, { x: 3450, w: 170 }, { x: 5250, w: 180 }],
    hazards: [
      { x: 950, w: 100, type: 'fire' },
      { x: 2850, w: 110, type: 'fire' },
      { x: 4450, w: 120, type: 'fire' },
      { x: 6050, w: 100, type: 'fire' },
    ],
    // riscos y miradores a varias alturas
    platforms: [
      { x: 800, y: 400, w: 150 },
      { x: 1050, y: 340, w: 150 },
      { x: 1320, y: 280, w: 170 },     // risco con recompensa
      { x: 1620, y: 380, w: 130 },     // brinco sobre la 1a barranca
      { x: 2150, y: 360, w: 160 },
      { x: 2450, y: 300, w: 150 },
      { x: 3050, y: 380, w: 150 },
      { x: 3380, y: 414, w: 110 },     // brinco sobre la 2a barranca
      { x: 3700, y: 340, w: 160 },
      { x: 3980, y: 280, w: 170 },     // mirador alto
      { x: 4700, y: 380, w: 150 },
      { x: 5000, y: 320, w: 150 },
      { x: 5220, y: 404, w: 140 },     // brinco sobre la 3a barranca
      { x: 5700, y: 360, w: 160 },
      { x: 6000, y: 300, w: 160 },
      { x: 6700, y: 370, w: 260 },     // explanada del jefe
    ],
    enemies: [
      { x: 650 }, { x: 1000, type: 'machete' }, { x: 1300 }, { x: 1700, type: 'bazuca' },
      { x: 2100 }, { x: 2200, type: 'machete' }, { x: 2600 }, { x: 2900, type: 'bazuca' },
      { x: 3200 }, { x: 3650, type: 'machete' }, { x: 3900 }, { x: 4200, type: 'bazuca' },
      { x: 4500 }, { x: 4600, type: 'machete' }, { x: 4950 }, { x: 5450, type: 'bazuca' },
      { x: 5650, type: 'machete' }, { x: 5900 }, { x: 6200, type: 'bazuca' }, { x: 6400 },
      { x: 6850, type: 'machete' }, { x: 7050 },
    ],
    pickups: [
      { x: 900, type: 'cuerno' },
      { x: 1320, y: 254, type: 'bazuca' },   // risco
      { x: 1900, type: 'vida' },
      { x: 2450, y: 274, type: 'lucky' },
      { x: 3100, type: 'escopeta' },
      { x: 3980, y: 254, type: 'vida' },     // mirador alto
      { x: 4400, type: 'tanque' },
      { x: 5000, y: 294, type: 'cuerno' },
      { x: 5800, type: 'vida' },
      { x: 6300, type: 'bazuca' },
      { x: 6950, type: 'vida' },
    ],
    pows: [{ x: 1450 }, { x: 3550 }, { x: 5550 }],
  },
];

window.CONST = CONST;
window.COLORS = COLORS;
window.WEAPONS = WEAPONS;
window.WEAPON_ORDER = WEAPON_ORDER;
window.CHARACTERS = CHARACTERS;
window.LEVELS = LEVELS;
