export interface Charge {
  x: number; y: number;
  heading: number; speed: number;
}

export interface Rod {
  x: number; y: number;
  age: number;
}

export interface Bolt {
  x1: number; y1: number; x2: number; y2: number;
  t: number;
  seed: number;
}

export interface Zap {
  x: number; y: number; t: number;
}

export interface State {
  t: number;
  charges: Charge[];
  rods: Rod[];
  bolts: Bolt[];
  zaps: Zap[];
  score: number;
  best: number;
  bestChain: number;
  lastChainRods: number;
  lastChainZaps: number;
  spawnAcc: number;
  over: boolean;
  radiusShows: { x: number; y: number; t: number }[];
}

export function createState(best: number): State {
  return {
    t: 0, charges: [], rods: [], bolts: [], zaps: [],
    score: 0, best, bestChain: 0, lastChainRods: 0, lastChainZaps: 0,
    spawnAcc: 0, over: false, radiusShows: [],
  };
}
