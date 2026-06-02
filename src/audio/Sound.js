// ============================================================
//  Sound — efectos y música sintetizados por código (Web Audio).
//  No usa archivos. SFX.play('shoot'), SFX.startMusic(), etc.
// ============================================================

const SFX = {
  ctx: null, master: null, musicGain: null,
  muted: false, _timer: null, _step: 0,

  _ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.30;
    this.musicGain.connect(this.master);
  },

  resume() {
    this._ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleMute() {
    this._ensure();
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.9;
    return this.muted;
  },

  // ---------- helpers de síntesis ----------
  _noise(dur) {
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  },

  _tone(freq, t0, dur, type, vol, dest) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || this.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
    return o;
  },

  _sweep(f1, f2, t0, dur, type, vol) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },

  _noiseHit(dur, f1, f2, vol) {
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise(dur);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(f1, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(); src.stop(t + dur);
  },

  // ---------- efectos ----------
  play(name) {
    if (!this.ctx || this.ctx.state !== 'running' || this.muted) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'shoot':
        this._sweep(900, 240, t, 0.09, 'square', 0.22);
        this._noiseHit(0.05, 3000, 600, 0.15); break;
      case 'shoot_big':
        this._sweep(500, 120, t, 0.18, 'sawtooth', 0.3);
        this._noiseHit(0.12, 2200, 300, 0.3); break;
      case 'explosion':
        this._noiseHit(0.45, 1400, 180, 0.6);
        this._tone(70, t, 0.35, 'sine', 0.5); break;
      case 'jump':
        this._sweep(300, 720, t, 0.13, 'square', 0.2); break;
      case 'hurt':
        this._sweep(420, 110, t, 0.22, 'sawtooth', 0.28); break;
      case 'throw':
        this._sweep(200, 900, t, 0.2, 'triangle', 0.16); break;
      case 'slash':
        this._sweep(1700, 480, t, 0.08, 'square', 0.12);
        this._noiseHit(0.07, 5200, 800, 0.18); break;
      case 'cannon':
        this._sweep(360, 80, t, 0.3, 'sawtooth', 0.34);
        this._noiseHit(0.32, 1800, 220, 0.55);
        this._tone(58, t, 0.32, 'sine', 0.5); break;
      case 'powerup':
        [523, 659, 784, 1046].forEach((f, i) => this._tone(f, t + i * 0.06, 0.12, 'square', 0.2)); break;
      case 'heal':
        this._tone(523, t, 0.14, 'sine', 0.25); this._tone(784, t + 0.09, 0.16, 'sine', 0.25); break;
      case 'lucky':
        [659, 880, 1046, 1318].forEach((f, i) => this._tone(f, t + i * 0.05, 0.1, 'triangle', 0.2)); break;
      case 'win':
        [523, 659, 784, 1046, 1318].forEach((f, i) => this._tone(f, t + i * 0.1, 0.18, 'square', 0.24)); break;
      case 'gameover':
        [392, 330, 262, 196].forEach((f, i) => this._tone(f, t + i * 0.16, 0.22, 'sawtooth', 0.26)); break;
    }
  },

  // ---------- música (loop chiptune) ----------
  startMusic() {
    this._ensure();
    if (!this.ctx || this._timer) return;
    const bpm = 138;
    const stepMs = (60 / bpm / 4) * 1000;   // semicorcheas
    const MEL  = [523, 0, 659, 523, 784, 0, 659, 0, 587, 0, 698, 587, 784, 880, 784, 0];
    const BASS = [131, 0, 131, 0, 98, 0, 98, 0, 110, 0, 110, 0, 87, 0, 87, 0];
    this._step = 0;
    this._timer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      const i = this._step % 16;
      const t = this.ctx.currentTime + 0.02;
      if (MEL[i])  this._tone(MEL[i], t, 0.12, 'square', 0.16, this.musicGain);
      if (BASS[i]) this._tone(BASS[i], t, 0.16, 'triangle', 0.22, this.musicGain);
      if (i % 2 === 1) {  // hi-hat
        const src = this.ctx.createBufferSource(); src.buffer = this._noise(0.03);
        const g = this.ctx.createGain(); g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        src.connect(g); g.connect(this.musicGain); src.start(t); src.stop(t + 0.03);
      }
      this._step++;
    }, stepMs);
  },

  stopMusic() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },
};

window.SFX = SFX;
