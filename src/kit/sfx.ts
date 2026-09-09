import { ZZFX } from 'zzfx';
import { load, save } from './storage';

/**
 * ZzFX-Wrapper. Audio wird erst nach einer User-Geste freigeschaltet (iOS zählt pointerup).
 * Pitch wird pro Abspielen leicht randomisiert, damit Wiederholungen nicht nerven.
 */
export type SoundBank = Record<string, number[]>;

let unlocked = false;
let muted = load<boolean>('sfx-muted', false);

export function unlockAudio(): void {
  if (unlocked) return;
  const ctx = ZZFX.audioContext;
  if (ctx.state === 'suspended') void ctx.resume();
  unlocked = true;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(v: boolean): void {
  muted = v;
  save('sfx-muted', v);
}

export function createSfx(bank: SoundBank) {
  return {
    play(name: keyof typeof bank, pitchJitter = 0.08, volume = 1): void {
      if (muted || !unlocked) return;
      const base = bank[name as string];
      if (!base) return;
      const p = base.slice();
      p[0] = (p[0] ?? 1) * volume;
      p[2] = (p[2] ?? 220) * (1 + (Math.random() * 2 - 1) * pitchJitter);
      try {
        ZZFX.play(...p);
      } catch {
        /* Audio kann auf manchen Geräten fehlen */
      }
    },
  };
}
