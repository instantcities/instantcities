// Procedural background music: a tiny step sequencer scheduling synth notes ahead of time.
// Tunes are written as bars of [chord, melody], melody as [midi note or null, length in eighths].
// A bar holds `meter` steps; a step is an eighth, or a sixteenth when the tune sets `div: 2`.

const CHORDS = {
  C: { root: 48, notes: [60, 64, 67] },
  C7: { root: 48, notes: [58, 64, 67] },
  Cm: { root: 48, notes: [60, 63, 67] },
  D7: { root: 50, notes: [60, 62, 66] },
  Dm: { root: 50, notes: [62, 65, 69] },
  D: { root: 50, notes: [62, 66, 69] },
  E7: { root: 40, notes: [59, 62, 68] },
  Em: { root: 40, notes: [59, 64, 67] },
  F: { root: 41, notes: [60, 65, 69] },
  G: { root: 43, notes: [59, 62, 67] },
  G7: { root: 43, notes: [59, 65, 67] },
  Am: { root: 45, notes: [60, 64, 69] },
  Bb: { root: 46, notes: [62, 65, 70] },
};

const TUNES = {
  // 't Vliegerke (Walter De Buck), 2/4 in F, from the sheet music (bew. M. Van Aken).
  // Counted in sixteenths; repeats written out; a tie is a note running into the next bar's rest.
  vliegerke: {
    meter: 8, div: 2,
    bars: [
      ['F', [[69, 2], [72, 2], [69, 2], [72, 2]]],
      ['F', [[69, 2], [65, 2], [60, 2], [60, 2]]],
      ['C7', [[67, 2], [66, 2], [67, 2], [69, 2]]],
      ['F', [[67, 4], [65, 4]]],
      ['F', [[69, 2], [72, 2], [69, 2], [72, 2]]],
      ['F', [[69, 2], [65, 2], [60, 2], [60, 2]]],
      ['C7', [[67, 2], [66, 2], [67, 2], [69, 2]]],
      ['F', [[65, 6], [65, 2]]],
      ['C', [[67, 2], [67, 2], [67, 2], [67, 2]]],
      ['F/C', [[69, 2], [69, 2], [67, 3], [67, 1]]],
      ['F/G7', [[69, 2], [67, 2], [69, 2], [71, 2]]],
      ['C', [[72, 4], [67, 4]]],
      ['C', [[67, 2], [67, 2], [67, 2], [67, 2]]],
      ['F/C', [[69, 2], [69, 2], [67, 3], [67, 1]]],
      ['F/G7', [[69, 2], [67, 2], [69, 2], [71, 2]]],
      ['C', [[72, 4], [72, 4]]],
      ['C7', [[72, 4], [70, 4]]],
      ['F', [[69, 4], [69, 6]]],
      ['F', [[null, 2], [60, 2], [60, 2], [69, 2]]],
      ['C7', [[67, 8]]],
      ['C7', [[null, 2], [67, 2], [67, 2], [74, 2]]],
      ['C7', [[74, 4], [72, 6]]],
      ['C7', [[null, 2], [70, 2], [70, 2], [72, 2]]],
      ['F', [[69, 8]]],
      ['F', [[null, 2], [72, 2], [72, 2], [70, 2]]],
      ['F', [[69, 4], [69, 6]]],
      ['F', [[null, 2], [74, 2], [74, 2], [72, 2]]],
      ['Bb', [[70, 8]]],
      ['Bb', [[null, 2], [65, 2], [64, 2], [62, 2]]],
      ['C7', [[60, 2], [72, 2], [72, 6]]],
      ['C7', [[null, 2], [70, 2], [69, 2], [67, 2]]],
      ['F', [[65, 8]]],
    ],
  },

  // Klokke Roeland, 4/4 in C, from the sheet music (bew. M. Van Aken), in sixteenths.
  klokke: {
    meter: 16, div: 2,
    bars: [
      ['C', [[67, 4], [69, 2], [67, 2], [64, 8]]],
      ['C', [[64, 4], [65, 2], [64, 2], [60, 8]]],
      ['C/G', [[60, 4], [62, 2], [64, 2], [62, 2], [67, 2], [69, 2], [71, 2]]],
      ['D7/G', [[69, 8], [67, 8]]],
      ['C', [[67, 4], [69, 2], [67, 2], [64, 8]]],
      ['C', [[64, 4], [65, 2], [64, 2], [60, 8]]],
      ['C/G', [[60, 4], [62, 2], [64, 2], [62, 2], [67, 2], [69, 2], [71, 2]]],
      ['D7/G', [[69, 8], [67, 8]]],
      ['G7', [[67, 4], [65, 2], [62, 2], [59, 8]]],
      ['F/G7/C/C', [[69, 4], [67, 2], [64, 2], [60, 2], [60, 2], [60, 2], [62, 2]]],
      ['Cm', [[63, 4], [63, 4], [62, 4], [60, 4]]],
      ['G', [[67, 8], [67, 8]]],
      ['C', [[64, 4], [64, 3], [65, 1], [67, 8]]],
      ['F/C', [[69, 4], [67, 3], [66, 1], [67, 4], [64, 4]]],
      ['G7', [[62, 4], [62, 3], [64, 1], [65, 8]]],
      ['F/C', [[69, 4], [67, 3], [66, 1], [67, 4], [64, 4]]],
      ['C', [[64, 4], [64, 3], [65, 1], [67, 4], [64, 4]]],
      ['F', [[65, 4], [67, 4], [69, 8]]],
      ['Dm/G7', [[69, 4], [71, 2], [72, 2], [67, 4], [67, 4]]],
      ['C', [[69, 4], [71, 4], [72, 8]]],
    ],
  },
  // Kernkraft 400 (Zombie Nation), the stadium riff in A minor, four times round.
  kernkraft: {
    meter: 8,
    bars: [
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [69, 4]]],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [77, 1], [76, 1], [72, 1], [74, 3]]],
      ['Dm/Em', [[null, 3], [72, 2], [76, 1], [69, 4]]],
      ['Am', []],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [69, 4]]],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [77, 1], [76, 1], [72, 1], [74, 3]]],
      ['Dm/Em', [[null, 3], [72, 2], [76, 1], [69, 4]]],
      ['Am', []],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [69, 4]]],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [77, 1], [76, 1], [72, 1], [74, 3]]],
      ['Dm/Em', [[null, 3], [72, 2], [76, 1], [69, 4]]],
      ['Am', []],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [69, 4]]],
      ['Am', [[69, 1], [72, 1], [74, 1], [76, 1], [77, 1], [76, 1], [72, 1], [74, 3]]],
      ['Dm/Em', [[null, 3], [72, 2], [76, 1], [69, 4]]],
      ['Am', []],
    ],
  },

  // Sous le ciel de Paris (Hubert Giraud), a musette waltz in A minor, from memory.
  paris: {
    meter: 6, tempo: 1.15,
    bars: [
      ['Am', [[69, 2], [72, 2], [76, 2]]],
      ['Am', [[76, 3], [74, 1], [72, 1], [71, 1]]],
      ['Dm', [[69, 2], [72, 2], [74, 2]]],
      ['E7', [[71, 6]]],
      ['Am', [[69, 2], [72, 2], [76, 2]]],
      ['Am', [[77, 3], [76, 1], [74, 1], [72, 1]]],
      ['Dm', [[74, 2], [72, 2], [69, 2]]],
      ['E7/Am', [[68, 3], [69, 3]]],
      ['Am', [[76, 2], [76, 2], [76, 2]]],
      ['Dm', [[77, 3], [76, 1], [74, 1], [72, 1]]],
      ['E7', [[74, 2], [72, 2], [71, 2]]],
      ['Am', [[69, 6]]],
      ['Dm', [[72, 2], [74, 2], [77, 2]]],
      ['G7', [[76, 3], [74, 1], [72, 1], [71, 1]]],
      ['C', [[72, 2], [76, 2], [79, 2]]],
      ['E7/Am', [[71, 3], [69, 3]]],
    ],
  },
};

