import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { createState, RULES, tap, update } from './logic';

describe('Sonar', () => {
  it('Ping macht Objekte sichtbar, Sichtbarkeit klingt ab', () => {
    const s = createState();
    const rng = mulberry32(1);
    update(s, 1 / 60, rng);
    expect(s.objects.length).toBe(RULES.counts.pearl + RULES.counts.mine + RULES.counts.jelly);
    expect(s.objects.every((o) => o.vis === 0)).toBe(true);
    tap(s, s.x, s.y);
    for (let i = 0; i < 60; i++) update(s, 1 / 60, rng);
    expect(s.objects.some((o) => o.vis > 0)).toBe(true);
    for (let i = 0; i < 180; i++) update(s, 1 / 60, rng);
    expect(s.objects.every((o) => o.vis === 0)).toBe(true);
  });
  it('Ping kostet Sauerstoff, ohne Perlen geht die Luft aus', () => {
    const s = createState();
    const rng = mulberry32(2);
    tap(s, s.x, s.y);
    expect(s.oxygen).toBe(100 - RULES.pingCost);
    for (let i = 0; i < 60 * 60 && s.alive; i++) update(s, 1 / 60, rng);
    expect(s.alive).toBe(false);
  });
  it('Perle einsammeln gibt Luft und Punkte', () => {
    const s = createState();
    const rng = mulberry32(3);
    update(s, 1 / 60, rng);
    const pearl = s.objects.find((o) => o.kind === 'pearl')!;
    s.x = pearl.x; s.y = pearl.y; s.tx = pearl.x; s.ty = pearl.y;
    s.oxygen = 50;
    update(s, 1 / 60, rng);
    expect(s.pearls).toBe(1);
    expect(s.oxygen).toBeGreaterThan(60);
  });
});
