import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { createState, GROUND, jump, PX, R, update } from './logic';

describe('Echo', () => {
  it('läuft, springt und landet wieder', () => {
    const s = createState([], [], 1);
    const rng = mulberry32(1);
    jump(s);
    let peak = GROUND;
    for (let i = 0; i < 60; i++) { update(s, 1 / 60, rng); peak = Math.min(peak, s.y); }
    expect(peak).toBeLessThan(GROUND - 100);
    expect(s.y).toBe(GROUND);
    expect(s.worldX).toBeGreaterThan(200);
  });
  it('stirbt an einem Echo-Marker an der gleichen Stelle', () => {
    const s = createState([{ x: PX + 30, y: GROUND - R, run: 2 }], [], 3);
    update(s, 1 / 60, mulberry32(1));
    for (let i = 0; i < 30 && s.alive; i++) update(s, 1 / 60, mulberry32(1));
    expect(s.alive).toBe(false);
    expect(s.deathBy).toBe('echo');
    expect(s.deathRun).toBe(2);
  });
  it('stirbt irgendwann an einem Hindernis ohne Springen', () => {
    const s = createState([], [], 1);
    const rng = mulberry32(2);
    for (let i = 0; i < 60 * 20 && s.alive; i++) update(s, 1 / 60, rng);
    expect(s.alive).toBe(false);
    expect(s.deathBy).toBe('obstacle');
  });
});
