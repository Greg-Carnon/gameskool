import { describe, expect, it } from 'vitest';
import { clamp, easeInOutQuad, easeOutBack, easeOutCubic, easeOutExpo, easeOutQuad, lerp } from './tween';

describe('easing', () => {
  const fns = { easeOutQuad, easeOutCubic, easeOutExpo, easeInOutQuad, easeOutBack };
  for (const [name, fn] of Object.entries(fns)) {
    it(`${name} startet bei 0 und endet bei 1`, () => {
      expect(fn(0)).toBeCloseTo(0, 5);
      expect(fn(1)).toBeCloseTo(1, 5);
    });
  }
  it('easeOutBack überschwingt über 1', () => {
    expect(easeOutBack(0.8)).toBeGreaterThan(1);
  });
});

describe('helpers', () => {
  it('clamp und lerp', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });
});
