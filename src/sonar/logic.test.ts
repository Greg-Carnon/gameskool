import { describe, expect, it } from 'vitest';
import { H, W } from '../kit/canvas';
import { mulberry32 } from '../kit/rng';
import { LEVELS, levelAt } from './levels';
import { createState, krakenArmPoints, pointerDown, pointerUp, POWERUPS, RULES, startLevel, update, type Events, type State } from './logic';
import { buy, claimMilestones, loadMeta, modsFrom, paintFor, unlock } from './meta';

const noop: Events = {
  onPearl: () => {}, onTank: () => {}, onPowerup: () => {}, onTorpedoHit: () => {}, onShieldBreak: () => {}, onHatchOpen: () => {},
  onDescend: () => {}, onBossHit: () => {}, onBossDown: () => {}, onBossHunt: () => {}, onBossStrike: () => {}, onSecret: () => {},
  onDeath: () => {}, onLifeLost: () => {},
};
const mods = { pingRange: 1, drain: 1, speed: 1, torpedoes: 0, hull: 0 };
function fresh(index = 0, seed = 1, m = mods): State {
  const s = createState(m);
  startLevel(s, index, mulberry32(seed), noop);
  return s;
}
function park(s: State, x: number, y: number): void { s.x = x; s.y = y; s.tx = x; s.ty = y; }
function ping(s: State, ev: Events = noop, hold = 0): boolean {
  pointerDown(s, s.x, s.y);
  for (let i = 0; i < hold * 60; i++) update(s, 1 / 60, mulberry32(1), ev);
  return pointerUp(s, ev);
}

describe('Levels', () => {
  it('drei Bosse an festen Tiefen, danach Zyklus', () => {
    expect(LEVELS[4].boss).toBe('angler');
    expect(LEVELS[7].boss).toBe('kraken');
    expect(LEVELS[10].boss).toBe('leviathan');
    expect(levelAt(LEVELS.length + 2).boss).toBe('angler');
    expect(levelAt(LEVELS.length + 5).boss).toBe('kraken');
    expect(levelAt(LEVELS.length + 8).boss).toBe('leviathan');
    expect(levelAt(LEVELS.length + 11).boss).toBe('megalodon');
    expect(LEVELS[11].boss).toBe('megalodon');
    expect(LEVELS[12].env).toBe('grotto');
    expect(levelAt(LEVELS.length + 4).depth).toBeGreaterThan(levelAt(LEVELS.length).depth);
  });
});

describe('Ping und Sicht', () => {
  it('Ping macht Objekte sichtbar, Sicht klingt ab, Ping kostet Sauerstoff', () => {
    const s = fresh();
    const rng = mulberry32(1);
    expect(s.objects.every((o) => o.vis === 0)).toBe(true);
    ping(s);
    expect(s.oxygen).toBe(100 - RULES.pingCost);
    for (let i = 0; i < 60; i++) update(s, 1 / 60, rng, noop);
    expect(s.objects.some((o) => o.vis > 0)).toBe(true);
    for (let i = 0; i < 200; i++) update(s, 1 / 60, rng, noop);
    expect(s.objects.every((o) => o.vis === 0)).toBe(true);
  });
  it('langes Halten macht einen großen Ping mit doppelten Kosten', () => {
    const s = fresh();
    expect(ping(s, noop, 0.5)).toBe(true);
    expect(s.pings[0].max).toBeCloseTo(s.level.pingMax * RULES.bigPingMult, 5);
  });
  it('Fische jagen den Ping', () => {
    const s = fresh(3);
    const fish = s.objects.filter((o) => o.kind === 'fish');
    expect(fish.length).toBeGreaterThan(0);
    ping(s);
    expect(fish.every((f) => f.huntT > 0 && f.tx === s.x)).toBe(true);
  });
  it('Scheinwerfer zeigt nahe Objekte auch ohne Ping', () => {
    const s = fresh(0, 6);
    const mine = s.objects.find((o) => o.kind === 'mine')!;
    park(s, mine.x + 30, mine.y);
    update(s, 1 / 60, mulberry32(6), noop);
    expect(mine.vis).toBeGreaterThan(0.3);
  });
});

