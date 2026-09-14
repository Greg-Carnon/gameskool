import { H, W } from '../kit/canvas';
import { levelAt, type BossKind, type LevelConfig } from './levels';
import type { Mods } from './meta';

export type Kind = 'pearl' | 'gold' | 'mine' | 'jelly' | 'fish' | 'tank' | 'torpedo' | 'flare' | 'magnet' | 'shield' | 'boost';
export const POWERUPS: Kind[] = ['torpedo', 'flare', 'magnet', 'shield', 'boost'];
export interface Obj { kind: Kind; x: number; y: number; vis: number; vx: number; vy: number; phase: number; huntT: number; tx: number; ty: number }
export interface Ping { x: number; y: number; r: number; prevR: number; max: number; big: boolean; alive: boolean }
export interface Current { x: number; y: number; w: number; h: number; dx: number; dy: number }
export interface Torpedo { x: number; y: number; vx: number; vy: number; life: number }
export interface Boss {
  kind: BossKind;
  x: number; y: number; tx: number; ty: number;
  hp: number; maxHp: number;
  mode: 'prowl' | 'hunt' | 'stunned' | 'strike';
  modeT: number;
  vis: number;
  angle: number;
  strikeX: number; strikeY: number;
  trail: { x: number; y: number }[];
  orbit: number;
}
export type DeathBy = Kind | 'oxygen' | 'boss';

export interface Events {
  onPearl: (x: number, y: number, chain: number) => void;
  onTank: (x: number, y: number) => void;
  onPowerup: (kind: Kind, x: number, y: number) => void;
  onTorpedoHit: (x: number, y: number, what: 'mine' | 'creature' | 'boss') => void;
  onShieldBreak: () => void;
  onHatchOpen: () => void;
  onDescend: (level: LevelConfig, index: number) => void;
  onBossHit: (x: number, y: number, hpLeft: number) => void;
  onBossDown: (x: number, y: number) => void;
  onBossHunt: () => void;
  onBossStrike: (x: number, y: number) => void;
  onSecret: (id: 'ghost' | 'fulltank' | 'captain' | 'whale') => void;
  onDeath: (by: DeathBy) => void;
  onLifeLost: (by: DeathBy, livesLeft: number) => void;
}

export interface State {
  t: number;
  x: number; y: number; tx: number; ty: number;
  objects: Obj[];
  pings: Ping[];
  currents: Current[];
  torpedoes: Torpedo[];
  ammo: number;
  shield: boolean;
  flare: number;
  magnet: number;
  boost: number;
  boss: Boss | null;
  bossDefeated: boolean;
  bossTorpedoUsed: boolean;
  oxygen: number;
  pearls: number;
  pearlsDive: number;
  pingsThisLevel: number;
  chain: number;
  chainT: number;
  bonus: number;
  minesShot: number;
  levelIndex: number;
  level: LevelConfig;
  levelT: number;
  hatchOpen: boolean;
  transition: number;
  charge: number;
  holding: boolean;
  alive: boolean;
  deathBy: DeathBy | null;
  mods: Mods;
  tutorial: boolean;
  lives: number;
  invuln: number;
  idleT: number;
  captainSpawned: boolean;
  facing: number;
  secretsFound: string[];
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
  chainWindow: 5,
  chainAir: 4,
  chainScore: 5,
  headlight: 46,
  visDecay: 0.6,
  lives: 10,
  respawnGrace: 2.2,
  hatch: { x: W / 2, y: H - 70, r: 26 },
  hit: { pearl: 22, gold: 26, mine: 19, jelly: 22, fish: 16, tank: 24, torpedo: 24, flare: 24, magnet: 24, shield: 24, boost: 24 } as Record<Kind, number>,
  fish: { speed: 70, huntTime: 3, wander: 18 },
  boss: { hp: 3, prowl: 32, hunt: 82, huntTime: 3.5, stun: 1.6, radius: 34 },
  kraken: { arms: 8, armLen: 150, spin: 0.35, telegraph: 1.0, strikeRadius: 42, armHit: 13 },
  leviathan: { speed: 42, chaseBonus: 55, segments: 14, segGap: 16, hit: 15 },
  megalodon: { orbitX: 175, orbitY: 300, orbitSpeed: 0.45, rest: 3.2, telegraph: 1.15, dash: 420, hit: 40, mineHit: 46 },
  torpedo: { speed: 270, life: 1.5, perCrate: 3, hit: 26 },
  flareTime: 4,
  magnetTime: 8,
  magnetRadius: 140,
  magnetPull: 110,
  boostTime: 8,
  boostMult: 1.6,
  goldWorth: 5,
  wreckHull: { x: 150, y: H - 200, w: 240, h: 140 },
  whaleIdle: 8,
};