// The title screen plays one tune, its city's (the city is the page's first folder, /paris/play/).
const MENU_TUNES = { ghent: 'vliegerke', paris: 'paris' };
const MENU_TUNE = MENU_TUNES[location.pathname.split('/')[1]] ?? 'vliegerke';

// Each song cycles through its tunes, one full pass each, in its own arrangement.
const SONGS = {
  // The original gameplay arrangement, restored from before October 4, 2026.
  race: { bpm: 150, style: 'galop', leadType: 'square', leadVol: 0.1, transpose: 0, tunes: ['vliegerke', 'klokke', 'kernkraft'] },
  // Title screen: straight, at 100 bpm, with an echoing triangle lead.
  menu: { bpm: 100, leadType: 'triangle', leadVol: 0.2, transpose: -12, echo: true, tunes: [MENU_TUNE] },
};

const hz = m => 440 * Math.pow(2, (m - 69) / 12);

function prepare(song, tune) {
  const meter = tune.meter, div = tune.div || 1, steps = tune.bars.length * meter;
  const lead = new Array(steps).fill(null), chord = new Array(steps);
  tune.bars.forEach(([c, mel], b) => {
    const parts = c.split('/'); // a bar's chords share it evenly
    for (let s = 0; s < meter; s++) chord[b * meter + s] = CHORDS[parts[Math.floor(s * parts.length / meter)]];
    let s = 0;
    for (const [m, len] of mel) {
      if (m !== null) lead[b * meter + s] = { m: m + song.transpose, len };
      s += len;
    }
  });
  return { ...song, meter, div, bpm: song.bpm * (tune.tempo || 1), steps, lead, chord };
}