describe('Fortschritt und Leben', () => {
  it('genug Perlen öffnen die Luke, Luke führt ins nächste Level', () => {
    const s = fresh();
    let opened = 0; const descended: number[] = [];
    const ev: Events = { ...noop, onHatchOpen: () => opened++, onDescend: (_l, i) => descended.push(i) };
    const rng = mulberry32(2);
    for (let n = 0; n < s.level.pearlsNeeded; n++) {
      const pearl = s.objects.find((o) => o.kind === 'pearl')!;
      park(s, pearl.x, pearl.y);
      update(s, 1 / 60, rng, ev);
    }
    expect(s.hatchOpen).toBe(true);
    expect(opened).toBe(1);
    park(s, RULES.hatch.x, RULES.hatch.y);
    update(s, 1 / 60, rng, ev);
    expect(s.transition).toBeGreaterThan(0);
    for (let i = 0; i < 100; i++) update(s, 1 / 60, rng, ev);
    expect(s.levelIndex).toBe(1);
    expect(descended).toEqual([1]);
  });
  it('Luft aus kostet ein Leben und füllt auf, letztes Leben beendet, Respawn ist unverwundbar', () => {
    const s = fresh();
    const rng = mulberry32(3);
    const lost: number[] = [];
    for (let i = 0; i < 60 * 90 && lost.length === 0; i++) update(s, 1 / 60, rng, { ...noop, onLifeLost: (_b, l) => lost.push(l) });
    expect(lost).toEqual([RULES.lives - 1]);
    expect(s.oxygen).toBe(100);
    expect(s.invuln).toBeGreaterThan(0);
    const s2 = fresh(0, 11);
    s2.lives = 1;
    let by = '';
    const mine = s2.objects.find((o) => o.kind === 'mine')!;
    park(s2, mine.x, mine.y);
    update(s2, 1 / 60, mulberry32(11), { ...noop, onDeath: (b) => (by = b) });
    expect(s2.alive).toBe(false);
    expect(by).toBe('mine');
  });
  it('Schild fängt einen Treffer ab', () => {
    const s = fresh(0, 12);
    s.shield = true;
    let broke = 0;
    const mine = s.objects.find((o) => o.kind === 'mine')!;
    park(s, mine.x, mine.y);
    update(s, 1 / 60, mulberry32(12), { ...noop, onShieldBreak: () => broke++ });
    expect(broke).toBe(1);
    expect(s.lives).toBe(RULES.lives);
    expect(s.shield).toBe(false);
  });
});

describe('Chain und Pickups', () => {
  it('schnelle Perlen bilden eine Chain, Pause bricht sie', () => {
    const s = fresh(1, 5);
    const rng = mulberry32(5);
    const chains: number[] = [];
    const ev: Events = { ...noop, onPearl: (_x, _y, c) => chains.push(c) };
    const grab = () => { const p = s.objects.find((o) => o.kind === 'pearl')!; park(s, p.x, p.y); update(s, 1 / 60, rng, ev); };
    grab(); grab();
    expect(chains).toEqual([1, 2]);
    for (let i = 0; i < 60 * (RULES.chainWindow + 1); i++) { park(s, 5, 40); update(s, 1 / 60, rng, ev); }
    grab();
    expect(chains[2]).toBe(1);
  });
  it('jedes Pickup wirkt', () => {
    const got: string[] = [];
    const ev: Events = { ...noop, onPowerup: (k) => got.push(k) };
    for (const kind of POWERUPS) {
      const s = fresh(0, 20);
      s.objects.push({ kind, x: 200, y: 400, vis: 0, vx: 0, vy: 0, phase: 0, huntT: 0, tx: 200, ty: 400 });
      park(s, 200, 400);
      update(s, 1 / 60, mulberry32(20), ev);
      if (kind === 'torpedo') expect(s.ammo).toBe(RULES.torpedo.perCrate);
      if (kind === 'flare') { expect(s.flare).toBeGreaterThan(0); expect(s.objects.every((o) => o.vis === 1)).toBe(true); }
      if (kind === 'magnet') expect(s.magnet).toBeGreaterThan(0);
      if (kind === 'shield') expect(s.shield).toBe(true);
      if (kind === 'boost') expect(s.boost).toBeGreaterThan(0);
    }
    expect(got).toEqual(POWERUPS);
  });
  it('Magnet zieht Perlen an', () => {
    const s = fresh(0, 21);
    s.magnet = 5;
    const p = s.objects.find((o) => o.kind === 'pearl')!;
    park(s, p.x + 100, p.y);
    const before = p.x;
    update(s, 0.5, mulberry32(21), noop);
    expect(p.x).toBeGreaterThan(before);
  });
});

