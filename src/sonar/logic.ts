import { H, W } from '../kit/canvas';
import { levelAt, type LevelConfig } from './levels';
import type { Mods } from './meta';

export type Kind = 'pearl' | 'mine' | 'jelly' | 'fish' | 'tank';
export interface Obj { kind: Kind; x: number; y: number; vis: number; vx: number; vy: number; phase: number; huntT: number; tx: number; ty: number }
export interface Ping { x: number; y: number; r: number; prevR: number; max: number; big: boolean; alive: boolean }
export interface Current { x: number; y: number; w: number; h: number; dx: number; dy: number }
export interface Boss { x: number; y: number; tx: number; ty: number; hp: number; mode: 'prowl' | 'hunt' | 'stunned'; modeT: number; vis: number; angle: number }
export type DeathBy = Kind | 'oxygen' | 'boss';

export interface Events {
  onPearl: (x: number, y: number) => void;
  onTank: (x: number, y: number) => void;
  onHatchOpen: () => void;
  onDescend: (level: LevelConfig, index: number) => void;
  onBossHit: (x: number, y: number, hpLeft: number) => void;
  onBossDown: (x: number, y: number) => void;
  onBossHunt: () => void;
  onDeath: (by: DeathBy) => void;
}

export interface State {
  t: number;
  x: number; y: number; tx: number; ty: number;
  objects: Obj[];
  pings: Ping[];
  currents: Current[];
  boss: Boss | null;
  bossDefeated: boolean;
  oxygen: number;
  pearls: number;          // in diesem Level
  pearlsDive: number;      // im ganzen Tauchgang
  pingsThisLevel: number;
  levelIndex: number;
  level: LevelConfig;
  levelT: number;
  hatchOpen: boolean;
  transition: number;      // Sekunden Restzeit der Abstiegs-Animation
  charge: number;          // Haltedauer für großen Ping
  holding: boolean;
  alive: boolean;
  deathBy: DeathBy | null;
  mods: Mods;
}

export const RULES = {
  subSpeed: 95,
  pingSpeed: 430,
  pingCost: 7,
  bigPingCost: 14,
  bigPingMult: 1.6,
  chargeTime: 0.35,
  pearlAir: 16,
  tankAir: 40,
  visDecay: 0.6,
  hatch: { x: W / 2, y: H - 70, r: 26 },
  hit: { pearl: 22, mine: 19, jelly: 22, fish: 16, tank: 24 } as Record<Kind, number>,
  fish: { speed: 70, huntTime: 3, wander: 18 },
  boss: { hp: 3, prowl: 32, hunt: 82, huntTime: 3.5, stun: 1.6, radius: 34, grace: 2.0 },
};

export function createState(mods: Mods): State {
  const s: State = {
    t: 0, x: W / 2, y: 140, tx: W / 2, ty: 140, objects: [], pings: [], currents: [], boss: null, bossDefeated: false,
    oxygen: 100, pearls: 0, pearlsDive: 0, pingsThisLevel: 0, levelIndex: 0, level: levelAt(0), levelT: 0,
    hatchOpen: false, transition: 0, charge: 0, holding: false, alive: true, deathBy: null, mods,
  };
  return s;
}

function spawnOne(s: State, kind: Kind, rng: () => number): void {
  for (let tries = 0; tries < 30; tries++) {
    const x = 30 + rng() * (W - 60);
    const y = 60 + rng() * (H - 160);
    if ((x - s.x) ** 2 + (y - s.y) ** 2 < 130 * 130) continue;
    if ((x - RULES.hatch.x) ** 2 + (y - RULES.hatch.y) ** 2 < 70 * 70) continue;
    if (s.objects.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < 55 * 55)) continue;
    const drift = kind === 'jelly' ? 12 : kind === 'fish' ? RULES.fish.wander : 0;
    s.objects.push({ kind, x, y, vis: 0, vx: (rng() - 0.5) * drift, vy: (rng() - 0.5) * drift, phase: rng() * 6.28, huntT: 0, tx: x, ty: y });
    return;
  }
}

export function startLevel(s: State, index: number, rng: () => number, ev: Events): void {
  s.levelIndex = index;
  s.level = levelAt(index);
  s.levelT = 0;
  s.pearls = 0;
  s.pingsThisLevel = 0;
  s.hatchOpen = false;
  s.objects = [];
  s.pings = [];
  s.x = W / 2; s.y = 140; s.tx = s.x; s.ty = s.y;
  s.currents = [];
  for (let i = 0; i < s.level.currents; i++) {
    const horizontal = rng() < 0.6;
    s.currents.push({
      x: horizontal ? 0 : 40 + rng() * (W - 160), y: horizontal ? 200 + rng() * 380 : 80, w: horizontal ? W : 90, h: horizontal ? 90 : H - 200,
      dx: horizontal ? (rng() < 0.5 ? -1 : 1) * 55 : 0, dy: horizontal ? 0 : (rng() < 0.5 ? -1 : 1) * 45,
    });
  }
  s.bossDefeated = false;
  s.boss = s.level.boss ? { x: W / 2, y: H - 130, tx: W / 2, ty: H - 130, hp: RULES.boss.hp, mode: 'prowl', modeT: 0, vis: 0, angle: 0 } : null;
  for (const k of ['pearl', 'mine', 'jelly', 'fish', 'tank'] as Kind[]) {
    for (let i = 0; i < s.level.counts[k]; i++) spawnOne(s, k, rng);
  }
  ev.onDescend(s.level, index);
}