export function createState(mods: Mods, tutorial = false): State {
  return {
    t: 0, x: W / 2, y: 140, tx: W / 2, ty: 140, objects: [], pings: [], currents: [], torpedoes: [],
    ammo: mods.torpedoes, shield: mods.hull >= 1, flare: 0, magnet: 0, boost: 0,
    boss: null, bossDefeated: false, bossTorpedoUsed: false,
    oxygen: 100, pearls: 0, pearlsDive: 0, pingsThisLevel: 0, chain: 0, chainT: 0, bonus: 0, minesShot: 0,
    levelIndex: 0, level: levelAt(0), levelT: 0,
    hatchOpen: false, transition: 0, charge: 0, holding: false, alive: true, deathBy: null, mods, tutorial,
    lives: RULES.lives, invuln: 0, idleT: 0, captainSpawned: false, facing: 1, secretsFound: [],
  };
}

function spawnOne(s: State, kind: Kind, rng: () => number, at?: { x: number; y: number }): void {
  for (let tries = 0; tries < 30; tries++) {
    const x = at ? at.x : 30 + rng() * (W - 60);
    const y = at ? at.y : 60 + rng() * (H - 160);
    if (!at) {
      if ((x - s.x) ** 2 + (y - s.y) ** 2 < 130 * 130) continue;
      if ((x - RULES.hatch.x) ** 2 + (y - RULES.hatch.y) ** 2 < 70 * 70) continue;
      if (s.objects.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < 55 * 55)) continue;
      if (s.boss && (x - s.boss.x) ** 2 + (y - s.boss.y) ** 2 < 90 * 90) continue;
    }
    const drift = kind === 'jelly' ? 12 : kind === 'fish' ? RULES.fish.wander : 0;
    s.objects.push({ kind, x, y, vis: 0, vx: (rng() - 0.5) * drift, vy: (rng() - 0.5) * drift, phase: rng() * 6.28, huntT: 0, tx: x, ty: y });
    return;
  }
}

/** Im Tutorial-Tauchgang ist das erste Level entschärft. */
function levelCount(s: State, k: Kind): number {
  if (s.tutorial && s.levelIndex === 0 && k === 'mine') return 2;
  if (k === 'pearl') return s.level.counts.pearl;
  if (k === 'mine' || k === 'jelly' || k === 'fish' || k === 'tank') return s.level.counts[k];
  return 0;
}

function makeBoss(kind: BossKind, hp: number): Boss {
  const y = kind === 'kraken' ? H / 2 + 60 : H - 160;
  const b: Boss = { kind, x: W / 2, y, tx: W / 2, ty: y, hp, maxHp: hp, mode: 'prowl', modeT: kind === 'megalodon' ? 4 : 0, vis: 0, angle: 0, strikeX: 0, strikeY: 0, trail: [], orbit: Math.PI / 2 };
  if (kind === 'megalodon') { b.x = W / 2 + Math.cos(b.orbit) * RULES.megalodon.orbitX; b.y = H / 2 + Math.sin(b.orbit) * RULES.megalodon.orbitY; }
  return b;
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
  s.torpedoes = [];
  s.flare = 0; s.magnet = 0; s.boost = 0;
  s.idleT = 0; s.captainSpawned = false;
  if (s.mods.hull >= 2) s.shield = true;
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
  s.bossTorpedoUsed = false;
  s.boss = s.level.boss ? makeBoss(s.level.boss, s.level.bossHp) : null;
  for (const k of ['pearl', 'mine', 'jelly', 'fish', 'tank'] as Kind[]) {
    for (let i = 0; i < levelCount(s, k); i++) spawnOne(s, k, rng);
  }
  for (let i = 0; i < s.level.counts.powerups; i++) spawnOne(s, POWERUPS[Math.floor(rng() * POWERUPS.length)], rng);
  ev.onDescend(s.level, index);
}

