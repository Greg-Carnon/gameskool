import { H, W } from '../kit/canvas';

export type Kind = 'pearl' | 'mine' | 'jelly';
export interface Obj { kind: Kind; x: number; y: number; vis: number; vx: number; vy: number; phase: number }
export interface Ping { x: number; y: number; r: number; prevR: number; alive: boolean }

export interface State {
  t: number;
  x: number; y: number; tx: number; ty: number;
  objects: Obj[];
  pings: Ping[];
  oxygen: number;
  pearls: number;
  alive: boolean;
  deathBy: Kind | 'oxygen' | null;
}

export const RULES = {
  subSpeed: 95,
  pingSpeed: 430,
  pingMax: 300,
  pingCost: 7,
  drain: 3.2,
  pearlAir: 16,
  visDecay: 0.6,
  counts: { pearl: 4, mine: 7, jelly: 3 } as Record<Kind, number>,
  hit: { pearl: 22, mine: 19, jelly: 22 } as Record<Kind, number>,
};

export function createState(): State {
  return { t: 0, x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, objects: [], pings: [], oxygen: 100, pearls: 0, alive: true, deathBy: null };
}

export function tap(s: State, x: number, y: number): void {
  if (!s.alive) return;
  s.tx = x; s.ty = y;
  s.pings.push({ x: s.x, y: s.y, r: 0, prevR: 0, alive: true });
  s.oxygen -= RULES.pingCost;
}

function spawnOne(s: State, kind: Kind, rng: () => number): void {
  for (let tries = 0; tries < 20; tries++) {
    const x = 30 + rng() * (W - 60);
    const y = 60 + rng() * (H - 120);
    if ((x - s.x) ** 2 + (y - s.y) ** 2 < 130 * 130) continue;
    if (s.objects.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < 55 * 55)) continue;
    const drift = kind === 'jelly' ? 12 : 0;
    s.objects.push({ kind, x, y, vis: 0, vx: (rng() - 0.5) * drift, vy: (rng() - 0.5) * drift, phase: rng() * 6.28 });
    return;
  }
}

export function update(s: State, dt: number, rng: () => number): void {
  if (!s.alive) return;
  s.t += dt;
  for (const k of ['pearl', 'mine', 'jelly'] as Kind[]) {
    while (s.objects.filter((o) => o.kind === k).length < RULES.counts[k]) spawnOne(s, k, rng);
  }
  // Bewegung
  const dx = s.tx - s.x, dy = s.ty - s.y;
  const d = Math.hypot(dx, dy);
  if (d > 2) {
    const step = Math.min(d, RULES.subSpeed * dt);
    s.x += (dx / d) * step; s.y += (dy / d) * step;
  }
  for (const o of s.objects) {
    if (o.kind === 'jelly') {
      o.x += (o.vx + Math.sin(s.t * 0.8 + o.phase) * 8) * dt;
      o.y += (o.vy + Math.cos(s.t * 0.6 + o.phase) * 6) * dt;
      if (o.x < 20) o.vx = Math.abs(o.vx); if (o.x > W - 20) o.vx = -Math.abs(o.vx);
      if (o.y < 40) o.vy = Math.abs(o.vy); if (o.y > H - 40) o.vy = -Math.abs(o.vy);
    }
    o.vis = Math.max(0, o.vis - RULES.visDecay * dt);
  }
  // Pings
  for (const p of s.pings) {
    p.prevR = p.r;
    p.r += RULES.pingSpeed * dt;
    if (p.r > RULES.pingMax) p.alive = false;
    for (const o of s.objects) {
      const od = Math.hypot(o.x - p.x, o.y - p.y);
      if (od > p.prevR && od <= p.r) o.vis = 1;
    }
  }
  s.pings = s.pings.filter((p) => p.alive);
  // Sauerstoff
  s.oxygen -= RULES.drain * dt;
  if (s.oxygen <= 0) { s.oxygen = 0; s.alive = false; s.deathBy = 'oxygen'; return; }
  // Kollisionen
  for (const o of s.objects) {
    const od = Math.hypot(o.x - s.x, o.y - s.y);
    if (od < RULES.hit[o.kind]) {
      if (o.kind === 'pearl') {
        o.kind = 'pearl';
        s.pearls++;
        s.oxygen = Math.min(100, s.oxygen + RULES.pearlAir);
        s.objects = s.objects.filter((q) => q !== o);
        return;
      }
      s.alive = false; s.deathBy = o.kind;
      return;
    }
  }
}

export function nearestMine(s: State): number {
  let best = Infinity;
  for (const o of s.objects) if (o.kind === 'mine') best = Math.min(best, Math.hypot(o.x - s.x, o.y - s.y));
  return best;
}

export function score(s: State): number {
  return s.pearls * 10 + Math.floor(s.t);
}
