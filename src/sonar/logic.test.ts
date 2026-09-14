import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { LEVELS, levelAt } from './levels';
import { createState, pointerDown, pointerUp, RULES, startLevel, update, type Events, type State } from './logic';
import { buy, loadMeta, modsFrom, unlock } from './meta';

const noop: Events = { onPearl: () => {}, onTank: () => {}, onHatchOpen: () => {}, onDescend: () => {}, onBossHit: () => {}, onBossDown: () => {}, onBossHunt: () => {}, onDeath: () => {}, onLifeLost: () => {} };
const mods = { pingRange: 1, drain: 1, speed: 1 };
function fresh(index = 0, seed = 1): State {
  const s = createState(mods);
  startLevel(s, index, mulberry32(seed), noop);
  return s;
}

describe('Levels', () => {
  it('Levelliste ist konsistent und der Abyss wird härter', () => {
    expect(LEVELS[4].boss).toBe(true);
    const a = levelAt(LEVELS.length);
    const b = levelAt(LEVELS.length + 4);
    expect(b.depth).toBeGreaterThan(a.depth);
    expect(b.counts.mine).toBeGreaterThanOrEqual(a.counts.mine);
    expect(levelAt(LEVELS.length + 2).boss).toBe(true);
  });
});

describe('Ping und Sicht', () => {
  it('Ping macht Objekte sichtbar, Sicht klingt ab, Ping kostet Sauerstoff', () => {
    const s = fresh();
    const rng = mulberry32(1);
    expect(s.objects.every((o) => o.vis === 0)).toBe(true);
    pointerDown(s, s.x, s.y); pointerUp(s, noop);
    expect(s.oxygen).toBe(100 - RULES.pingCost);
    for (let i = 0; i < 60; i++) update(s, 1 / 60, rng, noop);
    expect(s.objects.some((o) => o.vis > 0)).toBe(true);
    for (let i = 0; i < 200; i++) update(s, 1 / 60, rng, noop);
    expect(s.objects.every((o) => o.vis === 0)).toBe(true);
  });
  it('langes Halten macht einen großen Ping mit doppelten Kosten', () => {
    const s = fresh();
    pointerDown(s, s.x, s.y);
    for (let i = 0; i < 30; i++) update(s, 1 / 60, mulberry32(1), noop);
    const big = pointerUp(s, noop);
    expect(big).toBe(true);
    expect(s.pings[0].max).toBeCloseTo(s.level.pingMax * RULES.bigPingMult, 5);
  });
  it('Fische jagen den Ping', () => {
    const s = fresh(3);
    const fish = s.objects.filter((o) => o.kind === 'fish');
    expect(fish.length).toBeGreaterThan(0);
    pointerDown(s, s.x, s.y); pointerUp(s, noop);
    expect(fish.every((f) => f.huntT > 0 && f.tx === s.x)).toBe(true);
  });
});

describe('Fortschritt', () => {
  it('genug Perlen öffnen die Luke, Luke führt ins nächste Level', () => {
    const s = fresh();
    let opened = 0; let descended: number[] = [];
    const ev: Events = { ...noop, onHatchOpen: () => opened++, onDescend: (_l, i) => descended.push(i) };
    const rng = mulberry32(2);
    for (let n = 0; n < s.level.pearlsNeeded; n++) {
      const pearl = s.objects.find((o) => o.kind === 'pearl')!;
      s.x = pearl.x; s.y = pearl.y; s.tx = pearl.x; s.ty = pearl.y;
      update(s, 1 / 60, rng, ev);
    }
    expect(s.hatchOpen).toBe(true);
    expect(opened).toBe(1);
    s.x = RULES.hatch.x; s.y = RULES.hatch.y; s.tx = s.x; s.ty = s.y;
    update(s, 1 / 60, rng, ev);
    expect(s.transition).toBeGreaterThan(0);
    for (let i = 0; i < 100; i++) update(s, 1 / 60, rng, ev);
    expect(s.levelIndex).toBe(1);
    expect(descended).toEqual([1]);
    expect(s.pearls).toBe(0);
  });
  it('ohne Perlen geht die Luft aus, das kostet ein Leben und füllt die Luft wieder', () => {
    const s = fresh();
    const rng = mulberry32(3);
    let lost: number[] = [];
    for (let i = 0; i < 60 * 90 && lost.length === 0; i++) update(s, 1 / 60, rng, { ...noop, onLifeLost: (_b, l) => lost.push(l) });
    expect(lost).toEqual([RULES.lives - 1]);
    expect(s.alive).toBe(true);
    expect(s.oxygen).toBe(100);
    expect(s.invuln).toBeGreaterThan(0);
  });
  it('mit dem letzten Leben ist der Tauchgang vorbei', () => {
    const s = fresh(0, 11);
    s.lives = 1;
    let by = '';
    const mine = s.objects.find((o) => o.kind === 'mine')!;
    s.x = mine.x; s.y = mine.y; s.tx = s.x; s.ty = s.y;
    update(s, 1 / 60, mulberry32(11), { ...noop, onDeath: (b) => (by = b) });
    expect(s.alive).toBe(false);
    expect(by).toBe('mine');
    expect(s.lives).toBe(0);
  });
  it('nach dem Respawn ist man kurz unverwundbar und behält die Perlen', () => {
    const s = fresh(0, 12);
    const rng = mulberry32(12);
    s.pearls = 2; s.pearlsDive = 2;
    const mine = s.objects.find((o) => o.kind === 'mine')!;
    s.x = mine.x; s.y = mine.y; s.tx = s.x; s.ty = s.y;
    update(s, 1 / 60, rng, noop);
    expect(s.lives).toBe(RULES.lives - 1);
    expect(s.pearls).toBe(2);
    const mine2 = s.objects.find((o) => o.kind === 'mine')!;
    s.x = mine2.x; s.y = mine2.y; s.tx = s.x; s.ty = s.y;
    update(s, 1 / 60, rng, noop);
    expect(s.lives).toBe(RULES.lives - 1);
  });
});

