import { describe, expect, it } from 'vitest';
import { dailySeed, mulberry32 } from './rng';

describe('mulberry32', () => {
  it('ist deterministisch bei gleichem Seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('liefert Werte in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('unterschiedliche Seeds liefern unterschiedliche Folgen', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('dailySeed', () => {
  it('ist am selben Tag gleich und am nächsten Tag anders', () => {
    const d1 = new Date(Date.UTC(2026, 8, 9, 3));
    const d2 = new Date(Date.UTC(2026, 8, 9, 22));
    const d3 = new Date(Date.UTC(2026, 8, 10, 1));
    expect(dailySeed(d1)).toBe(dailySeed(d2));
    expect(dailySeed(d1)).not.toBe(dailySeed(d3));
    expect(dailySeed(d1)).toBe(20260909);
  });
});
