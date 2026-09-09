export const LANE_L = 40;
export const LANE_R = 350;
export const PX = 195;
export const SCREEN_Y = 560;
export const RISE = 170;

export type Kind = 'bar' | 'beam' | 'pulse';
export interface Hazard { kind: Kind; y: number; phase: number; w: number; x: number }

export interface State {
  t: number;         // Weltzeit, läuft nur bei Hold
  y: number;         // Fortschritt nach oben
  held: boolean;
  holdT: number;
  alive: boolean;
  score: number;
  hazards: Hazard[];
  nextY: number;
  bestHold: number;
}

export function createState(): State {
  return { t: 0, y: 0, held: false, holdT: 0, alive: true, score: 0, hazards: [], nextY: 260, bestHold: 0 };
}

export function multiplier(holdT: number): number {
  return 1 + Math.min(2, holdT / 2);
}

function spawn(s: State, rng: () => number): void {
  while (s.nextY < s.y + 900) {
    const r = rng();
    const kind: Kind = r < 0.45 ? 'bar' : r < 0.75 ? 'beam' : 'pulse';
    s.hazards.push({ kind, y: s.nextY, phase: rng() * Math.PI * 2, w: 0.9 + rng() * 1.6, x: LANE_L + 40 + rng() * (LANE_R - LANE_L - 80) });
    s.nextY += 130 + rng() * 90 - Math.min(50, s.y / 60);
  }
  s.hazards = s.hazards.filter((h) => h.y > s.y - 200);
}

/** Position eines Balkens zur Zeit t: Mitte x und halbe Breite. */
export function barAt(h: Hazard, t: number): { cx: number; hw: number } {
  const range = (LANE_R - LANE_L) / 2 - 60;
  return { cx: PX + Math.sin(t * h.w + h.phase) * range, hw: 60 };
}
export function beamAngle(h: Hazard, t: number): number {
  return t * h.w * 0.8 + h.phase;
}
export function pulseRadius(h: Hazard, t: number): number {
  return 34 + 30 * Math.sin(t * h.w * 1.3 + h.phase);
}

function lethal(h: Hazard, t: number, py: number): boolean {
  const dy = py - h.y;
  if (h.kind === 'bar') {
    const { cx, hw } = barAt(h, t);
    return Math.abs(dy) < 9 && Math.abs(PX - cx) < hw + 8;
  }
  if (h.kind === 'beam') {
    if (Math.abs(dy) > 150) return false;
    const a = beamAngle(h, t);
    const dx = PX - h.x;
    const along = dx * Math.cos(a) + (-dy) * Math.sin(a);
    const perp = -dx * Math.sin(a) + (-dy) * Math.cos(a);
    return Math.abs(along) < 150 && Math.abs(perp) < 11;
  }
  const r = pulseRadius(h, t);
  return (PX - h.x) ** 2 + dy ** 2 < (r + 8) ** 2;
}

export function update(s: State, dt: number, rng: () => number): void {
  if (!s.alive) return;
  spawn(s, rng);
  if (!s.held) { s.holdT = 0; return; }
  s.t += dt;
  s.holdT += dt;
  if (s.holdT > s.bestHold) s.bestHold = s.holdT;
  s.y += RISE * dt;
  s.score += (RISE * dt) / 10 * multiplier(s.holdT);
  for (const h of s.hazards) {
    if (lethal(h, s.t, s.y)) { s.alive = false; return; }
  }
}