describe('Chain', () => {
  it('schnelle Perlen bilden eine Chain mit Bonus, Pause bricht sie', () => {
    const s = fresh(1, 5);
    const rng = mulberry32(5);
    const chains: number[] = [];
    const ev: Events = { ...noop, onPearl: (_x, _y, c) => chains.push(c) };
    const grab = () => { const p = s.objects.find((o) => o.kind === 'pearl')!; s.x = p.x; s.y = p.y; s.tx = p.x; s.ty = p.y; update(s, 1 / 60, rng, ev); };
    grab(); grab();
    expect(chains).toEqual([1, 2]);
    expect(s.bonus).toBe(RULES.chainScore);
    for (let i = 0; i < 60 * (RULES.chainWindow + 1); i++) { s.x = 5; s.y = 40; s.tx = 5; s.ty = 40; update(s, 1 / 60, rng, ev); }
    grab();
    expect(chains[2]).toBe(1);
  });
  it('Scheinwerfer zeigt nahe Objekte auch ohne Ping', () => {
    const s = fresh(0, 6);
    const mine = s.objects.find((o) => o.kind === 'mine')!;
    s.x = mine.x + 30; s.y = mine.y; s.tx = s.x; s.ty = s.y;
    update(s, 1 / 60, mulberry32(6), noop);
    expect(mine.vis).toBeGreaterThan(0.3);
  });
});

describe('Boss', () => {
  it('Boss jagt den Ping und stirbt an drei Minen', () => {
    const s = fresh(4, 7);
    expect(s.boss).not.toBeNull();
    const hunts: number[] = []; let down = 0;
    const ev: Events = { ...noop, onBossHunt: () => hunts.push(1), onBossDown: () => down++ };
    s.levelT = RULES.boss.grace + 1;
    pointerDown(s, s.x, s.y); pointerUp(s, ev);
    expect(s.boss!.mode).toBe('hunt');
    expect(hunts.length).toBe(1);
    const rng = mulberry32(8);
    for (let k = 0; k < 3; k++) {
      const mine = s.objects.find((o) => o.kind === 'mine')!;
      s.boss!.x = mine.x; s.boss!.y = mine.y; s.boss!.mode = 'prowl'; s.boss!.modeT = 5;
      s.x = 10; s.y = 40; s.tx = 10; s.ty = 40; // weit weg
      update(s, 1 / 60, rng, ev);
      if (k < 2) expect(s.boss!.hp).toBe(2 - k);
    }
    expect(s.boss).toBeNull();
    expect(s.bossDefeated).toBe(true);
    expect(down).toBe(1);
  });
  it('Luke öffnet im Bosslevel erst nach dem Sieg', () => {
    const s = fresh(4, 9);
    const rng = mulberry32(9);
    for (let n = 0; n < s.level.pearlsNeeded; n++) {
      const pearl = s.objects.find((o) => o.kind === 'pearl')!;
      s.x = pearl.x; s.y = pearl.y; s.tx = pearl.x; s.ty = pearl.y;
      s.boss!.x = 5; s.boss!.y = 5;
      update(s, 1 / 60, rng, noop);
    }
    expect(s.hatchOpen).toBe(false);
    s.bossDefeated = true; s.boss = null;
    update(s, 1 / 60, rng, noop);
    expect(s.hatchOpen).toBe(true);
  });
});

describe('Meta', () => {
  it('Upgrades kosten Perlen und wirken', () => {
    const m = loadMeta();
    m.pearlBank = 10;
    expect(buy(m, 'range')).toBe(true);
    expect(m.pearlBank).toBe(2);
    expect(buy(m, 'range')).toBe(false);
    expect(modsFrom(m).pingRange).toBeCloseTo(1.15, 5);
    expect(unlock(m, 'first')).toBe(true);
    expect(unlock(m, 'first')).toBe(false);
  });
});
