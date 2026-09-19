import { ZZFX } from 'zzfx';
import { isMuted } from './sfx';

/**
 * Sample-Player für echte Aufnahmen (MP3), gleicher AudioContext wie ZzFX.
 * Lädt lazy, dekodiert einmal, spielt mit leichtem Pitch-Jitter, kann loopen.
 */
export interface SamplePlayer {
  preload(names: string[]): void;
  play(name: string, o?: { vol?: number; jitter?: number; rate?: number }): void;
  loop(name: string, vol?: number): void;
  stopLoop(fade?: number): void;
}

export function createSamples(base: string): SamplePlayer {
  const ctx = ZZFX.audioContext as AudioContext;
  const buffers = new Map<string, AudioBuffer>();
  const pending = new Map<string, Promise<AudioBuffer | null>>();
  let loopSrc: AudioBufferSourceNode | null = null;
  let loopGain: GainNode | null = null;
  let loopName = '';

  const load = (name: string): Promise<AudioBuffer | null> => {
    const have = buffers.get(name);
    if (have) return Promise.resolve(have);
    const p = pending.get(name);
    if (p) return p;
    const np = fetch(`${base}/${name}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { buffers.set(name, buf); return buf; })
      .catch(() => null);
    pending.set(name, np);
    return np;
  };

  return {
    preload(names) { for (const n of names) void load(n); },
    play(name, o = {}) {
      if (isMuted()) return;
      void load(name).then((buf) => {
        if (!buf || ctx.state !== 'running') return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.playbackRate.value = (o.rate ?? 1) * (1 + (Math.random() * 2 - 1) * (o.jitter ?? 0.04));
        const g = ctx.createGain();
        g.gain.value = o.vol ?? 1;
        src.connect(g).connect(ctx.destination);
        src.start();
      });
    },
    loop(name, vol = 1) {
      if (loopName === name && loopSrc) { if (loopGain) loopGain.gain.setTargetAtTime(isMuted() ? 0 : vol, ctx.currentTime, 0.5); return; }
      this.stopLoop(0.8);
      loopName = name;
      void load(name).then((buf) => {
        if (!buf || loopName !== name) return;
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const g = ctx.createGain();
        g.gain.value = 0;
        g.gain.setTargetAtTime(isMuted() ? 0 : vol, ctx.currentTime, 0.8);
        src.connect(g).connect(ctx.destination);
        src.start();
        loopSrc = src; loopGain = g;
      });
    },
    stopLoop(fade = 0.5) {
      const s = loopSrc, g = loopGain;
      loopSrc = null; loopGain = null; loopName = '';
      if (!s || !g) return;
      g.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
      setTimeout(() => { try { s.stop(); } catch { /* schon aus */ } }, fade * 1000 + 100);
    },
  };
}