describe('Torpedos', () => {
  it('großer Ping mit Munition feuert in Tap-Richtung und sprengt eine Mine', () => {
    const s = fresh(0, 30);
    s.ammo = 1;
    s.objects = s.objects.filter((o) => o.kind !== 'mine');
    park(s, 100, 400);
    s.objects.push({ kind: 'mine', x: 300, y: 400, vis: 0, vx: 0, vy: 0, phase: 0, huntT: 0, tx: 300, ty: 400 });
    pointerDown(s, 300, 400);
    park(s, 100, 400);
    s.charge = 1;
    const hits: string[] = [];
    pointerUp(s, { ...noop, onTorpedoHit: (_x, _y, w) => hits.push(w) });
    expect(s.ammo).toBe(0);
    expect(s.torpedoes.length).toBe(1);
    for (let i = 0; i < 90 && hits.length === 0; i++) { park(s, 100, 400); update(s, 1 / 60, mulberry32(30), { ...noop, onTorpedoHit: (_x, _y, w) => hits.push(w) }); }
    expect(hits).toEqual(['mine']);
    expect(s.minesShot).toBe(1);
  });
  it('Torpedo verletzt den Boss', () => {
    const s = fresh(4, 31);
    s.ammo = 1;
    park(s, s.boss!.x, s.boss!.y - 120);
    pointerDown(s, s.boss!.x, s.boss!.y);
    s.charge = 1;
    pointerUp(s, noop);
    s.boss!.mode = 'prowl'; s.boss!.modeT = 9; s.boss!.tx = s.boss!.x; s.boss!.ty = s.boss!.y;
    for (let i = 0; i < 90 && s.boss && s.boss.hp === 3; i++) { park(s, s.boss.x, s.boss.y - 120); update(s, 1 / 60, mulberry32(31), noop); }
    expect(s.boss!.hp).toBe(2);
    expect(s.bossTorpedoUsed).toBe(true);
  });
});

describe('Bosse', () => {
  it('Angler jagt den Ping und stirbt an drei Minen', () => {
    const s = fresh(4, 7);
    let down = 0;
    const ev: Events = { ...noop, onBossDown: () => down++ };
    ping(s, ev);
    expect(s.boss!.mode).toBe('hunt');
    const rng = mulberry32(8);
    for (let k = 0; k < 3; k++) {
      const mine = s.objects.find((o) => o.kind === 'mine')!;
      s.boss!.x = mine.x; s.boss!.y = mine.y; s.boss!.mode = 'prowl'; s.boss!.modeT = 5;
      park(s, 10, 40);
      update(s, 1 / 60, rng, ev);
    }
    expect(s.boss).toBeNull();
    expect(down).toBe(1);
  });
  it('Kraken schlägt nach Verzögerung am Ping-Ort zu und trifft dort Minen', () => {
    const s = fresh(7, 40);
    expect(s.boss!.kind).toBe('kraken');
    const rng = mulberry32(40);
    s.objects = s.objects.filter((o) => o.kind !== 'mine');
    s.objects.push({ kind: 'mine', x: 60, y: 100, vis: 0, vx: 0, vy: 0, phase: 0, huntT: 0, tx: 60, ty: 100 });
    park(s, 80, 100);
    let strikes = 0; const hits: number[] = [];
    const ev: Events = { ...noop, onBossStrike: () => strikes++, onBossHit: (_x, _y, hp) => hits.push(hp) };
    ping(s, ev);
    expect(s.boss!.mode).toBe('strike');
    expect(strikes).toBe(1);
    for (let i = 0; i < 80; i++) { park(s, 80, 300); update(s, 1 / 60, rng, ev); }
    expect(hits).toEqual([3]);
    expect(s.lives).toBe(RULES.lives);
  });
  it('Kraken-Arme sind tödlich, Schlag ohne Mine trifft das Boot', () => {
    const s = fresh(7, 41);
    const arm = krakenArmPoints(s.boss!, s.t)[0];
    park(s, (arm.x1 + arm.x2) / 2, (arm.y1 + arm.y2) / 2);
    let lost = 0;
    update(s, 1 / 60, mulberry32(41), { ...noop, onLifeLost: () => lost++ });
    expect(lost).toBe(1);
  });
  it('Leviathan folgt dem Boot und stirbt an Minen', () => {
    const s = fresh(10, 50);
    expect(s.boss!.kind).toBe('leviathan');
    const rng = mulberry32(50);
    const startD = Math.hypot(s.boss!.x - s.x, s.boss!.y - s.y);
    for (let i = 0; i < 60; i++) update(s, 1 / 60, rng, noop);
    expect(Math.hypot(s.boss!.x - s.x, s.boss!.y - s.y)).toBeLessThan(startD);
    let hits = 0;
    const mine = s.objects.find((o) => o.kind === 'mine')!;
    s.boss!.x = mine.x; s.boss!.y = mine.y; s.boss!.mode = 'prowl';
    park(s, W - 20, 40);
    update(s, 1 / 60, rng, { ...noop, onBossHit: () => hits++ });
    expect(hits).toBe(1);
  });
  it('Megalodon kündigt den Angriff an, rast geradeaus und stirbt an Minen auf der Bahn', () => {
    const s = fresh(11, 70);
    expect(s.boss!.kind).toBe('megalodon');
    const rng = mulberry32(70);
    let strikes = 0; const hits: number[] = [];
    const ev: Events = { ...noop, onBossStrike: () => strikes++, onBossHit: (_x, _y, hp) => hits.push(hp) };
    s.boss!.modeT = 0;
    park(s, W / 2, 140);
    update(s, 1 / 60, rng, ev);
    expect(s.boss!.mode).toBe('strike');
    expect(strikes).toBe(1);
    // Mine auf die Bahn legen, Boot weg
    s.objects = s.objects.filter((o) => o.kind !== 'mine');
    const b = s.boss!;
    s.objects.push({ kind: 'mine', x: b.x + b.strikeX * 120, y: b.y + b.strikeY * 120, vis: 0, vx: 0, vy: 0, phase: 0, huntT: 0, tx: 0, ty: 0 });
    for (let i = 0; i < 60 * 3 && hits.length === 0; i++) { park(s, 20, 40); update(s, 1 / 60, rng, ev); }
    expect(hits).toEqual([5]);
    expect(s.lives).toBe(RULES.lives);
  });
  it('Grotto verbraucht keine Luft und öffnet die Luke von selbst', () => {
    const s = fresh(12, 71);
    const rng = mulberry32(71);
    let opened = 0;
    for (let i = 0; i < 60 * 7; i++) update(s, 1 / 60, rng, { ...noop, onHatchOpen: () => opened++ });
    expect(s.oxygen).toBe(100);
    expect(s.objects.length).toBe(0);
    expect(opened).toBe(1);
    const secrets: string[] = [];
    park(s, RULES.hatch.x, RULES.hatch.y);
    update(s, 1 / 60, rng, { ...noop, onSecret: (id) => secrets.push(id) });
    expect(secrets).toEqual([]);
  });
  it('Luke öffnet im Bosslevel erst nach dem Sieg', () => {
    const s = fresh(4, 9);
    const rng = mulberry32(9);
    for (let n = 0; n < s.level.pearlsNeeded; n++) {
      const pearl = s.objects.find((o) => o.kind === 'pearl')!;
      park(s, pearl.x, pearl.y);
      s.boss!.x = 5; s.boss!.y = 5;
      update(s, 1 / 60, rng, noop);
    }
    expect(s.hatchOpen).toBe(false);
    s.bossDefeated = true; s.boss = null;
    update(s, 1 / 60, rng, noop);
    expect(s.hatchOpen).toBe(true);
  });
});

