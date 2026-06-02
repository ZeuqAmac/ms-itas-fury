// ============================================================
//  render.js — previsualiza el arte por código (Node, sin deps).
//  Simula un canvas 2D mínimo, ejecuta el CharacterArt real y
//  exporta PNGs para revisar los sprites. Solo herramienta de dev.
//    node tools/render.js
// ============================================================
const fs = require('fs');
const zlib = require('zlib');
const vm = require('vm');
const path = require('path');

const ROOT = path.dirname(__dirname);

// ---- PNG encoder ----
function writePNG(file, w, h, data) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  let o = 0;
  for (let y = 0; y < h; y++) {
    raw[o++] = 0;
    for (let x = 0; x < w * 4; x++) raw[o++] = data[y * w * 4 + x];
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunk = (tag, buf) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(buf.length);
    const t = Buffer.from(tag);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, buf])) >>> 0);
    return Buffer.concat([len, t, buf, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(file, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]));
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c;
}

// ---- Canvas 2D mock ----
function parseColor(s) {
  if (typeof s !== 'string') return [0, 0, 0, 255];
  if (s[0] === '#') {
    const n = parseInt(s.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map(v => parseFloat(v));
    return [p[0] | 0, p[1] | 0, p[2] | 0, p[3] === undefined ? 255 : Math.round(p[3] * 255)];
  }
  return [0, 0, 0, 255];
}
class Ctx {
  constructor(w, h) { this.w = w; this.h = h; this.buf = new Uint8ClampedArray(w * h * 4); this.fillStyle = '#000'; this.path = []; }
  _set(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const a = c[3] / 255, i = (y * this.w + x) * 4;
    this.buf[i] = c[0] * a + this.buf[i] * (1 - a);
    this.buf[i + 1] = c[1] * a + this.buf[i + 1] * (1 - a);
    this.buf[i + 2] = c[2] * a + this.buf[i + 2] * (1 - a);
    this.buf[i + 3] = Math.max(this.buf[i + 3], c[3]);
  }
  fillRect(x, y, w, h) {
    if (typeof this.fillStyle !== 'string') return;   // gradiente: omitido en preview
    const c = parseColor(this.fillStyle);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) this._set(x + xx, y + yy, c);
  }
  beginPath() { this.path = []; }
  moveTo(x, y) { this.path.push([x, y]); }
  lineTo(x, y) { this.path.push([x, y]); }
  closePath() {}
  arc(cx, cy, r, a0, a1) {
    let end = a1; if (end - a0 > Math.PI * 2) end = a0 + Math.PI * 2;
    if (end < a0) end += Math.PI * 2;
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const a = a0 + (end - a0) * (i / N);
      this.path.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  ellipse(cx, cy, rx, ry, rot, a0, a1) {
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const a = a0 + (a1 - a0) * (i / N);
      this.path.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
  }
  fill() {
    const pts = this.path; if (pts.length < 3) return;
    const c = parseColor(this.fillStyle);
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const xs = [];
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const yi = pts[i][1], yj = pts[j][1];
        if ((yi > y) !== (yj > y)) xs.push(pts[i][0] + (y - yi) / (yj - yi) * (pts[j][0] - pts[i][0]));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this._set(x, y, c);
    }
  }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  getImageData(x, y, w, h) { return { data: this.buf, width: w, height: h }; }
  putImageData(img) { this.buf = img.data; }
}

// ---- Sandbox: window + document ----
const textures = {};
const fakeScene = {
  textures: {
    exists: () => false, remove() {},
    addCanvas: (key, canvas) => { textures[key] = canvas; },
  },
  anims: { exists: () => false, create() {} },
};
const sandbox = {};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.Math = Math;
sandbox.document = {
  createElement: () => {
    const o = { width: 0, height: 0, _ctx: null };
    o.getContext = () => { if (!o._ctx) o._ctx = new Ctx(o.width, o.height); return o._ctx; };
    return o;
  },
};
vm.createContext(sandbox);
for (const f of ['src/data/config.js', 'src/art/Pixel.js', 'src/art/CharacterArt.js', 'src/art/SceneryArt.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
try { sandbox.CharacterArt.build(fakeScene); } catch (e) { console.error('char', e.message); }
try { sandbox.SceneryArt.build(fakeScene); } catch (e) { console.error('scenery', e.message); }

// ---- Exporta sprites a una hoja por personaje ----
const want = process.argv.slice(2);
const keys = Object.keys(textures).filter(k => want.length === 0 || want.some(w => k.includes(w)));
const outDir = path.join(ROOT, 'tools', 'preview');
fs.mkdirSync(outDir, { recursive: true });
for (const key of keys) {
  const cv = textures[key]; const ctx = cv.getContext();
  // upscale x6 con fondo a cuadros para ver alfa
  const S = 6, w = cv.width * S, h = cv.height * S;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = (x / S) | 0, sy = (y / S) | 0, si = (sy * cv.width + sx) * 4, di = (y * w + x) * 4;
    const a = ctx.buf[si + 3];
    if (a > 0) { out[di] = ctx.buf[si]; out[di + 1] = ctx.buf[si + 1]; out[di + 2] = ctx.buf[si + 2]; out[di + 3] = 255; }
    else { const chk = (((x >> 3) + (y >> 3)) & 1) ? 200 : 150; out[di] = out[di + 1] = out[di + 2] = chk; out[di + 3] = 255; }
  }
  writePNG(path.join(outDir, key + '.png'), w, h, out);
}
console.log('rendered:', keys.join(', '));