export function pointerDown(s: State, x: number, y: number): void {
  if (!s.alive || s.transition > 0) return;
  s.tx = x; s.ty = y;
  s.holding = true;
  s.charge = 0;
}

/** Loslassen sendet den Ping. Lange gehalten: großer Ping, doppelte Kosten. */
export function pointerUp(s: State, ev: Events): boolean {
  if (!s.holding) return false;
  s.holding = false;
  if (!s.alive || s.transition > 0) return false;
  const big = s.charge >= RULES.chargeTime;
  const max = s.level.pingMax * s.mods.pingRange * (big ? RULES.bigPingMult : 1);
  s.pings.push({ x: s.x, y: s.y, r: 0, prevR: 0, max, big, alive: true });
  s.oxygen -= big ? RULES.bigPingCost : RULES.pingCost;
  s.pingsThisLevel++;
  // Fische und Boss hören den Ping
  for (const o of s.objects) if (o.kind === 'fish') { o.huntT = RULES.fish.huntTime; o.tx = s.x; o.ty = s.y; }
  if (s.boss && s.boss.mode !== 'stunned' && s.levelT > RULES.boss.grace) {
    s.boss.mode = 'hunt'; s.boss.modeT = RULES.boss.huntTime; s.boss.tx = s.x; s.boss.ty = s.y;
    ev.onBossHunt();
  }
  return big;
}

function die(s: State, by: DeathBy, ev: Events): void {
  s.alive = false; s.deathBy = by; s.holding = false;
  ev.onDeath(by);
}

function moveToward(o: { x: number; y: number }, tx: number, ty: number, speed: number, dt: number): number {
  const dx = tx - o.x, dy = ty - o.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return d;
  const step = Math.min(d, speed * dt);
  o.x += (dx / d) * step; o.y += (dy / d) * step;
  return d;
}

function updateBoss(s: State, dt: number, rng: () => number, ev: Events): void {
  const b = s.boss!;
  b.modeT -= dt;
  b.vis = Math.max(0, b.vis - RULES.visDecay * dt);
  if (b.mode === 'stunned') {
    if (b.modeT <= 0) { b.mode = 'prowl'; b.modeT = 0; }
    return;
  }
  if (b.mode === 'hunt' && b.modeT <= 0) b.mode = 'prowl';
  if (b.mode === 'prowl') {
    const d = Math.hypot(b.tx - b.x, b.ty - b.y);
    if (d < 8 || b.modeT <= 0) { b.tx = 40 + rng() * (W - 80); b.ty = 120 + rng() * (H - 260); b.modeT = 3 + rng() * 3; }
  }
  const speed = b.mode === 'hunt' ? RULES.boss.hunt : RULES.boss.prowl;
  const before = { x: b.x, y: b.y };
  moveToward(b, b.tx, b.ty, speed, dt);
  if (b.x !== before.x || b.y !== before.y) b.angle = Math.atan2(b.y - before.y, b.x - before.x);
  // Minen treffen den Boss
  for (const o of s.objects) {
    if (o.kind !== 'mine') continue;
    if (Math.hypot(o.x - b.x, o.y - b.y) < RULES.boss.radius + 10) {
      s.objects = s.objects.filter((q) => q !== o);
      spawnOne(s, 'mine', rng);
      b.hp--;
      b.mode = 'stunned'; b.modeT = RULES.boss.stun; b.vis = 1;
      if (b.hp <= 0) {
        s.boss = null; s.bossDefeated = true;
        ev.onBossDown(b.x, b.y);
      } else {
        ev.onBossHit(b.x, b.y, b.hp);
      }
      return;
    }
  }
  if (Math.hypot(s.x - b.x, s.y - b.y) < RULES.boss.radius) die(s, 'boss', ev);
}