export function pointerDown(s: State, x: number, y: number): void {
  if (!s.alive || s.transition > 0) return;
  s.tx = x; s.ty = y;
  if (Math.abs(x - s.x) > 4) s.facing = x < s.x ? -1 : 1;
  s.holding = true;
  s.charge = 0;
  s.idleT = 0;
}

/** Loslassen sendet den Ping. Lange gehalten: großer Ping, doppelte Kosten, und ein Torpedo, wenn Munition da ist. */
export function pointerUp(s: State, ev: Events): boolean {
  if (!s.holding) return false;
  s.holding = false;
  if (!s.alive || s.transition > 0) return false;
  const big = s.charge >= RULES.chargeTime;
  const max = s.level.pingMax * s.mods.pingRange * (big ? RULES.bigPingMult : 1);
  s.pings.push({ x: s.x, y: s.y, r: 0, prevR: 0, max, big, alive: true });
  s.oxygen -= big ? RULES.bigPingCost : RULES.pingCost;
  s.pingsThisLevel++;
  s.idleT = 0;
  for (const o of s.objects) if (o.kind === 'fish') { o.huntT = RULES.fish.huntTime; o.tx = s.x; o.ty = s.y; }
  if (s.boss && s.boss.mode !== 'stunned') {
    if (s.boss.kind === 'angler') {
      s.boss.mode = 'hunt'; s.boss.modeT = RULES.boss.huntTime; s.boss.tx = s.x; s.boss.ty = s.y;
      ev.onBossHunt();
    } else if (s.boss.kind === 'kraken' && s.boss.mode !== 'strike') {
      s.boss.mode = 'strike'; s.boss.modeT = RULES.kraken.telegraph; s.boss.strikeX = s.x; s.boss.strikeY = s.y;
      ev.onBossStrike(s.x, s.y);
    }
  }
  if (big && s.ammo > 0) {
    s.ammo--;
    const dx = s.tx - s.x, dy = s.ty - s.y;
    const d = Math.hypot(dx, dy);
    const ux = d > 6 ? dx / d : s.facing, uy = d > 6 ? dy / d : 0;
    s.torpedoes.push({ x: s.x + ux * 24, y: s.y + uy * 24, vx: ux * RULES.torpedo.speed, vy: uy * RULES.torpedo.speed, life: RULES.torpedo.life });
    if (s.boss) s.bossTorpedoUsed = true;
  }
  // Geheimnis: im Wrack pingen
  if (s.level.env === 'wreck' && !s.captainSpawned) {
    const h = RULES.wreckHull;
    if (s.x >= h.x && s.x <= h.x + h.w && s.y >= h.y && s.y <= h.y + h.h) {
      s.captainSpawned = true;
      spawnOne(s, 'gold', () => 0.5, { x: h.x + h.w * 0.55, y: h.y + h.h * 0.45 });
      const g = s.objects[s.objects.length - 1];
      g.vis = 1;
    }
  }
  return big;
}

function die(s: State, by: DeathBy, ev: Events): void {
  s.holding = false;
  if (s.shield) {
    s.shield = false;
    s.invuln = 1.5;
    ev.onShieldBreak();
    return;
  }
  if (s.lives > 1) {
    s.lives--;
    respawn(s);
    ev.onLifeLost(by, s.lives);
    return;
  }
  s.lives = 0;
  s.alive = false; s.deathBy = by;
  ev.onDeath(by);
}