const PREPARED = Object.fromEntries(Object.entries(SONGS).map(([k, s]) => [k, s.tunes.map(t => prepare(s, TUNES[t]))]));

// Recorded music, played as it is and once instead of a tune: its file in core/sounds, and
// how loud. The tour's: "Epic Piano" by Nastelbom (Pixabay, free to use), from 0:15 on.
const RECORDINGS = {
  tour: { url: new URL('../sounds/tour.mp3', import.meta.url).href, vol: 0.45 },
};

export class Music {
  constructor(audio) {
    this.a = audio;
    this.name = null;
    this.song = null;
    this.step = 0;
    this.next = 0;
    this.timer = null;
    this.ahead = 0.15; // seconds of music scheduled ahead
    this.loaded = {}; // the recordings, decoded: a promise of each's buffer
    this.playing = null; // the recording playing: { src, gain }
  }

  // from: seconds into a recording to start at (the demo's music)
  play(name, from = 0) {
    if (this.name === name) return;
    this.hush();
    this.name = name;
    this.from = from;
    if (RECORDINGS[name]) {
      this.song = null;
      this.record();
      return;
    }
    this.tunes = PREPARED[name];
    this.tune = 0;
    this.song = this.tunes[0];
    this.step = 0;
    this.restart();
  }

  // Silence: the notes already scheduled ring out, no new ones follow.
  stop() {
    this.name = null;
    this.song = null;
    this.hush();
  }