describe('Geheimnisse', () => {
  it('Ping im Wrack lässt die Perle des Kapitäns erscheinen', () => {
    const s = fresh(2, 60);
    const h = RULES.wreckHull;
    park(s, h.x + h.w / 2, h.y + h.h / 2);
    const secrets: string[] = [];
    ping(s, { ...noop, onSecret: (id) => secrets.push(id) });
    const gold = s.objects.find((o) => o.kind === 'gold');
    expect(gold).toBeDefined();
    park(s, gold!.x, gold!.y);
    update(s, 1 / 60, mulberry32(60), { ...noop, onSecret: (id) => secrets.push(id) });
    expect(secrets).toEqual(['captain']);
    expect(s.pearlsDive).toBe(RULES.goldWorth);
  });
  it('Still sitzen im Kelp ruft den Wal', () => {
    const s = fresh(1, 61);
    const secrets: string[] = [];
    for (let i = 0; i < 60 * (RULES.whaleIdle + 1); i++) update(s, 1 / 60, mulberry32(61), { ...noop, onSecret: (id) => secrets.push(id) });
    expect(secrets).toEqual(['whale']);
  });
  it('Luke ohne Ping und mit voller Luft löst Ghost und Full tank aus', () => {
    const s = fresh(0, 62);
    s.pearls = s.level.pearlsNeeded; s.hatchOpen = true; s.oxygen = 100;
    const secrets: string[] = [];
    park(s, RULES.hatch.x, RULES.hatch.y);
    update(s, 1 / 60, mulberry32(62), { ...noop, onSecret: (id) => secrets.push(id) });
    expect(secrets.sort()).toEqual(['fulltank', 'ghost']);
  });
});

describe('Meta', () => {
  it('Upgrades kosten Perlen und wirken, Meilensteine zahlen einmal aus', () => {
    const m = loadMeta();
    m.pearlBank = 10;
    expect(buy(m, 'range')).toBe(true);
    expect(m.pearlBank).toBe(2);
    expect(modsFrom(m).pingRange).toBeCloseTo(1.15, 5);
    expect(unlock(m, 'first')).toBe(true);
    expect(unlock(m, 'first')).toBe(false);
    const got = claimMilestones(m, 80);
    expect(got.map((g) => g.depth)).toEqual([45, 80]);
    expect(m.pearlBank).toBe(2 + 5 + 10);
    expect(claimMilestones(m, 80)).toEqual([]);
    expect(paintFor(m)).toBe('#ffd23f');
    claimMilestones(m, 160);
    expect(paintFor(m)).toBe('#ff9a5c');
  });
});
void H;