export function update(s: State, dt: number, rng: () => number, ev: Events): void {
  if (!s.alive) return;
  if (s.transition > 0) {
    s.transition -= dt;
    if (s.transition <= 0) startLevel(s, s.levelIndex + 1, rng, ev);
    return;
  }
  s.t += dt; s.levelT += dt;
  if (s.holding) s.charge += dt;

  // Nachschub, Perlen bleiben knapp
  for (const k of ['pearl', 'mine', 'jelly', 'fish', 'tank'] as Kind[]) {
    const want = k === 'pearl' ? Math.min(s.level.counts.pearl, Math.max(1, s.level.pearlsNeeded - s.pearls)) : s.level.counts[k];
    while (s.objects.filter((o) => o.kind === k).length < want) spawnOne(s, k, rng);
  }

  // U-Boot
  moveToward(s, s.tx, s.ty, RULES.subSpeed * s.mods.speed, dt);
  for (const c of s.currents) {
    if (s.x >= c.x && s.x <= c.x + c.w && s.y >= c.y && s.y <= c.y + c.h) { s.x += c.dx * dt; s.y += c.dy * dt; }
  }
  s.x = Math.max(14, Math.min(W - 14, s.x)); s.y = Math.max(40, Math.min(H - 20, s.y));

  // Objekte
  for (const o of s.objects) {
    if (o.kind === 'jelly') {
      o.x += (o.vx + Math.sin(s.t * 0.8 + o.phase) * 8) * dt;
      o.y += (o.vy + Math.cos(s.t * 0.6 + o.phase) * 6) * dt;
    } else if (o.kind === 'fish') {
      if (o.huntT > 0) { o.huntT -= dt; moveToward(o, o.tx, o.ty, RULES.fish.speed, dt); }
      else { o.x += (o.vx + Math.sin(s.t * 1.1 + o.phase) * 10) * dt; o.y += (o.vy + Math.cos(s.t * 0.9 + o.phase) * 8) * dt; }
    }
    if (o.x < 20) o.vx = Math.abs(o.vx); if (o.x > W - 20) o.vx = -Math.abs(o.vx);
    if (o.y < 40) o.vy = Math.abs(o.vy); if (o.y > H - 40) o.vy = -Math.abs(o.vy);
    o.x = Math.max(16, Math.min(W - 16, o.x)); o.y = Math.max(36, Math.min(H - 36, o.y));
    o.vis = Math.max(0, o.vis - RULES.visDecay * dt);
  }

  // Pings
  for (const p of s.pings) {
    p.prevR = p.r;
    p.r += RULES.pingSpeed * dt;
    if (p.r > p.max) p.alive = false;
    for (const o of s.objects) {
      const od = Math.hypot(o.x - p.x, o.y - p.y);
      if (od > p.prevR && od <= p.r) o.vis = 1;
    }
    if (s.boss) {
      const bd = Math.hypot(s.boss.x - p.x, s.boss.y - p.y);
      if (bd > p.prevR && bd <= p.r) s.boss.vis = 1;
    }
  }
  s.pings = s.pings.filter((p) => p.alive);

  if (s.boss) { updateBoss(s, dt, rng, ev); if (!s.alive) return; }

  // Sauerstoff
  s.oxygen -= s.level.drain * s.mods.drain * dt;
  if (s.oxygen <= 0) { s.oxygen = 0; die(s, 'oxygen', ev); return; }

  // Kollisionen
  for (const o of s.objects) {
    const od = Math.hypot(o.x - s.x, o.y - s.y);
    if (od >= RULES.hit[o.kind]) continue;
    if (o.kind === 'pearl') {
      s.pearls++; s.pearlsDive++;
      s.oxygen = Math.min(100, s.oxygen + RULES.pearlAir);
      s.objects = s.objects.filter((q) => q !== o);
      ev.onPearl(o.x, o.y);
      if (!s.hatchOpen && s.pearls >= s.level.pearlsNeeded && (!s.level.boss || s.bossDefeated)) { s.hatchOpen = true; ev.onHatchOpen(); }
      return;
    }
    if (o.kind === 'tank') {
      s.oxygen = Math.min(100, s.oxygen + RULES.tankAir);
      s.objects = s.objects.filter((q) => q !== o);
      ev.onTank(o.x, o.y);
      return;
    }
    die(s, o.kind, ev);
    return;
  }
  // Boss besiegt, Perlen schon voll: Luke öffnen
  if (!s.hatchOpen && s.pearls >= s.level.pearlsNeeded && (!s.level.boss || s.bossDefeated)) { s.hatchOpen = true; ev.onHatchOpen(); }

  // Luke
  if (s.hatchOpen && Math.hypot(s.x - RULES.hatch.x, s.y - RULES.hatch.y) < RULES.hatch.r) {
    s.transition = 1.3;
    s.holding = false;
  }
}

export function nearestMine(s: State): number {
  let best = Infinity;
  for (const o of s.objects) if (o.kind === 'mine') best = Math.min(best, Math.hypot(o.x - s.x, o.y - s.y));
  return best;
}

export function score(s: State): number {
  return s.level.depth + s.pearlsDive * 10;
}
