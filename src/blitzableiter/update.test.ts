import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { RULES } from './rules';
import { createState } from './state';
import { placeRod, update, type Events } from './update';

function run(seconds: number, s = createState(0), rng = mulberry32(1), ev?: Partial<Events>) {
  const events: Events = { onChain: ev?.onChain ?? (() => {}), onGameOver: ev?.onGameOver ?? (() => {}) };
  const steps = Math.round(seconds * 60);
  for (let i = 0; i < steps; i++) update(s, 1 / 60, rng, events);
  return s;
}

describe('Blitzableiter update', () => {
  it('spawnt Ladungen und verliert ohne Ableiter', () => {
    let over = 0;
    const s = run(40, createState(0), mulberry32(3), { onGameOver: () => over++ });
    expect(s.over).toBe(true);
    expect(over).toBe(1);
    expect(s.charges.length).toBeGreaterThan(RULES.charge.maxOnField);
  });

  it('eine Ladung auf einem Ableiter zündet und wird entladen', () => {
    const s = createState(0);
    s.charges.push({ x: 200, y: 400, heading: 0, speed: 0 });
    placeRod(s, 200, 400);
    const chains: number[] = [];
    run(0.1, s, mulberry32(1), { onChain: (rods) => chains.push(rods) });
    expect(chains).toEqual([1]);
    expect(s.charges.length).toBe(0);
    expect(s.rods.length).toBe(0);
    expect(s.score).toBe(1 * 1 * RULES.score.perZap * 1);
  });

  it('Ableiter im Kettenradius zünden mit, außerhalb nicht', () => {
    const s = createState(0);
    const r = RULES.rod.chainRadius;
    s.charges.push({ x: 100, y: 400, heading: 0, speed: 0 });
    placeRod(s, 100, 400);
    placeRod(s, 100 + r - 5, 400);          // in Reichweite
    placeRod(s, 100 + 2 * (r - 5), 400);    // über zweiten Ableiter erreichbar
    placeRod(s, 100, 400 + r + 5);          // knapp außerhalb
    const chains: number[] = [];
    run(0.1, s, mulberry32(1), { onChain: (rods) => chains.push(rods) });
    expect(chains).toEqual([3]);
    expect(s.rods.length).toBe(1);
    expect(s.bolts.length).toBe(2);
  });

  it('gezündete Ableiter entladen alle Ladungen im Zap-Radius', () => {
    const s = createState(0);
    const z = RULES.rod.zapRadius;
    s.charges.push({ x: 200, y: 400, heading: 0, speed: 0 });
    s.charges.push({ x: 200 + z - 2, y: 400, heading: 0, speed: 0 });
    s.charges.push({ x: 200, y: 400 + z + 20, heading: 0, speed: 0 });
    placeRod(s, 200, 400);
    let zaps = 0;
    run(0.1, s, mulberry32(1), { onChain: (_r, n) => (zaps = n) });
    expect(zaps).toBe(2);
    expect(s.charges.length).toBe(1);
    expect(s.score).toBe(2 * 2 * RULES.score.perZap);
  });

  it('hält maximal RULES.rod.max Ableiter, der älteste fliegt raus', () => {
    const s = createState(0);
    for (let i = 0; i < RULES.rod.max + 2; i++) placeRod(s, 10 + i * 30, 100);
    expect(s.rods.length).toBe(RULES.rod.max);
    expect(s.rods[0].x).toBe(10 + 2 * 30);
  });

  it('Ableiter verfallen nach der Lebensdauer', () => {
    const s = createState(0);
    placeRod(s, 300, 700);
    run(RULES.rod.lifetime + 0.1, s);
    expect(s.rods.length).toBe(0);
  });
});
