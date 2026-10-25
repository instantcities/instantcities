// Tiny synthesized sound effects, no audio files. Player 1 sounds pan left, Player 2 right.
// Music and effects run on separate buses so each can be switched off on its own.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.sfxOn = true;
    this.musicOn = true;
    this.onUnlock = null;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
      this.fxBus = this.ctx.createGain();
      this.fxBus.gain.value = this.sfxOn ? 1 : 0;
      this.fxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicOn ? 0.55 : 0;
      this.musicBus.connect(this.master);
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      this.onUnlock?.();
    }
    // 'interrupted' is where iOS leaves it after a call or a stay in the background
    if (this.ctx.state !== 'running') this.ctx.resume();
  }

  setSfx(on) {
    this.sfxOn = on;
    if (this.fxBus) this.fxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  setMusic(on) {
    this.musicOn = on;
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(on ? 0.55 : 0, this.ctx.currentTime, 0.05);
  }

  // Silence while paused: music, effects and the street's sounds all go through the master.
  duck(on) {
    if (this.master) this.master.gain.setTargetAtTime(on ? 0 : 0.6, this.ctx.currentTime, 0.05);
  }

  get ok() {
    return this.ctx && this.sfxOn;
  }

  out(pan, bus = this.fxBus) {
    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;
    p.connect(bus);
    return p;
  }

  tone(f, dur, { type = 'sine', vol = 0.2, to = null, pan = 0, delay = 0, at = null, bus = null } = {}) {
    if (!this.ctx || (!bus && !this.sfxOn)) return;
    const t = at ?? this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.out(pan, bus ?? this.fxBus));
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise(dur, { vol = 0.2, freq = 1000, to = null, q = 1, type = 'bandpass', pan = 0, delay = 0, at = null, bus = null } = {}) {
    if (!this.ctx || (!bus && !this.sfxOn)) return;
    const t = at ?? this.ctx.currentTime + delay;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.out(pan, bus ?? this.fxBus));
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  ui() { this.tone(660, 0.07, { type: 'square', vol: 0.07 }); }

  countdown(go) { this.tone(go ? 880 : 520, go ? 0.6 : 0.22, { type: 'square', vol: 0.11 }); }

  hoof(v, pan) {
    this.noise(0.045, { vol: 0.3 * v, freq: 700 + Math.random() * 500, q: 2.5, pan });
    this.tone(110 + Math.random() * 30, 0.07, { vol: 0.22 * v, to: 60, pan });
  }

  // A car engine that runs on while you drive: v is 0 (idling) to 1 (flat out), or null for off.
  engine(v) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (v === null) {
      if (!this.eng) return;
      const e = this.eng;
      this.eng = null;
      e.gain.gain.setTargetAtTime(0, now, 0.08);
      for (const o of e.oscs) o.stop(now + 0.6);
      return;
    }
    if (!this.eng) {
      const filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
      filter.type = 'lowpass';
      gain.gain.value = 0;
      filter.connect(gain).connect(this.fxBus);
      const oscs = ['sawtooth', 'square', 'sawtooth'].map(type => {
        const o = this.ctx.createOscillator();
        o.type = type;
        o.connect(filter);
        o.start();
        return o;
      });
      this.eng = { oscs, filter, gain };
    }
    const { oscs, filter, gain } = this.eng, f = 38 + v * 95 + (Math.sin(now * 23) * 1.5); // a little rumble
    oscs[0].frequency.setTargetAtTime(f, now, 0.06);
    oscs[1].frequency.setTargetAtTime(f * 0.5, now, 0.06);
    oscs[2].frequency.setTargetAtTime(f * 1.51, now, 0.06);
    filter.frequency.setTargetAtTime(240 + v * 1100, now, 0.08);
    gain.gain.setTargetAtTime(0.09 + v * 0.07, now, 0.08);
  }

  // The helicopter's rotor while you fly it: v is 0 (hovering) to 1 (flat out), or null for off. The
  // blades' whump (low noise and a low hum, pulsed as each blade goes by, quicker as it works
  // harder) and the turbine's whine faintly over it; quieter than a car's engine.
  rotor(v) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (v === null) {
      if (!this.rot) return;
      const r = this.rot;
      this.rot = null;
      r.gain.gain.setTargetAtTime(0, now, 0.15);
      for (const n of r.nodes) n.stop(now + 1);
      return;
    }
    if (!this.rot) {
      const gain = this.ctx.createGain(), pulse = this.ctx.createGain(), depth = this.ctx.createGain(), low = this.ctx.createBiquadFilter();
      gain.gain.value = 0;
      pulse.gain.value = 0.55; // half way, and the beat swings it from nearly nothing to full
      depth.gain.value = 0.45;
      low.type = 'lowpass';
      low.Q.value = 0.8;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuf;
      noise.loop = true;
      const hum = this.ctx.createOscillator(), beat = this.ctx.createOscillator(), whine = this.ctx.createOscillator(), whineGain = this.ctx.createGain();
      hum.type = 'triangle';
      beat.type = 'sine';
      whine.type = 'sine';
      whineGain.gain.value = 0.035;
      noise.connect(low);
      hum.connect(low);
      low.connect(pulse).connect(gain);
      beat.connect(depth).connect(pulse.gain);
      whine.connect(whineGain).connect(gain);
      gain.connect(this.fxBus);
      const nodes = [noise, hum, beat, whine];
      for (const n of nodes) n.start();
      this.rot = { gain, low, hum, beat, whine, nodes };
    }
    const { gain, low, hum, beat, whine } = this.rot;
    beat.frequency.setTargetAtTime(9 + v * 3.5, now, 0.3); // blades going by, a second
    hum.frequency.setTargetAtTime(48 + v * 10, now, 0.3);
    low.frequency.setTargetAtTime(260 + v * 220, now, 0.2);
    whine.frequency.setTargetAtTime(1150 + v * 350, now, 0.4);
    gain.gain.setTargetAtTime(0.07 + v * 0.05, now, 0.2);
  }

  pickup(kind, pan) {
    const notes = { bunny: [784, 1047, 1319], hedgehog: [523, 659, 784], cloud: [1047, 1319, 1568, 2093] }[kind];
    notes.forEach((f, i) => this.tone(f, 0.12, { type: 'triangle', vol: 0.18, pan, delay: i * 0.055 }));
  }

  throw(pan) {
    this.noise(0.28, { vol: 0.3, freq: 500, to: 2800, q: 1.5, pan });
    this.tone(420, 0.2, { to: 1100, vol: 0.08, pan });
  }

  drop(pan) {
    this.tone(1400, 0.08, { to: 1900, vol: 0.12, pan });
    this.tone(1700, 0.08, { to: 2300, vol: 0.1, pan, delay: 0.09 });
  }

  hit(pan, vol = 1) {
    this.tone(760, 0.5, { to: 110, vol: 0.3 * vol, pan });
    this.tone(380, 0.45, { type: 'triangle', to: 80, vol: 0.18 * vol, pan, delay: 0.02 });
    this.noise(0.18, { vol: 0.25 * vol, freq: 500, q: 0.8, pan });
  }

  ouch(pan, species = 'horse') {
    this.tone(1800, 0.09, { to: 2600, vol: 0.14, pan });
    this.tone(2200, 0.12, { to: 1500, vol: 0.12, pan, delay: 0.1 });
    this.animal(species, pan);
  }

  thunder(pan) {
    this.noise(1.4, { vol: 0.5, freq: 900, to: 90, q: 0.7, type: 'lowpass', pan });
    this.noise(0.12, { vol: 0.35, freq: 3000, q: 0.5, type: 'highpass', pan });
  }

  rain(pan, dur) {
    this.noise(dur, { vol: 0.08, freq: 4000, q: 0.4, type: 'highpass', pan });
    this.noise(dur, { vol: 0.06, freq: 1200, q: 0.6, pan });
  }

  puff(pan) { this.noise(0.35, { vol: 0.18, freq: 300, to: 1200, q: 1, pan }); }

  jump(pan) {
    this.noise(0.18, { vol: 0.12, freq: 400, to: 1400, q: 1.2, pan });
    this.tone(300, 0.14, { to: 520, type: 'triangle', vol: 0.08, pan });
  }

  land(pan) {
    this.hoof(0.9, pan);
    this.noise(0.12, { vol: 0.2, freq: 250, type: 'lowpass', pan, delay: 0.05 });
  }

  crash(pan) {
    this.noise(0.25, { vol: 0.35, freq: 900, q: 1.5, pan });
    this.tone(140, 0.25, { to: 50, vol: 0.3, pan });
    this.noise(0.4, { vol: 0.15, freq: 2400, to: 600, q: 2, pan, delay: 0.05 });
  }

  neigh(pan) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(520, t);
    o.frequency.linearRampToValueAtTime(980, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.75);
    const lfo = this.ctx.createOscillator(), depth = this.ctx.createGain();
    lfo.frequency.value = 22;
    depth.gain.value = 70;
    lfo.connect(depth).connect(o.frequency);
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1400;
    f.Q.value = 1.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.05);
    g.gain.setValueAtTime(0.2, t + 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    o.connect(f).connect(g).connect(this.out(pan));
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.85);
    lfo.stop(t + 0.85);
  }

  // A voiced cry: an oscillator sweeping between pitches through a formant filter.
  voice(pan, { type = 'sawtooth', from, peak, to, dur, formant, q = 2, vol = 0.2, wobble = 0 }) {
    if (!this.ok) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    o.frequency.linearRampToValueAtTime(peak, t + dur * 0.3);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    let lfo = null;
    if (wobble) {
      lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = 18;
      depth.gain.value = wobble;
      lfo.connect(depth).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.05);
    }
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = formant;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.06);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(this.out(pan));
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // The sound an animal makes when it gets hit.
  animal(species, pan) {
    if (species === 'cow') this.voice(pan, { from: 120, peak: 150, to: 95, dur: 1.1, formant: 500, q: 1.5, vol: 0.35 });
    else if (species === 'pig') {
      for (const d of [0, 0.18]) setTimeout(() => this.voice(pan, { type: 'square', from: 260, peak: 320, to: 180, dur: 0.16, formant: 900, q: 3, vol: 0.2 }), d * 1000);
    } else if (species === 'tiger') {
      this.voice(pan, { from: 90, peak: 140, to: 60, dur: 0.9, formant: 320, q: 0.8, vol: 0.4, wobble: 25 });
      this.noise(0.8, { vol: 0.25, freq: 700, to: 200, q: 0.7, pan });
    } else if (species === 'bike') {
      for (const d of [0, 0.16]) this.tone(2600, 0.25, { type: 'sine', vol: 0.12, pan, delay: d }); // ring ring
    } else if (species === 'foot') {
      this.voice(pan, { from: 260, peak: 420, to: 240, dur: 0.3, formant: 1000, q: 2, vol: 0.25 }); // hey!
    } else this.neigh(pan);
  }

  // Woof woof: a small dog yaps high, a big one barks low.
  bark(pan, size = 1) {
    const k = 1.3 - size * 0.4;
    for (const d of [0, 0.2]) setTimeout(() => {
      this.voice(pan, { type: 'square', from: 420 * k, peak: 620 * k, to: 260 * k, dur: 0.13, formant: 1100 * k, q: 2.5, vol: 0.22 });
      this.noise(0.08, { vol: 0.12, freq: 1500 * k, q: 1.2, pan });
    }, d * 1000);
  }

  splash(pan) {
    this.noise(0.5, { vol: 0.45, freq: 1800, to: 500, q: 0.6, pan });
    this.noise(0.25, { vol: 0.3, freq: 300, type: 'lowpass', pan });
    this.tone(500, 0.12, { to: 900, type: 'sine', vol: 0.12, pan, delay: 0.05 });
  }

  // The tram's bell (sounds/tram-bell.mp3), rung three times in quick succession.
  tramBell(pan = 0, vol = 0.7) {
    if (!this.ctx || !this.sfxOn) return;
    this.bellBuf ??= fetch(new URL('../sounds/tram-bell.mp3', import.meta.url).href)
      .then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b)).catch(() => null);
    this.bellBuf.then(buf => {
      if (!buf) return;
      for (let i = 0; i < 3; i++) {
        const s = this.ctx.createBufferSource(), g = this.ctx.createGain();
        s.buffer = buf;
        g.gain.value = vol;
        s.connect(g).connect(this.out(pan));
        s.start(this.ctx.currentTime + i * 0.3);
      }
    });
  }

  bump(pan) {
    this.tone(130, 0.16, { to: 55, vol: 0.3, pan });
    this.noise(0.1, { vol: 0.2, freq: 250, type: 'lowpass', pan });
  }

  lap(pan, final) {
    const notes = final ? [659, 784, 988, 1319] : [659, 988];
    notes.forEach((f, i) => this.tone(f, 0.16, { type: 'square', vol: 0.09, pan, delay: i * 0.09 }));
  }

  finish(pan) {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      this.tone(f, i === 5 ? 0.7 : 0.16, { type: 'triangle', vol: 0.2, pan, delay: i * 0.12 }));
  }
}
