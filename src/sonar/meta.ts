import { load, save } from '../kit/storage';

export interface Upgrades { range: number; lungs: number; prop: number; torpedo: number; hull: number }
export interface DiveEntry { depth: number; pearls: number; level: string; score: number; date: string }
export interface Meta {
  pearlBank: number;
  divelog: DiveEntry[];
  upgrades: Upgrades;
  achievements: string[];
  milestones: number[];
  bestDepth: number;
  bestScore: number;
  dives: number;
  introSeen?: boolean;
  tutorialDone?: boolean;
  checkpoint?: number;
}
export interface Mods { pingRange: number; drain: number; speed: number; torpedoes: number; hull: number }

const KEY = 'sonar-meta';

export function loadMeta(): Meta {
  const m = load<Meta>(KEY, { pearlBank: 0, divelog: [], upgrades: { range: 0, lungs: 0, prop: 0, torpedo: 0, hull: 0 }, achievements: [], milestones: [], bestDepth: 0, bestScore: 0, dives: 0 });
  if (!m.divelog) m.divelog = [];
  if (!m.milestones) m.milestones = [];
  if (m.upgrades.torpedo === undefined) m.upgrades.torpedo = 0;
  if (m.upgrades.hull === undefined) m.upgrades.hull = 0;
  return m;
}
export function saveMeta(m: Meta): void { save(KEY, m); }

export function logDive(m: Meta, e: DiveEntry): void {
  m.divelog = [...m.divelog, e].sort((a, b) => b.score - a.score).slice(0, 5);
}

export const UPGRADES: { id: keyof Upgrades; name: string; desc: string; costs: number[] }[] = [
  { id: 'range', name: 'Sonar range', desc: 'Pings reach further', costs: [8, 20, 40] },
  { id: 'lungs', name: 'Lungs', desc: 'Oxygen drains slower', costs: [8, 20, 40] },
  { id: 'prop', name: 'Propeller', desc: 'Dive faster', costs: [8, 20, 40] },
  { id: 'torpedo', name: 'Torpedo bay', desc: 'Start every dive with torpedoes', costs: [15, 30, 60] },
  { id: 'hull', name: 'Reinforced hull', desc: 'Start with a shield. Tier 2: every level', costs: [20, 45, 80] },
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
  return { pingRange: 1 + 0.15 * m.upgrades.range, drain: 1 - 0.14 * m.upgrades.lungs, speed: 1 + 0.12 * m.upgrades.prop, torpedoes: m.upgrades.torpedo, hull: m.upgrades.hull };
}

export interface Achievement { id: string; name: string; desc: string; icon: string; secret?: boolean }
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First pearl', desc: 'Collect a pearl', icon: '🫧' },
  { id: 'kelp', name: 'Kelp diver', desc: 'Reach the Kelp Forest', icon: '🌿' },
  { id: 'wreck', name: 'Wreck diver', desc: 'Reach the Wreck', icon: '⚓' },
  { id: 'trench', name: 'Trench diver', desc: 'Reach the Trench', icon: '🕳️' },
  { id: 'angler', name: 'Face the Angler', desc: 'Meet the first boss', icon: '🐟' },
  { id: 'slayer', name: 'Angler slayer', desc: 'Defeat the Angler', icon: '💥' },
  { id: 'kraken', name: 'Kraken slayer', desc: 'Defeat the Kraken', icon: '🦑' },
  { id: 'leviathan', name: 'Leviathan slayer', desc: 'Defeat the Leviathan', icon: '🐉' },
  { id: 'pearls15', name: 'Pearl hoarder', desc: '15 pearls in one dive', icon: '📿' },
  { id: 'pearls30', name: 'Pearl baron', desc: '30 pearls in one dive', icon: '👑' },
  { id: 'gunner', name: 'Gunner', desc: 'Blow up 5 mines with torpedoes in one dive', icon: '🎯' },
  { id: 'depth300', name: 'Deep one', desc: 'Reach 300 m', icon: '🌑' },
  { id: 'quiet', name: 'Quiet diver', desc: 'Finish a level with 2 pings or fewer', icon: '🤫' },
  { id: 'ghost', name: 'Ghost', desc: 'Finish a level without a single ping', icon: '👻', secret: true },
  { id: 'fulltank', name: 'Full tank', desc: 'Enter a hatch with full oxygen', icon: '🫁', secret: true },
  { id: 'captain', name: "Captain's pearl", desc: 'Ping inside the wreck', icon: '🏴‍☠️', secret: true },
  { id: 'whale', name: 'Whale watcher', desc: 'Sit still in the kelp for 8 seconds', icon: '🐋', secret: true },
];

/** Gibt true zurück, wenn das Achievement neu ist. */
export function unlock(m: Meta, id: string): boolean {
  if (m.achievements.includes(id)) return false;
  m.achievements.push(id);
  saveMeta(m);
  return true;
}

export const MILESTONES: { depth: number; reward: number; paint: string }[] = [
  { depth: 45, reward: 5, paint: '#ffd23f' },
  { depth: 80, reward: 10, paint: '#ffd23f' },
  { depth: 120, reward: 15, paint: '#ff9a5c' },
  { depth: 160, reward: 20, paint: '#ff9a5c' },
  { depth: 200, reward: 25, paint: '#ff6b6b' },
  { depth: 280, reward: 35, paint: '#ff6b6b' },
  { depth: 400, reward: 60, paint: '#7ff5e6' },
  { depth: 520, reward: 80, paint: '#e8f0f2' },
];

/** Liefert neu erreichte Meilensteine und schreibt sie fest. */
export function claimMilestones(m: Meta, depth: number): { depth: number; reward: number }[] {
  const fresh = MILESTONES.filter((ms) => ms.depth <= depth && !m.milestones.includes(ms.depth));
  for (const ms of fresh) { m.milestones.push(ms.depth); m.pearlBank += ms.reward; }
  if (fresh.length) saveMeta(m);
  return fresh;
}

export function paintFor(m: Meta): string {
  let paint = '#ffd23f';
  for (const ms of MILESTONES) if (m.milestones.includes(ms.depth)) paint = ms.paint;
  return paint;
}
