import { load, save } from '../kit/storage';

export interface Upgrades { range: number; lungs: number; prop: number }
export interface DiveEntry { depth: number; pearls: number; level: string; score: number; date: string }
export interface Meta {
  pearlBank: number;
  divelog: DiveEntry[];
  upgrades: Upgrades;
  achievements: string[];
  bestDepth: number;
  bestScore: number;
  dives: number;
  introSeen?: boolean;
  tutorialDone?: boolean;
  checkpoint?: number;
}
export interface Mods { pingRange: number; drain: number; speed: number }

const KEY = 'sonar-meta';

export function loadMeta(): Meta {
  const m = load<Meta>(KEY, { pearlBank: 0, divelog: [], upgrades: { range: 0, lungs: 0, prop: 0 }, achievements: [], bestDepth: 0, bestScore: 0, dives: 0 });
  if (!m.divelog) m.divelog = [];
  return m;
}

export function logDive(m: Meta, e: DiveEntry): void {
  m.divelog = [...m.divelog, e].sort((a, b) => b.score - a.score).slice(0, 5);
}
export function saveMeta(m: Meta): void { save(KEY, m); }

export const UPGRADES: { id: keyof Upgrades; name: string; desc: string; costs: number[] }[] = [
  { id: 'range', name: 'Sonar range', desc: 'Pings reach further', costs: [8, 20, 40] },
  { id: 'lungs', name: 'Lungs', desc: 'Oxygen drains slower', costs: [8, 20, 40] },
  { id: 'prop', name: 'Propeller', desc: 'Dive faster', costs: [8, 20, 40] },
];

export function upgradeCost(m: Meta, id: keyof Upgrades): number | null {
  const u = UPGRADES.find((x) => x.id === id)!;
  const tier = m.upgrades[id];
  return tier >= u.costs.length ? null : u.costs[tier];
}

export function buy(m: Meta, id: keyof Upgrades): boolean {
  const cost = upgradeCost(m, id);
  if (cost === null || m.pearlBank < cost) return false;
  m.pearlBank -= cost;
  m.upgrades[id]++;
  saveMeta(m);
  return true;
}

export function modsFrom(m: Meta): Mods {
  return { pingRange: 1 + 0.15 * m.upgrades.range, drain: 1 - 0.14 * m.upgrades.lungs, speed: 1 + 0.12 * m.upgrades.prop };
}

export const ACHIEVEMENTS: { id: string; name: string; desc: string; icon: string }[] = [
  { id: 'first', name: 'First pearl', desc: 'Collect a pearl', icon: '🫧' },
  { id: 'kelp', name: 'Kelp diver', desc: 'Reach the Kelp Forest', icon: '🌿' },
  { id: 'wreck', name: 'Wreck diver', desc: 'Reach the Wreck', icon: '⚓' },
  { id: 'trench', name: 'Trench diver', desc: 'Reach the Trench', icon: '🕳️' },
  { id: 'angler', name: 'Face the Angler', desc: 'Meet the boss', icon: '🐟' },
  { id: 'slayer', name: 'Angler slayer', desc: 'Defeat the Angler', icon: '💥' },
  { id: 'pearls15', name: 'Pearl hoarder', desc: '15 pearls in one dive', icon: '📿' },
  { id: 'quiet', name: 'Quiet diver', desc: 'Finish a level with 2 pings or fewer', icon: '🤫' },
];

/** Gibt true zurück, wenn das Achievement neu ist. */
export function unlock(m: Meta, id: string): boolean {
  if (m.achievements.includes(id)) return false;
  m.achievements.push(id);
  saveMeta(m);
  return true;
}
