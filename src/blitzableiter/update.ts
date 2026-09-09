import { H, W } from '../kit/canvas';
import { RULES } from './rules';
import type { Charge, Rod, State } from './state';

export interface Events {
  onChain: (rods: number, zaps: number, x: number, y: number) => void;
  onGameOver: () => void;
}

const dist2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) ** 2 + (ay - by) ** 2;

function spawnInterval(t: number): number {
  const { spawnEvery, spawnStageAt } = RULES.charge;
  let stage = 0;
  for (let i = 0; i < spawnStageAt.length; i++) if (t >= spawnStageAt[i]) stage = i;
  return spawnEvery[stage];
}

function spawnCharge(rng: () => number): Charge {
  const { speedMin, speedMax, radius } = RULES.charge;
  // Von einem zufälligen Rand hereinwandern
  const side = Math.floor(rng() * 4);
  const r = radius;
  const x = side === 0 ? -r : side === 1 ? W + r : rng() * W;
  const y = side === 2 ? -r : side === 3 ? H + r : rng() * H;
  const heading = Math.atan2(H / 2 - y, W / 2 - x) + (rng() - 0.5);
  return { x, y, heading, speed: speedMin + rng() * (speedMax - speedMin) };
}

export function placeRod(s: State, x: number, y: number): void {
  if (s.over) return;
  if (s.rods.length >= RULES.rod.max) s.rods.shift();
  s.rods.push({ x, y, age: 0 });
  s.radiusShows.push({ x, y, t: RULES.rod.radiusShowTime });
}

/** Kettenreaktion: BFS über Ableiter im Kettenradius, dann alle Ladungen im Zap-Radius entladen. */
function fireChain(s: State, startIdx: number, ev: Events): void {
  const { chainRadius, zapRadius } = RULES.rod;
  const fired = new Set<number>([startIdx]);
  const queue = [startIdx];
  while (queue.length) {
    const i = queue.shift()!;
    const a = s.rods[i];
    for (let j = 0; j < s.rods.length; j++) {
      if (fired.has(j)) continue;
      const b = s.rods[j];
      if (dist2(a.x, a.y, b.x, b.y) <= chainRadius * chainRadius) {
        fired.add(j);
        queue.push(j);
        s.bolts.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, t: RULES.bolt.life, seed: Math.random() * 1000 });
      }
    }
  }
  const firedRods: Rod[] = [...fired].map((i) => s.rods[i]);
  let zaps = 0;
  s.charges = s.charges.filter((c) => {
    const hit = firedRods.some((r) => dist2(r.x, r.y, c.x, c.y) <= zapRadius * zapRadius);
    if (hit) {
      zaps++;
      s.zaps.push({ x: c.x, y: c.y, t: 0.3 });
    }
    return !hit;
  });
  s.rods = s.rods.filter((_, i) => !fired.has(i));

  const chainLen = fired.size;
  const gained = zaps * zaps * RULES.score.perZap * chainLen;
  s.score += gained;
  s.lastChainRods = chainLen;
  s.lastChainZaps = zaps;
  if (chainLen > s.bestChain) s.bestChain = chainLen;
  const origin = s.rods.length ? firedRods[0] : firedRods[0];
  ev.onChain(chainLen, zaps, origin.x, origin.y);
}

export function update(s: State, dt: number, rng: () => number, ev: Events): void {
  if (s.over) return;
  s.t += dt;

  // Spawn
  s.spawnAcc += dt;
  const interval = spawnInterval(s.t);
  while (s.spawnAcc >= interval) {
    s.spawnAcc -= interval;
    s.charges.push(spawnCharge(rng));
  }

  // Ladungen bewegen
  const { turnNoise, radius } = RULES.charge;
  for (const c of s.charges) {
    c.heading += (rng() - 0.5) * turnNoise * dt;
    c.x += Math.cos(c.heading) * c.speed * dt;
    c.y += Math.sin(c.heading) * c.speed * dt;
    if (c.x < radius && Math.cos(c.heading) < 0) c.heading = Math.PI - c.heading;
    if (c.x > W - radius && Math.cos(c.heading) > 0) c.heading = Math.PI - c.heading;
    if (c.y < radius && Math.sin(c.heading) < 0) c.heading = -c.heading;
    if (c.y > H - radius && Math.sin(c.heading) > 0) c.heading = -c.heading;
  }

  // Ableiter altern
  for (const r of s.rods) r.age += dt;
  s.rods = s.rods.filter((r) => r.age < RULES.rod.lifetime);

  // Treffer: erste Ladung, die einen Ableiter berührt, zündet die Kette
  const hr = RULES.rod.hitRadius + radius;
  outer: for (const c of s.charges) {
    for (let i = 0; i < s.rods.length; i++) {
      const r = s.rods[i];
      if (dist2(c.x, c.y, r.x, r.y) <= hr * hr) {
        fireChain(s, i, ev);
        break outer;
      }
    }
  }

  // Effekte altern
  for (const b of s.bolts) b.t -= dt;
  s.bolts = s.bolts.filter((b) => b.t > 0);
  for (const z of s.zaps) z.t -= dt;
  s.zaps = s.zaps.filter((z) => z.t > 0);
  for (const r of s.radiusShows) r.t -= dt;
  s.radiusShows = s.radiusShows.filter((r) => r.t > 0);

  // Verlieren
  if (s.charges.length > RULES.charge.maxOnField) {
    s.over = true;
    if (s.score > s.best) s.best = s.score;
    ev.onGameOver();
  }
}