/** Zurück an den Levelanfang, Luft voll, kurz unverwundbar. Gesammelte Perlen bleiben. */
function respawn(s: State): void {
  s.x = W / 2; s.y = 140; s.tx = s.x; s.ty = s.y;
  s.oxygen = 100;
  s.invuln = RULES.respawnGrace + (s.mods.hull >= 3 ? 1 : 0);
  s.chain = 0; s.chainT = 0;
  s.charge = 0;
  s.pings = [];
  s.torpedoes = [];
  for (const o of s.objects) if (o.kind === 'fish') o.huntT = 0;
  if (s.boss) {
    if (s.boss.kind === 'megalodon') { s.boss.orbit = Math.PI / 2; s.boss.x = W / 2; s.boss.y = H / 2 + RULES.megalodon.orbitY; }
    else if (s.boss.kind !== 'kraken') { s.boss.x = W / 2; s.boss.y = H - 160; s.boss.tx = s.boss.x; s.boss.ty = s.boss.y; s.boss.trail = []; }
    s.boss.mode = 'stunned'; s.boss.modeT = RULES.respawnGrace;
  }
}

function moveToward(o: { x: number; y: number }, tx: number, ty: number, speed: number, dt: number): number {
  const dx = tx - o.x, dy = ty - o.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return d;
  const step = Math.min(d, speed * dt);
  o.x += (dx / d) * step; o.y += (dy / d) * step;
  return d;
}

function damageBoss(s: State, x: number, y: number, ev: Events, byTorpedo = false): void {
  const b = s.boss!;
  b.hp--;
  b.mode = 'stunned'; b.modeT = RULES.boss.stun; b.vis = 1;
  if (byTorpedo) s.bossTorpedoUsed = true;
  if (b.hp <= 0) {
    s.boss = null; s.bossDefeated = true;
    ev.onBossDown(x, y);
  } else {
    ev.onBossHit(x, y, b.hp);
  }
}

function bossMineCheck(s: State, x: number, y: number, radius: number, rng: () => number, ev: Events): boolean {
  for (const o of s.objects) {
    if (o.kind !== 'mine') continue;
    if (Math.hypot(o.x - x, o.y - y) < radius) {
      s.objects = s.objects.filter((q) => q !== o);
      spawnOne(s, 'mine', rng);
      damageBoss(s, o.x, o.y, ev);
      return true;
    }
  }
  return false;
}

export function krakenArmPoints(b: Boss, t: number): { x1: number; y1: number; x2: number; y2: number }[] {
  const arms = [];
  for (let i = 0; i < RULES.kraken.arms; i++) {
    const a = t * RULES.kraken.spin + (i / RULES.kraken.arms) * Math.PI * 2;
    const len = RULES.kraken.armLen * (0.85 + 0.15 * Math.sin(t * 1.3 + i));
    arms.push({ x1: b.x, y1: b.y, x2: b.x + Math.cos(a) * len, y2: b.y + Math.sin(a) * len });
  }
  return arms;
}

function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  const k = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + dx * k), py - (y1 + dy * k));
}