  // The recording for this.name, from its start (or this.from), fading in (once the browser allows audio).
  async record() {
    const ctx = this.a.ctx, name = this.name, rec = RECORDINGS[name];
    if (!ctx || !rec || this.playing) return;
    this.loaded[name] ??= fetch(rec.url).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b));
    let buf;
    try { buf = await this.loaded[name]; } catch { delete this.loaded[name]; return; } // offline: next time
    if (this.name !== name || this.playing) return; // something else asked for meanwhile
    const src = ctx.createBufferSource(), gain = ctx.createGain(), t = ctx.currentTime;
    src.buffer = buf;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(rec.vol, t + 1.5);
    src.connect(gain).connect(this.a.musicBus); // the music switch turns it down with the rest
    src.start(t, this.from ?? 0);
    this.playing = { src, gain };
  }

  // The recording playing fades out and stops.
  hush() {
    const p = this.playing;
    if (!p) return;
    this.playing = null;
    const t = this.a.ctx.currentTime;
    p.gain.gain.cancelScheduledValues(t);
    p.gain.gain.setTargetAtTime(0, t, 0.25);
    p.src.stop(t + 1.5);
  }

  // Called once the browser allows audio (first key press or click).
  restart() {
    const ctx = this.a.ctx;
    if (RECORDINGS[this.name]) return this.record();
    if (!ctx || !this.song) return;
    this.next = ctx.currentTime + 0.08;
    if (!this.timer) this.timer = setInterval(() => this.tick(), 25);
  }

  tick() {
    const ctx = this.a.ctx;
    if (!ctx || !this.song) return;
    if (!this.a.musicOn) {
      this.next = ctx.currentTime + 0.05;
      return;
    }
    if (this.next < ctx.currentTime - 0.1) this.next = ctx.currentTime + 0.02; // fell behind (hidden tab)
    while (this.next < ctx.currentTime + this.ahead) {
      const dur = 60 / this.song.bpm / 2 / this.song.div;
      this.schedule(this.step, this.next, dur);
      this.next += dur;
      if (++this.step >= this.song.steps) {
        this.step = 0;
        this.tune = (this.tune + 1) % this.tunes.length;
        this.song = this.tunes[this.tune];
      }
    }
  }

  echoBus() {
    if (!this.echo) {
      const ctx = this.a.ctx;
      const input = ctx.createGain(), delay = ctx.createDelay(1), feedback = ctx.createGain(), wet = ctx.createGain();
      delay.delayTime.value = 0.3;
      feedback.gain.value = 0.3;
      wet.gain.value = 0.3;
      input.connect(this.a.musicBus);
      input.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(wet).connect(this.a.musicBus);
      this.echo = input;
    }
    return this.echo;
  }

  schedule(step, t, dur) {
    const a = this.a, song = this.song, bus = a.musicBus, s = step % song.meter;
    const at = t + (s % 2 ? (song.swing || 0) * dur : 0);
    const ch = song.chord[step];
    if (song.div === 2 && song.meter === 8) {
      // Polka in 2/4, counted in sixteenths: bass on the beats, chords on the off-beats.
      const race = song.style === 'galop', e = dur * 2;
      if (s === 0 || s === 4) a.tone(hz(s === 0 ? ch.root : ch.root + 7), e * (race ? 1.7 : 2.5), { type: 'triangle', vol: race ? 0.45 : 0.4, at, bus });
      if (s === 2 || s === 6) for (const n of ch.notes) a.tone(hz(n), e * (race ? 0.55 : 1.4), { type: race ? 'square' : 'triangle', vol: race ? 0.03 : 0.05, at, bus });
      if (race && (s === 0 || s === 4)) a.tone(150, 0.14, { to: 45, vol: 0.5, at, bus });
      if (!race && s === 0) a.tone(120, 0.12, { to: 50, vol: 0.25, at, bus });
      if (race && (s === 2 || s === 6)) a.noise(0.1, { vol: 0.16, freq: 1800, q: 0.8, at, bus });
      if (s % 2 === 0 && (race || s % 4)) a.noise(0.03, { vol: race ? (s % 4 ? 0.06 : 0.035) : 0.03, freq: race ? 8000 : 6000, type: 'highpass', at, bus });
    } else if (song.meter === 6) {
      // Waltz: bass on the first beat, chords on the other two.
      if (s === 0) a.tone(hz(ch.root), dur * 5, { type: 'triangle', vol: 0.4, at, bus });
      if (s === 2 || s === 4) for (const n of ch.notes) a.tone(hz(n), dur * 1.6, { type: 'triangle', vol: 0.05, at, bus });
      if (s === 0) a.tone(120, 0.12, { to: 50, vol: 0.25, at, bus });
    } else if (s % song.div === 0) {
      // 4/4: patterns on the eighths, also when the tune is counted in sixteenths.
      const q = s / song.div, e = dur * song.div;
      if (song.style === 'galop') {
        if (q % 2 === 0) a.tone(hz(q % 4 === 0 ? ch.root : ch.root + 7), e * 1.7, { type: 'triangle', vol: 0.45, at, bus });
        else for (const n of ch.notes) a.tone(hz(n), e * 0.55, { type: 'square', vol: 0.03, at, bus });
        if (q === 0 || q === 4) a.tone(150, 0.14, { to: 45, vol: 0.5, at, bus });
        if (q === 2 || q === 6) a.noise(0.1, { vol: 0.16, freq: 1800, q: 0.8, at, bus });
        a.noise(0.03, { vol: q % 2 ? 0.06 : 0.035, freq: 8000, type: 'highpass', at, bus });
      } else {
        if (q === 0 || q === 4) a.tone(hz(q === 0 ? ch.root : ch.root + 7), e * 3, { type: 'triangle', vol: 0.4, at, bus });
        if (q === 2 || q === 6) for (const n of ch.notes) a.tone(hz(n), e * 1.6, { type: 'triangle', vol: 0.05, at, bus });
        if (q === 0) a.tone(120, 0.12, { to: 50, vol: 0.25, at, bus });
        if (q % 2) a.noise(0.05, { vol: 0.03, freq: 6000, type: 'highpass', at, bus });
      }
    }
    const note = song.lead[step];
    if (note) a.tone(hz(note.m), note.len * dur * 0.92, { type: song.leadType, vol: song.leadVol, at, bus: song.echo ? this.echoBus() : bus });
  }
}
