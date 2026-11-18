// AudioSynth.js — all sound is synthesized with WebAudio. No audio files, no network.
export class AudioSynth {
  constructor() {
    this.ctx = null; this.muted = false; this.musicTimer = null;
  }
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  toggleMute() { this.muted = !this.muted; return this.muted; }
  blip(freq, dur, type = 'sine', vol = 0.12, slide = 0) {
    if (this.muted) return;
    const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur);
  }
  catchSound(combo) { this.blip(520 + Math.min(combo, 12) * 45, 0.14, 'triangle', 0.16, 180); }
  missSound() { this.blip(180, 0.3, 'sawtooth', 0.14, -110); }
  bossHit() { this.blip(120, 0.25, 'square', 0.16, 60); this.blip(880, 0.12, 'sine', 0.1); }
  coinSound() { this.blip(990, 0.1, 'sine', 0.12); setTimeout(() => this.blip(1320, 0.16, 'sine', 0.12), 70); }
  winSound() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.3, 'triangle', 0.15), i * 120)); }
  clickSound() { this.blip(700, 0.06, 'square', 0.08); }
  startMusic() {
    if (this.musicTimer || this.muted) return;
    const notes = [262, 330, 392, 330, 294, 392, 440, 392];
    let i = 0;
    this.musicTimer = setInterval(() => {
      if (!this.muted) this.blip(notes[i % notes.length], 0.5, 'sine', 0.035);
      i++;
    }, 480);
  }
  stopMusic() { if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; } }
}
