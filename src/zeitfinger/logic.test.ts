import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { createState, multiplier, update } from './logic';

describe('Zeitfinger', () => {
  it('ohne Halten passiert nichts', () => {
    const s = createState();
    const rng = mulberry32(1);
    for (let i = 0; i < 120; i++) update(s, 1 / 60, rng);
    expect(s.y).toBe(0);
    expect(s.t).toBe(0);
    expect(s.alive).toBe(true);
  });
  it('beim Halten steigt Fortschritt und Zeit', () => {
    const s = createState();
    s.held = true;
    update(s, 1, mulberry32(1));
    expect(s.y).toBeGreaterThan(100);
    expect(s.t).toBe(1);
  });
  it('Multiplikator wächst bis 3', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(4)).toBe(3);
  });
  it('dauerhaftes Halten endet tödlich', () => {
    const s = createState();
    s.held = true;
    const rng = mulberry32(3);
    for (let i = 0; i < 60 * 60 && s.alive; i++) update(s, 1 / 60, rng);
    expect(s.alive).toBe(false);
  });
});
