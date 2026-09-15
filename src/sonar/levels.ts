export type Env = 'shallows' | 'kelp' | 'wreck' | 'trench' | 'lair' | 'abyss' | 'kraken' | 'deep' | 'grotto';
export type BossKind = 'angler' | 'kraken' | 'leviathan' | 'megalodon';

export interface LevelConfig {
  name: string;
  env: Env;
  depth: number;
  pearlsNeeded: number;
  counts: { pearl: number; mine: number; jelly: number; fish: number; tank: number; powerups: number };
  pingMax: number;
  drain: number;
  currents: number;
  boss: BossKind | null;
  bossHp: number;
  intro: string;
}

export const LEVELS: LevelConfig[] = [
  { name: 'The Shallows', env: 'shallows', depth: 20, pearlsNeeded: 3, counts: { pearl: 3, mine: 5, jelly: 0, fish: 0, tank: 0, powerups: 1 }, pingMax: 300, drain: 2.6, currents: 0, boss: null, bossHp: 0, intro: 'Ping to see. Collect pearls. Find the hatch.' },
  { name: 'Kelp Forest', env: 'kelp', depth: 45, pearlsNeeded: 4, counts: { pearl: 4, mine: 6, jelly: 3, fish: 0, tank: 1, powerups: 1 }, pingMax: 290, drain: 3.0, currents: 0, boss: null, bossHp: 0, intro: 'Jellyfish drift here. They sting.' },
  { name: 'The Wreck', env: 'wreck', depth: 80, pearlsNeeded: 5, counts: { pearl: 4, mine: 7, jelly: 3, fish: 0, tank: 1, powerups: 2 }, pingMax: 280, drain: 3.3, currents: 2, boss: null, bossHp: 0, intro: 'Currents push you around. Plan your taps.' },
  { name: 'The Trench', env: 'trench', depth: 120, pearlsNeeded: 5, counts: { pearl: 4, mine: 7, jelly: 2, fish: 4, tank: 1, powerups: 2 }, pingMax: 250, drain: 3.6, currents: 1, boss: null, bossHp: 0, intro: 'Echo fish hear your pings. And they come.' },
  { name: 'The Angler', env: 'lair', depth: 160, pearlsNeeded: 4, counts: { pearl: 4, mine: 8, jelly: 0, fish: 0, tank: 2, powerups: 2 }, pingMax: 240, drain: 3.4, currents: 0, boss: 'angler', bossHp: 3, intro: 'Something big hunts your pings. Lure it into the mines.' },
  { name: 'The Abyss', env: 'abyss', depth: 200, pearlsNeeded: 6, counts: { pearl: 4, mine: 9, jelly: 4, fish: 4, tank: 1, powerups: 2 }, pingMax: 230, drain: 3.9, currents: 2, boss: null, bossHp: 0, intro: 'No bottom. Only deeper.' },
  { name: 'Black Smokers', env: 'deep', depth: 240, pearlsNeeded: 6, counts: { pearl: 4, mine: 10, jelly: 3, fish: 5, tank: 1, powerups: 2 }, pingMax: 225, drain: 4.0, currents: 3, boss: null, bossHp: 0, intro: 'Hot vents. Strong currents.' },
  { name: 'The Kraken', env: 'kraken', depth: 280, pearlsNeeded: 5, counts: { pearl: 4, mine: 9, jelly: 0, fish: 0, tank: 2, powerups: 3 }, pingMax: 230, drain: 3.6, currents: 0, boss: 'kraken', bossHp: 4, intro: 'It strikes where you ping. Ping next to the mines. Then move.' },
  { name: 'The Drop', env: 'abyss', depth: 320, pearlsNeeded: 7, counts: { pearl: 4, mine: 11, jelly: 4, fish: 5, tank: 1, powerups: 2 }, pingMax: 215, drain: 4.2, currents: 2, boss: null, bossHp: 0, intro: 'Deeper than anyone.' },
  { name: 'Silent Plain', env: 'deep', depth: 360, pearlsNeeded: 7, counts: { pearl: 4, mine: 12, jelly: 5, fish: 6, tank: 1, powerups: 2 }, pingMax: 210, drain: 4.4, currents: 3, boss: null, bossHp: 0, intro: 'Nothing here should be alive.' },
  { name: 'The Leviathan', env: 'lair', depth: 400, pearlsNeeded: 5, counts: { pearl: 4, mine: 10, jelly: 0, fish: 0, tank: 2, powerups: 3 }, pingMax: 220, drain: 3.8, currents: 0, boss: 'leviathan', bossHp: 5, intro: 'It follows you. Everywhere. Swim past the mines.' },
  { name: 'The Megalodon', env: 'deep', depth: 480, pearlsNeeded: 5, counts: { pearl: 4, mine: 12, jelly: 0, fish: 0, tank: 2, powerups: 3 }, pingMax: 220, drain: 3.8, currents: 0, boss: 'megalodon', bossHp: 6, intro: 'It charges in a straight line. Put a mine between you and it.' },
  { name: 'The Grotto', env: 'grotto', depth: 520, pearlsNeeded: 0, counts: { pearl: 0, mine: 0, jelly: 0, fish: 0, tank: 0, powerups: 0 }, pingMax: 400, drain: 0, currents: 0, boss: null, bossHp: 0, intro: 'No slop. No prompts. Only real websites.' },
];

const BOSS_CYCLE: BossKind[] = ['angler', 'kraken', 'leviathan', 'megalodon'];

/** Danach wiederholen sich die Tiefen mit steigender Härte, alle drei Levels ein Boss. */
export function levelAt(index: number): LevelConfig {
  if (index < LEVELS.length) return LEVELS[index];
  const base = LEVELS[LEVELS.length - 4];
  const cycle = index - LEVELS.length + 1;
  const bossIdx = cycle % 3 === 0 ? (cycle / 3 - 1) % BOSS_CYCLE.length : -1;
  const boss = bossIdx >= 0 ? BOSS_CYCLE[bossIdx] : null;
  const names: Record<BossKind, string> = { angler: 'The Angler returns', kraken: 'The Kraken returns', leviathan: 'The Leviathan returns', megalodon: 'The Megalodon returns' };
  return {
    ...base,
    env: boss ? (boss === 'kraken' ? 'kraken' : boss === 'megalodon' ? 'deep' : 'lair') : cycle % 2 ? 'abyss' : 'deep',
    name: boss ? names[boss] : `Abyss ${cycle + 1}`,
    depth: 520 + cycle * 40,
    pearlsNeeded: Math.min(9, 6 + Math.floor(cycle / 2)),
    counts: { pearl: 4, mine: Math.min(15, 10 + cycle), jelly: boss ? 0 : Math.min(6, 4 + Math.floor(cycle / 2)), fish: boss ? 0 : Math.min(8, 4 + Math.floor(cycle / 2)), tank: boss ? 2 : 1, powerups: 2 },
    pingMax: Math.max(190, 215 - cycle * 6),
    drain: Math.min(5.5, 4.2 + cycle * 0.2),
    boss,
    bossHp: boss ? { angler: 3, kraken: 4, leviathan: 5, megalodon: 6 }[boss] + Math.floor(cycle / 3) : 0,
    intro: boss ? 'It found you again.' : 'Deeper.',
  };
}
