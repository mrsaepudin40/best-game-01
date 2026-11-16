// Synthesized sound effects with WebAudio: no audio files are shipped.
// The context is created lazily on the first user gesture, because browsers
// block audio before one, and M toggles mute.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientNodes = null;
  }

  ensure() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.ambientNodes) this.ambientNodes.gain.gain.value = muted ? 0 : 0.04;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noiseBurst(dur, vol, cutoff) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  }

  click() {
    this.tone(880, 0.06, 'square', 0.08);
  }

  catchSound(combo) {
    const base = 520 + Math.min(combo, 5) * 60;
    this.tone(base, 0.12, 'sine', 0.22, base * 1.5);
    this.tone(base * 2, 0.1, 'triangle', 0.1);
  }

  perfectSound() {
    this.tone(1046, 0.14, 'sine', 0.2);
    setTimeout(() => this.tone(1568, 0.22, 'sine', 0.18), 70);
  }

  explosionSound() {
    this.noiseBurst(0.5, 0.4, 900);
    this.tone(120, 0.45, 'sine', 0.3, 40);
  }

  debrisSound() {
    this.noiseBurst(0.25, 0.25, 2400);
    this.tone(220, 0.2, 'sawtooth', 0.12, 110);
  }

  winSound() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.25, 'triangle', 0.2), i * 110);
    });
  }

  loseSound() {
    [392, 330, 262, 196].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.28, 'sawtooth', 0.1), i * 130);
    });
  }

  startAmbient() {
    if (!this.ctx || this.ambientNodes) return;
    const gain = this.ctx.createGain();
    gain.gain.value = this.muted ? 0 : 0.04;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    const o1 = this.ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 55;
    const o2 = this.ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = 82.5;
    o1.connect(filter);
    o2.connect(filter);
    filter.connect(gain).connect(this.ctx.destination);
    o1.start();
    o2.start();
    this.ambientNodes = { gain, o1, o2 };
  }
}
