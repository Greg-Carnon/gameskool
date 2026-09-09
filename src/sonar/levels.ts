export interface LevelConfig {
  name: string;
  depth: number;
  pearlsNeeded: number;
  counts: { pearl: number; mine: number; jelly: number; fish: number; tank: number };
  pingMax: number;
  drain: number;
  currents: number;
  boss: boolean;
  intro: string;
}

export const LEVELS: LevelConfig[] = [
  { name: 'The Shallows', depth: 20, pearlsNeeded: 4, counts: { pearl: 4, mine: 5, jelly: 0, fish: 0, tank: 0 }, pingMax: 300, drain: 2.6, currents: 0, boss: false, intro: 'Ping to see. Collect pearls. Find the hatch.' },
  { name: 'Kelp Forest', depth: 45, pearlsNeeded: 5, counts: { pearl: 4, mine: 6, jelly: 3, fish: 0, tank: 1 }, pingMax: 290, drain: 3.0, currents: 0, boss: false, intro: 'Jellyfish drift here. They sting.' },
  { name: 'The Wreck', depth: 80, pearlsNeeded: 6, counts: { pearl: 4, mine: 7, jelly: 3, fish: 0, tank: 1 }, pingMax: 280, drain: 3.3, currents: 2, boss: false, intro: 'Currents push you around. Plan your taps.' },
  { name: 'The Trench', depth: 120, pearlsNeeded: 6, counts: { pearl: 4, mine: 7, jelly: 2, fish: 4, tank: 1 }, pingMax: 250, drain: 3.6, currents: 1, boss: false, intro: 'Echo fish hear your pings. And they come.' },
  { name: 'The Angler', depth: 160, pearlsNeeded: 5, counts: { pearl: 4, mine: 8, jelly: 0, fish: 2, tank: 2 }, pingMax: 240, drain: 3.4, currents: 0, boss: true, intro: 'Something big hunts your pings. Lure it into the mines.' },
  { name: 'The Abyss', depth: 200, pearlsNeeded: 7, counts: { pearl: 4, mine: 9, jelly: 4, fish: 4, tank: 1 }, pingMax: 230, drain: 3.9, currents: 2, boss: false, intro: 'No bottom. Only deeper.' },
];

/** Ab dem Abyss wiederholt sich das letzte Level mit steigender Härte. */
export function levelAt(index: number): LevelConfig {
  if (index < LEVELS.length) return LEVELS[index];
  const base = LEVELS[LEVELS.length - 1];
  const cycle = index - LEVELS.length + 1;
  const boss = cycle % 3 === 0;
  return {
    ...base,
    name: boss ? 'The Angler returns' : `Abyss ${cycle + 1}`,
    depth: base.depth + cycle * 40,
    pearlsNeeded: Math.min(9, base.pearlsNeeded + Math.floor(cycle / 2)),
    counts: { pearl: 4, mine: Math.min(14, base.counts.mine + cycle), jelly: Math.min(6, base.counts.jelly + Math.floor(cycle / 2)), fish: Math.min(7, base.counts.fish + Math.floor(cycle / 2)), tank: 1 },
    pingMax: Math.max(190, base.pingMax - cycle * 8),
    drain: Math.min(5.5, base.drain + cycle * 0.25),
    boss,
    intro: boss ? 'It found you again.' : 'Deeper.',
  };
}
