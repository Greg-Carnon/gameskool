import { load, save } from '../kit/storage';

export interface Ach { id: string; name: string; desc: string; icon: string }
export const ACHIEVEMENTS: Ach[] = [
  { id: 'smooth', name: 'Smooth operator', desc: 'First correct pick', icon: '✅' },
  { id: 'streak10', name: 'Ten in a row', desc: 'Streak of 10', icon: '🔥' },
  { id: 'patient', name: 'Patient man', desc: 'Wait correctly 10 times', icon: '🚪' },
  { id: 'stall', name: 'Stall wise', desc: 'Take a free stall 5 times', icon: '🚽' },
  { id: 'mate', name: 'Bro code', desc: 'Stand next to your mate 5 times', icon: '🤝' },
  { id: 'ice', name: 'Ice cold', desc: 'Ignore the mirror 5 times', icon: '🪞' },
  { id: 'mover', name: 'Nope, moving', desc: 'Handle 5 latecomers correctly', icon: '🚶' },
  { id: 'dryer', name: 'Dry hands', desc: 'Perfect hand dryer 3 times', icon: '💨' },
  { id: 'noboss', name: 'Career intact', desc: 'Finish The Boss without a strike', icon: '👔' },
  { id: 'rush', name: 'Rush hour survivor', desc: 'Finish Rush Hour', icon: '🏟️' },
  { id: 'day', name: 'A whole day', desc: 'Survive all eight places', icon: '🌙' },
  { id: 'daily', name: 'Daily diver', desc: 'Play the daily run', icon: '📅' },
];

export interface PMeta {
  best: number; bestLevel: number; games: number; milestones: number[];
  achievements: string[];
  counters: Record<string, number>;
  daily: Record<string, number>;   // Datum → beste Runden
  tokens: number;                  // Handtrockner-Münzen für Extra-Perks
}
const KEY = 'pissoir-meta';
export function loadMeta(): PMeta {
  const m = load<PMeta>(KEY, { best: 0, bestLevel: 0, games: 0, milestones: [], achievements: [], counters: {}, daily: {}, tokens: 0 });
  m.achievements ??= []; m.counters ??= {}; m.daily ??= {}; m.tokens ??= 0; m.milestones ??= [];
  return m;
}
export function saveMeta(m: PMeta): void { save(KEY, m); }

/** Zählt und schaltet frei. Gibt das Achievement zurück, wenn es neu ist. */
export function bump(m: PMeta, counter: string, id: string, needed: number): Ach | null {
  m.counters[counter] = (m.counters[counter] ?? 0) + 1;
  if (m.counters[counter] >= needed) return unlock(m, id);
  saveMeta(m);
  return null;
}
export function unlock(m: PMeta, id: string): Ach | null {
  if (m.achievements.includes(id)) return null;
  m.achievements.push(id);
  saveMeta(m);
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}
