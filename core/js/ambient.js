// The hum of the street: engines of passing cars and bikes riding by, your own included. A few voices that never stop, each following one of the nearest sources: louder close
// by, panned to where it is from the camera, pitched up coming at you and down going away. Police
// cars have their siren on (sounds/siren.wav: Work With Sounds / Konrad Gutkowski, CC BY 4.0).

const CAR = { voices: 5, ref: 7, max: 110, vol: 0.16 };
const BIKE = { voices: 4, ref: 2.5, max: 40, vol: 0.22 };
const SIREN = { voices: 2, ref: 14, max: 220, vol: 0.32 };
const KINDS = { car: CAR, bike: BIKE, siren: SIREN };
const SOUND_SPEED = 140; // slower than real, for a Doppler you can hear

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Ambient {
  constructor(sfx) {
    this.sfx = sfx;
    this.bus = null;
    this.prev = { car: new WeakMap(), bike: new WeakMap(), siren: new WeakMap() }; // per kind, source key -> last position, for its speed towards the listener
  }

  build() {
    const ctx = this.sfx.ctx;
    this.bus = ctx.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(this.sfx.fxBus);
    this.cars = Array.from({ length: CAR.voices }, () => this.carVoice(ctx));
    this.bikes = Array.from({ length: BIKE.voices }, () => this.bikeVoice(ctx));
    this.sirens = Array.from({ length: SIREN.voices }, () => this.bikeVoice(ctx));
    this.loadLoop(ctx, new URL('../sounds/bike.wav', import.meta.url).href, this.bikes); // core/sounds, whichever city's page
    this.loadLoop(ctx, new URL('../sounds/siren.wav', import.meta.url).href, this.sirens);
  }

  noise(ctx) {
    const s = ctx.createBufferSource();
    s.buffer = this.sfx.noiseBuf;
    s.loop = true;
    s.start(0, Math.random());
    return s;
  }

  voiceOut(ctx) {
    const gain = ctx.createGain(), pan = ctx.createStereoPanner();
    gain.gain.value = 0;
    gain.connect(pan).connect(this.bus);
    return { gain, pan };
  }

  // An engine: two detuned saws through a lowpass for the rumble, and road noise from the tyres.
  carVoice(ctx) {
    const v = { src: null, ...this.voiceOut(ctx) };
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 280;
    lp.Q.value = 2;
    v.oscs = [1, 1.51].map(k => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 40 * k;
      o.k = k;
      o.connect(lp);
      o.start();
      return o;
    });
    lp.connect(v.gain);
    v.lp = lp;
    const road = ctx.createBiquadFilter();
    road.type = 'bandpass';
    road.frequency.value = 500;
    road.Q.value = 0.7;
    v.road = ctx.createGain();
    v.road.gain.value = 0;
    this.noise(ctx).connect(road).connect(v.road).connect(v.gain);
    return v;
  }

  // A bike or a siren: a recorded loop (sounds/bike.wav, sounds/siren.wav), a bike's played faster
  // the faster it goes. The loop arrives after the voices are built; until then they stay silent.
  bikeVoice(ctx) {
    return { src: null, rate: null, ...this.voiceOut(ctx) };
  }

  async loadLoop(ctx, url, voices) {
    try {
      const buf = await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
      for (const v of voices) {
        const s = ctx.createBufferSource();
        s.buffer = buf;
        s.loop = true;
        s.connect(v.gain);
        s.start(0, Math.random() * buf.duration);
        v.rate = s.playbackRate;
      }
    } catch { /* offline and never kept: these stay silent */ }
  }

  // listeners: [{ x, z, dx, dz (looking direction), pan }], one per player's camera.
  // sources: [{ key, kind: 'car' | 'bike' | 'siren', x, z, speed, own? }]; own = that player's own bike.
  update(dt, on, listeners, sources) {
    const sfx = this.sfx;
    if (!sfx.ctx) return;
    if (!this.bus) this.build();
    const now = sfx.ctx.currentTime;
    this.bus.gain.setTargetAtTime(on && sfx.sfxOn && listeners.length ? 1 : 0, now, 0.15);
    if (!on || !listeners.length) return;

    // how loud each source is at its nearest listener, and from where
    for (const s of sources) {
      const cfg = KINDS[s.kind];
      let best = null;
      for (const l of listeners) {
        const d = Math.hypot(s.x - l.x, s.z - l.z);
        if (!best || d < best.d) best = { d, l };
      }
      const { l } = best, d = s.own != null ? 1.5 : best.d;
      s.loud = d > cfg.max ? 0 : Math.min(1, cfg.ref / Math.max(d, 0.5)) * (1 - d / cfg.max) ** 2;
      // pan: left or right of where the camera looks, and towards the player's half in split screen
      const side = best.d > 0.5 ? ((s.x - l.x) * -l.dz + (s.z - l.z) * l.dx) / best.d : 0;
      s.pan = s.own != null ? l.pan : clamp(listeners.length > 1 ? l.pan * 0.6 + side * 0.4 : side * 0.85, -1, 1);
      // Doppler, from how fast it closes in on the listener
      const prev = this.prev[s.kind], p = prev.get(s.key);
      const closing = p && dt > 0 ? (Math.hypot(p.x - l.x, p.z - l.z) - best.d) / dt : 0;
      prev.set(s.key, { x: s.x, z: s.z });
      s.pitch = s.own != null ? 1 : clamp(SOUND_SPEED / (SOUND_SPEED - clamp(closing, -40, 40)), 0.75, 1.35);
    }
    this.assign(this.cars, sources.filter(s => s.kind === 'car'), now, (v, s) => {
      const rev = 38 + s.speed * 5.5 + Math.sin(now * 2.3 + v.oscs[0].k) * 1.5;
      for (const o of v.oscs) o.frequency.setTargetAtTime(rev * o.k * s.pitch, now, 0.08);
      v.lp.frequency.setTargetAtTime(220 + s.speed * 30, now, 0.1);
      v.road.gain.setTargetAtTime(clamp(s.speed / 12, 0, 1) * 0.8, now, 0.1);
      return CAR.vol * (0.55 + 0.45 * clamp(s.speed / 12, 0, 1));
    });
    this.assign(this.bikes, sources.filter(s => s.kind === 'bike'), now, (v, s) => {
      v.rate?.setTargetAtTime(clamp(0.6 + s.speed / 20, 0.6, 1.3) * s.pitch, now, 0.1);
      return BIKE.vol * clamp(s.speed / 10, 0, 1);
    });
    this.assign(this.sirens, sources.filter(s => s.kind === 'siren'), now, (v, s) => {
      v.rate?.setTargetAtTime(s.pitch, now, 0.1);
      return SIREN.vol;
    });

  }

  // Give the loudest sources a voice each, keeping a voice on the source it already follows.
  assign(voices, sources, now, shape) {
    const top = sources.filter(s => s.loud > 0.003).sort((a, b) => b.loud - a.loud).slice(0, voices.length);
    const keys = new Set(top.map(s => s.key));
    for (const v of voices) if (v.src && !keys.has(v.src)) v.src = null;
    const taken = new Set(voices.map(v => v.src).filter(Boolean));
    for (const s of top) {
      if (taken.has(s.key)) continue;
      const v = voices.find(o => !o.src);
      v.src = s.key;
      taken.add(s.key);
    }
    for (const v of voices) {
      const s = v.src && top.find(o => o.key === v.src);
      if (!s) { v.gain.gain.setTargetAtTime(0, now, 0.1); continue; }
      const vol = shape(v, s);
      v.gain.gain.setTargetAtTime(vol * s.loud, now, 0.06);
      v.pan.pan.setTargetAtTime(s.pan, now, 0.06);
    }
  }
}