function updateBoss(s: State, dt: number, rng: () => number, ev: Events): void {
  const b = s.boss!;
  b.modeT -= dt;
  b.vis = Math.max(0, b.vis - RULES.visDecay * dt);
  if (b.mode === 'stunned') {
    if (b.modeT <= 0) { b.mode = 'prowl'; b.modeT = 0; }
    return;
  }
  if (b.kind === 'angler') {
    if (b.mode === 'hunt' && b.modeT <= 0) b.mode = 'prowl';
    if (b.mode === 'prowl') {
      const d = Math.hypot(b.tx - b.x, b.ty - b.y);
      if (d < 8 || b.modeT <= 0) { b.tx = 40 + rng() * (W - 80); b.ty = 120 + rng() * (H - 260); b.modeT = 3 + rng() * 3; }
    }
    const speed = b.mode === 'hunt' ? RULES.boss.hunt : RULES.boss.prowl;
    const before = { x: b.x, y: b.y };
    moveToward(b, b.tx, b.ty, speed, dt);
    if (b.x !== before.x || b.y !== before.y) b.angle = Math.atan2(b.y - before.y, b.x - before.x);
    if (bossMineCheck(s, b.x, b.y, RULES.boss.radius + 10, rng, ev)) return;
    if (s.invuln <= 0 && Math.hypot(s.x - b.x, s.y - b.y) < RULES.boss.radius) die(s, 'boss', ev);
  } else if (b.kind === 'kraken') {
    b.angle = s.t;
    if (b.mode === 'strike' && b.modeT <= 0) {
      b.mode = 'prowl';
      b.vis = 1;
      const hitMine = bossMineCheck(s, b.strikeX, b.strikeY, RULES.kraken.strikeRadius, rng, ev);
      if (!hitMine && s.invuln <= 0 && Math.hypot(s.x - b.strikeX, s.y - b.strikeY) < RULES.kraken.strikeRadius) { die(s, 'boss', ev); return; }
      if (hitMine) return;
    }
    if (s.invuln > 0) return;
    for (const arm of krakenArmPoints(b, s.t)) {
      if (distToSeg(s.x, s.y, arm.x1, arm.y1, arm.x2, arm.y2) < RULES.kraken.armHit) { die(s, 'boss', ev); return; }
    }
    if (Math.hypot(s.x - b.x, s.y - b.y) < 40) die(s, 'boss', ev);
  } else if (b.kind === 'megalodon') {
    const M = RULES.megalodon;
    if (b.mode === 'prowl') {
      b.orbit += M.orbitSpeed * dt;
      const nx = W / 2 + Math.cos(b.orbit) * M.orbitX, ny = H / 2 + Math.sin(b.orbit) * M.orbitY;
      b.angle = Math.atan2(ny - b.y, nx - b.x);
      b.x = nx; b.y = ny;
      if (b.modeT <= 0) {
        b.mode = 'strike'; b.modeT = M.telegraph;
        const dx = s.x - b.x, dy = s.y - b.y, d = Math.hypot(dx, dy) || 1;
        b.strikeX = dx / d; b.strikeY = dy / d;
        b.angle = Math.atan2(dy, dx);
        b.vis = 1;
        ev.onBossStrike(b.x, b.y);
      }
    } else if (b.mode === 'strike') {
      if (b.modeT <= 0) { b.mode = 'hunt'; b.modeT = 4; }
    } else if (b.mode === 'hunt') {
      b.x += b.strikeX * M.dash * dt; b.y += b.strikeY * M.dash * dt;
      b.angle = Math.atan2(b.strikeY, b.strikeX);
      if (bossMineCheck(s, b.x, b.y, M.mineHit, rng, ev)) return;
      if (s.invuln <= 0 && Math.hypot(s.x - b.x, s.y - b.y) < M.hit) { die(s, 'boss', ev); return; }
      if (b.x < -90 || b.x > W + 90 || b.y < -90 || b.y > H + 90 || b.modeT <= 0) {
        b.mode = 'prowl'; b.modeT = M.rest;
        b.orbit = Math.atan2((b.y - H / 2) / M.orbitY, (b.x - W / 2) / M.orbitX);
      }
    }
  } else {
    // Leviathan folgt dem Boot, schneller wenn es sich bewegt
    const moving = Math.hypot(s.tx - s.x, s.ty - s.y) > 4;
    const speed = RULES.leviathan.speed + (moving ? RULES.leviathan.chaseBonus : 0);
    const before = { x: b.x, y: b.y };
    moveToward(b, s.x, s.y, speed, dt);
    if (b.x !== before.x || b.y !== before.y) b.angle = Math.atan2(b.y - before.y, b.x - before.x);
    b.trail.unshift({ x: b.x, y: b.y });
    const maxTrail = RULES.leviathan.segments * 4;
    if (b.trail.length > maxTrail) b.trail.length = maxTrail;
    if (bossMineCheck(s, b.x, b.y, 30, rng, ev)) return;
    if (s.invuln > 0) return;
    if (Math.hypot(s.x - b.x, s.y - b.y) < 26) { die(s, 'boss', ev); return; }
    for (let i = 4; i < b.trail.length; i += 4) {
      const p = b.trail[i];
      if (Math.hypot(s.x - p.x, s.y - p.y) < RULES.leviathan.hit) { die(s, 'boss', ev); return; }
    }
  }
}

