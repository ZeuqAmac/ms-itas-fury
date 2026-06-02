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
    desc: 'Ágil y letal. Domina el cuerno de chivo y la granada piña.',
    sprite: 'ita_idle0', anim: 'ita-idle', scale: 5.4, locked: false,
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
  {
    id: 'misterio', name: '¿?', tag: 'Próximamente',
    desc: 'Nuevo personaje en camino. ¡Aguanta vara!',
    sprite: null, scale: 4, locked: true,
  },
];

// --- Niveles ---
// enemies: {x} posición de spawn en el suelo
// pickups: {x, type}  type ∈ armas | 'vida' | 'lucky'
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
      { x: 2600 }, { x: 2950 }, { x: 3300 }, { x: 3350 }, { x: 3800 }, { x: 4100 },
      { x: 4400 }, { x: 4800 }, { x: 5100 }, { x: 5150 }, { x: 5600 }, { x: 5900 },
    ],
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
    theme: 'jardin',
    width: 7000,
    boss: { type: 'general', name: 'EL GENERAL', hp: 2600, triggerX: 6050 },
    gaps: [{ x: 2150, w: 150 }, { x: 5050, w: 150 }],
    hazards: [
      { x: 1300, w: 120, type: 'water' },
      { x: 3900, w: 130, type: 'water' },
      { x: 5950, w: 110, type: 'water' },
    ],
    platforms: [
      { x: 1200, y: 380, w: 160 },
      { x: 1460, y: 320, w: 160 },
      { x: 1720, y: 260, w: 180 },
      { x: 2800, y: 350, w: 150 },
      { x: 3060, y: 300, w: 150 },
      { x: 3320, y: 350, w: 150 },
      { x: 4400, y: 360, w: 200 },
      { x: 4720, y: 300, w: 170 },
      { x: 5900, y: 370, w: 220 },
      { x: 6200, y: 310, w: 180 },
    ],
    enemies: [
      { x: 650 }, { x: 1000 }, { x: 1050 }, { x: 1500 }, { x: 1900 }, { x: 2050 },
      { x: 2450 }, { x: 2500 }, { x: 2950 }, { x: 3300 }, { x: 3700 }, { x: 3750 },
      { x: 4150 }, { x: 4500 }, { x: 4900 }, { x: 4950 }, { x: 5400 }, { x: 5800 },
      { x: 6100 }, { x: 6150 }, { x: 6500 }, { x: 6700 },
    ],
    pickups: [
      { x: 900, type: 'escopeta' },
      { x: 1500, type: 'vida' },
      { x: 1780, y: 234, type: 'bazuca' },
      { x: 2300, type: 'cuerno' },
      { x: 2700, type: 'lucky' },
      { x: 3120, y: 274, type: 'vida' },
      { x: 4000, type: 'escopeta' },
      { x: 4780, y: 274, type: 'cuerno' },
      { x: 5500, type: 'vida' },
      { x: 4250, type: 'tanque' },            // ¡sube al tanque!
      { x: 6250, y: 284, type: 'bazuca' },
    ],
  },
];

window.CONST = CONST;
window.COLORS = COLORS;
window.WEAPONS = WEAPONS;
window.WEAPON_ORDER = WEAPON_ORDER;
window.CHARACTERS = CHARACTERS;
window.LEVELS = LEVELS;
