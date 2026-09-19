import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { isCorrect, judge, LEVELS, makePerson, makeRound, solve, WAIT_THRESHOLD, type Slot } from './rules';

const rng = mulberry32(3);
const guy = (t: Parameters<typeof makePerson>[0] = 'normal'): Slot => ({ kind: 'taken', who: makePerson(t, rng) });
const F: Slot = { kind: 'free' };

describe('judge', () => {
  it('nebeneinander ist schlecht, Abstand gut, Rand am besten', () => {
    const slots: Slot[] = [F, F, guy(), F, F];
    const s = solve(slots, false);
    expect(s.scores[1]).toBeGreaterThan(s.scores[0]);
    expect(s.scores[4]).toBe(s.best);
    expect(s.scores[0]).toBe(s.best);
    expect(isCorrect(s, 4)).toBe(true);
    expect(isCorrect(s, 1)).toBe(false);
  });
  it('defekt und besetzt sind unmöglich, nass kostet', () => {
    const slots: Slot[] = [{ kind: 'broken' }, { kind: 'wet' }, F, guy(), F];
    expect(judge(slots, 0).score).toBe(Infinity);
    expect(judge(slots, 3).score).toBe(Infinity);
    expect(judge(slots, 1).score).toBeGreaterThan(judge(slots, 2).score - 100);
    expect(judge(slots, 1).reasons).toContain('Wet floor.');
  });
  it('der Freund macht Danebenstehen richtig', () => {
    const slots: Slot[] = [guy('friend'), F, F, F, guy('talker')];
    const s = solve(slots, true);
    expect(isCorrect(s, 1)).toBe(true);
    expect(isCorrect(s, 3)).toBe(false);
  });
  it('wenn alles schlecht ist, ist Warten richtig', () => {
    const slots: Slot[] = [guy('talker'), F, guy('boss'), F, guy('kid')];
    const s = solve(slots, true);
    expect(s.best).toBeGreaterThanOrEqual(WAIT_THRESHOLD);
    expect(isCorrect(s, 'wait')).toBe(true);
    expect(isCorrect(s, 1)).toBe(false);
    expect(isCorrect(solve([F, F, guy(), F, F], true), 'wait')).toBe(false);
  });
});

describe('makeRound', () => {
  it('jedes Level liefert lösbare Runden mit höchstens zwei richtigen Plätzen', () => {
    const r = mulberry32(9);
    for (const cfg of LEVELS) {
      for (let i = 0; i < 40; i++) {
        const slots = makeRound(cfg, r);
        const ans = solve(slots, cfg.waitAllowed);
        const ok = ans.waitIsBest || (Number.isFinite(ans.best) && ans.scores.filter((x) => x === ans.best).length <= 2);
        expect(ok).toBe(true);
        expect(slots.length).toBe(cfg.urinals);
      }
    }
  });
  it('vor Level 5 gibt es nie eine Warten-Runde', () => {
    const r = mulberry32(10);
    for (const cfg of LEVELS.slice(0, 4)) for (let i = 0; i < 40; i++) expect(solve(makeRound(cfg, r), true).waitIsBest).toBe(false);
  });
});
