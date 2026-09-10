import { ZZFX } from 'zzfx';

/**
 * Tiefsee-Drone aus Oszillatoren, keine Audiodateien.
 * Zwei leicht verstimmte Sinus-Töne schweben, ein Tiefpass atmet, ab und zu ein Walruf.
 * Im Bosslevel pulsiert ein Subbass.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bossGain: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let started = false;
let whaleTimer = 0;
let targetVolume = 0.16;

export function startAmbient(): void {
  if (started) return;
  ctx = ZZFX.audioContext;
  if (!ctx) return;
  started = true;
  master = ctx.createGain();
  master.gain.value = 0;
  filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 260;
  filter.Q.value = 0.8;
  filter.connect(master).connect(ctx.destination);

  const mk = (type: OscillatorType, freq: number, gain: number) => {
    const o = ctx!.createOscillator();
    o.type = type; o.frequency.value = freq;
    const g = ctx!.createGain(); g.gain.value = gain;
    o.connect(g).connect(filter!);
    o.start();
    return o;
  };
  mk('sine', 55, 0.5);
  mk('sine', 55.4, 0.5);
  mk('triangle', 110, 0.12);
  mk('sine', 82.5, 0.18);

  // Filter atmet
  const lfo = ctx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 120;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  // Boss-Puls
  bossGain = ctx.createGain(); bossGain.gain.value = 0;
  const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 41;
  const pulse = ctx.createOscillator(); pulse.type = 'sine'; pulse.frequency.value = 0.9;
  const pulseGain = ctx.createGain(); pulseGain.gain.value = 0.5;
  const subAmp = ctx.createGain(); subAmp.gain.value = 0.5;
  pulse.connect(pulseGain).connect(subAmp.gain);
  sub.connect(subAmp).connect(bossGain).connect(master);
  sub.start(); pulse.start();

  master.gain.setTargetAtTime(targetVolume, ctx.currentTime, 2);
}

function whale(): void {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  o.type = 'sine';
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
  const t0 = ctx.currentTime;
  const base = 150 + Math.random() * 120;
  o.frequency.setValueAtTime(base, t0);
  o.frequency.exponentialRampToValueAtTime(base * 1.8, t0 + 1.4);
  o.frequency.exponentialRampToValueAtTime(base * 1.1, t0 + 3.2);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.22, t0 + 0.8);
  g.gain.linearRampToValueAtTime(0, t0 + 3.4);
  o.connect(f).connect(g).connect(master);
  o.start(t0); o.stop(t0 + 3.5);
}

/** Pro Frame aufrufen. intensity 0..1 (Tiefe), boss an oder aus, danger 0..1 (Sauerstoff knapp). */
export function updateAmbient(dt: number, intensity: number, boss: boolean, danger: number, muted: boolean): void {
  if (!started || !ctx || !master || !bossGain || !filter) return;
  const vol = muted ? 0 : targetVolume * (0.8 + 0.4 * intensity);
  master.gain.setTargetAtTime(vol, ctx.currentTime, 0.5);
  bossGain.gain.setTargetAtTime(boss ? 0.9 : 0, ctx.currentTime, 1.2);
  filter.frequency.setTargetAtTime(220 + 200 * danger - 60 * intensity, ctx.currentTime, 1);
  whaleTimer -= dt;
  if (whaleTimer <= 0 && !muted) { whale(); whaleTimer = 14 + Math.random() * 16; }
}