function updateTorpedoes(s: State, dt: number, rng: () => number, ev: Events): void {
  for (const tp of s.torpedoes) {
    tp.x += tp.vx * dt; tp.y += tp.vy * dt; tp.life -= dt;
    if (tp.x < 0 || tp.x > W || tp.y < 0 || tp.y > H) tp.life = 0;
    if (tp.life <= 0) continue;
    for (const o of s.objects) {
      if (o.kind !== 'mine' && o.kind !== 'jelly' && o.kind !== 'fish') continue;
      if (Math.hypot(o.x - tp.x, o.y - tp.y) < RULES.torpedo.hit) {
        s.objects = s.objects.filter((q) => q !== o);
        if (o.kind === 'mine') { s.minesShot++; spawnOne(s, 'mine', rng); }
        ev.onTorpedoHit(o.x, o.y, o.kind === 'mine' ? 'mine' : 'creature');
        tp.life = 0;
        break;
      }
    }
    if (tp.life <= 0) continue;
    if (s.boss && s.boss.mode !== 'stunned' && Math.hypot(s.boss.x - tp.x, s.boss.y - tp.y) < RULES.boss.radius + 10) {
      tp.life = 0;
      ev.onTorpedoHit(tp.x, tp.y, 'boss');
      damageBoss(s, tp.x, tp.y, ev, true);
    }
  }
  s.torpedoes = s.torpedoes.filter((tp) => tp.life > 0);
}

export function update(s: State, dt: number, rng: () => number, ev: Events): void {
  if (!s.alive) return;
  if (s.transition > 0) {
    s.transition -= dt;
    if (s.transition <= 0) startLevel(s, s.levelIndex + 1, rng, ev);
    return;
  }
  s.t += dt; s.levelT += dt;
  s.invuln = Math.max(0, s.invuln - dt);
  s.flare = Math.max(0, s.flare - dt);
  s.magnet = Math.max(0, s.magnet - dt);
  s.boost = Math.max(0, s.boost - dt);
  if (s.holding) s.charge += dt;

  for (const k of ['pearl', 'mine', 'jelly', 'fish', 'tank'] as Kind[]) {
    const want = k === 'pearl' ? Math.min(s.level.counts.pearl, Math.max(1, s.level.pearlsNeeded - s.pearls)) : levelCount(s, k);
    while (s.objects.filter((o) => o.kind === k).length < want) spawnOne(s, k, rng);
  }

  const moving = Math.hypot(s.tx - s.x, s.ty - s.y) > 4;
  const speed = RULES.subSpeed * s.mods.speed * (s.boost > 0 ? RULES.boostMult : 1);
  moveToward(s, s.tx, s.ty, speed, dt);
  for (const c of s.currents) {
    if (s.x >= c.x && s.x <= c.x + c.w && s.y >= c.y && s.y <= c.y + c.h) { s.x += c.dx * dt; s.y += c.dy * dt; }
  }
  s.x = Math.max(14, Math.min(W - 14, s.x)); s.y = Math.max(40, Math.min(H - 20, s.y));
  // Geheimnis: still sitzen im Kelp
  if (!moving && !s.holding && s.level.env === 'kelp') {
    s.idleT += dt;
    if (s.idleT >= RULES.whaleIdle && !s.secretsFound.includes('whale')) { s.secretsFound.push('whale'); ev.onSecret('whale'); }
  } else s.idleT = 0;

  for (const o of s.objects) {
    if (o.kind === 'jelly') {
      o.x += (o.vx + Math.sin(s.t * 0.8 + o.phase) * 8) * dt;
      o.y += (o.vy + Math.cos(s.t * 0.6 + o.phase) * 6) * dt;
    } else if (o.kind === 'fish') {
      if (o.huntT > 0) { o.huntT -= dt; moveToward(o, o.tx, o.ty, RULES.fish.speed, dt); }
      else { o.x += (o.vx + Math.sin(s.t * 1.1 + o.phase) * 10) * dt; o.y += (o.vy + Math.cos(s.t * 0.9 + o.phase) * 8) * dt; }
    } else if ((o.kind === 'pearl' || o.kind === 'gold') && s.magnet > 0) {
      if (Math.hypot(o.x - s.x, o.y - s.y) < RULES.magnetRadius) moveToward(o, s.x, s.y, RULES.magnetPull, dt);
    }
    if (o.x < 20) o.vx = Math.abs(o.vx); if (o.x > W - 20) o.vx = -Math.abs(o.vx);
    if (o.y < 40) o.vy = Math.abs(o.vy); if (o.y > H - 40) o.vy = -Math.abs(o.vy);
    o.x = Math.max(16, Math.min(W - 16, o.x)); o.y = Math.max(36, Math.min(H - 36, o.y));
    o.vis = Math.max(0, o.vis - RULES.visDecay * dt);
    if (s.flare > 0) o.vis = 1;
    else if (Math.hypot(o.x - s.x, o.y - s.y) < RULES.headlight) o.vis = Math.max(o.vis, 0.45);
  }
  s.chainT = Math.max(0, s.chainT - dt);
  if (s.chainT === 0) s.chain = 0;

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
  if (s.boss && s.flare > 0) s.boss.vis = 1;

  updateTorpedoes(s, dt, rng, ev);
  if (s.boss) { updateBoss(s, dt, rng, ev); if (!s.alive) return; }

  s.oxygen -= s.level.drain * s.mods.drain * (s.tutorial && s.levelIndex === 0 ? 0.6 : 1) * dt;
  if (s.oxygen <= 0) { s.oxygen = 0; die(s, 'oxygen', ev); return; }

  for (const o of s.objects) {
    const od = Math.hypot(o.x - s.x, o.y - s.y);
    if (od >= RULES.hit[o.kind]) continue;
    if (o.kind === 'pearl' || o.kind === 'gold') {
      const worth = o.kind === 'gold' ? RULES.goldWorth : 1;
      s.pearls += worth; s.pearlsDive += worth;
      s.chain = s.chainT > 0 ? s.chain + 1 : 1;
      s.chainT = RULES.chainWindow;
      s.bonus += (s.chain - 1) * RULES.chainScore;
      s.oxygen = Math.min(100, s.oxygen + RULES.pearlAir + (s.chain - 1) * RULES.chainAir);
      s.objects = s.objects.filter((q) => q !== o);
      ev.onPearl(o.x, o.y, s.chain);
      if (o.kind === 'gold' && !s.secretsFound.includes('captain')) { s.secretsFound.push('captain'); ev.onSecret('captain'); }
      break;
    }
    if (o.kind === 'tank') {
      s.oxygen = Math.min(100, s.oxygen + RULES.tankAir);
      s.objects = s.objects.filter((q) => q !== o);
      ev.onTank(o.x, o.y);
      break;
    }
    if (POWERUPS.includes(o.kind)) {
      s.objects = s.objects.filter((q) => q !== o);
      if (o.kind === 'torpedo') s.ammo += RULES.torpedo.perCrate + s.mods.torpedoes;
      if (o.kind === 'flare') { s.flare = RULES.flareTime; for (const q of s.objects) q.vis = 1; if (s.boss) s.boss.vis = 1; }
      if (o.kind === 'magnet') s.magnet = RULES.magnetTime;
      if (o.kind === 'shield') s.shield = true;
      if (o.kind === 'boost') s.boost = RULES.boostTime;
      ev.onPowerup(o.kind, o.x, o.y);
      break;
    }
    if (s.invuln > 0) continue;
    die(s, o.kind, ev);
    return;
  }
  if (!s.hatchOpen && s.pearls >= s.level.pearlsNeeded && (!s.level.boss || s.bossDefeated) && s.levelT > (s.level.env === 'grotto' ? 6 : 0)) { s.hatchOpen = true; ev.onHatchOpen(); }

  if (s.hatchOpen && Math.hypot(s.x - RULES.hatch.x, s.y - RULES.hatch.y) < RULES.hatch.r) {
    s.transition = 1.3;
    s.holding = false;
    if (s.pingsThisLevel === 0 && !s.secretsFound.includes('ghost')) { s.secretsFound.push('ghost'); ev.onSecret('ghost'); }
    if (s.oxygen >= 99 && !s.secretsFound.includes('fulltank')) { s.secretsFound.push('fulltank'); ev.onSecret('fulltank'); }
  }
}

export function nearestMine(s: State): number {
  let best = Infinity;
  for (const o of s.objects) if (o.kind === 'mine') best = Math.min(best, Math.hypot(o.x - s.x, o.y - s.y));
  return best;
}

export function score(s: State): number {
  return s.level.depth + s.pearlsDive * 10 + s.bonus;
}
