import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { addLatecomer, goodSlots, isCorrect, isMoveCorrect, judge, LEVELS, makePerson, makeRound, mirrorLooker, placeWanderer, solve, solveMove, WAIT_THRESHOLD, type Slot } from './rules';

const rng = mulberry32(3);
const guy = (t: Parameters<typeof makePerson>[0] = 'normal'): Slot => ({ kind: 'taken', who: makePerson(t, rng) });
const F: Slot = { kind: 'free' };

describe('judge', () => {
  it('nebeneinander ist schlecht, Abstand gut, Rand am besten', () => {
    const s = solve([F, F, guy(), F, F], false);
    expect(s.scores[1]).toBeGreaterThan(s.scores[0]);
    expect(isCorrect(s, 4)).toBe(true);
    expect(isCorrect(s, 1)).toBe(false);
  });
  it('defekt und besetzt sind unmöglich, nass kostet', () => {
    const slots: Slot[] = [{ kind: 'broken' }, { kind: 'wet' }, F, guy(), F];
    expect(judge(slots, 0).score).toBe(Infinity);
    expect(judge(slots, 3).score).toBe(Infinity);
    expect(judge(slots, 1).reasons).toContain('Wet floor.');
  });
  it('der Freund macht Danebenstehen richtig', () => {
    const s = solve([guy('friend'), F, F, F, guy('talker')], true);
    expect(isCorrect(s, 1)).toBe(true);
    expect(isCorrect(s, 3)).toBe(false);
  });
  it('ein Platz Abstand ohne Randbonus zählt trotzdem als richtig', () => {
    const ans = solve([F, guy(), F, F, F], false);
    expect(isCorrect(ans, 3)).toBe(true);
    expect(isCorrect(ans, 4)).toBe(true);
    expect(isCorrect(ans, 2)).toBe(false);
    expect(isCorrect(ans, 0)).toBe(false);
  });
  it('wenn alles schlecht ist: freie Kabine schlägt Warten, sonst Warten', () => {
    const slots: Slot[] = [guy('talker'), F, guy('boss'), F, guy('kid')];
    const noStall = solve(slots, true, false);
    expect(noStall.best).toBeGreaterThanOrEqual(WAIT_THRESHOLD);
    expect(isCorrect(noStall, 'wait')).toBe(true);
    expect(isCorrect(noStall, 'stall')).toBe(false);
    const stall = solve(slots, true, true);
    expect(isCorrect(stall, 'stall')).toBe(true);
    expect(isCorrect(stall, 'wait')).toBe(false);
    expect(isCorrect(solve([F, F, guy(), F, F], true, true), 'stall')).toBe(false);
  });
});

describe('Nachzügler', () => {
  it('stellt sich neben den Spieler, Wechsel ist richtig wenn ein sauberer Platz existiert', () => {
    const slots: Slot[] = [F, F, F, F, F, F];
    slots[0] = { kind: 'taken', who: makePerson('normal', rng) }; // Spieler steht auf 0
    const at = addLatecomer(slots, 0, mulberry32(1), ['normal', 'talker']);
    expect(at).toBe(1);
    const m = solveMove(slots, 0);
    expect(m.stayScore).toBeGreaterThanOrEqual(WAIT_THRESHOLD);
    expect(m.moveIsRight).toBe(true);
    expect(isMoveCorrect(m, 5)).toBe(true);
    expect(isMoveCorrect(m, 'stay')).toBe(false);
    expect(isMoveCorrect(m, 2)).toBe(false);
  });
  it('bleiben ist richtig, wenn alle anderen Plätze auch schlecht sind', () => {
    const slots: Slot[] = [guy(), F, guy('boss'), F, guy('kid')];
    slots[1] = { kind: 'taken', who: makePerson('normal', rng) }; // Spieler auf 1 (schon schlecht)
    const at = addLatecomer(slots, 1, mulberry32(2), ['normal']);
    expect(at).toBe(-1);
    slots[3] = { kind: 'taken', who: makePerson('talker', rng) };
    const m = solveMove(slots, 1);
    expect(m.moveIsRight).toBe(false);
    expect(isMoveCorrect(m, 'stay')).toBe(true);
  });
});

describe('makeRound', () => {
  it('jede Runde hat einen sauberen Platz oder Warten beziehungsweise Kabine ist eindeutig', () => {
    const r = mulberry32(9);
    for (const cfg of LEVELS) {
      for (let i = 0; i < 60; i++) {
        const { slots, stallFree } = makeRound(cfg, r);
        const ans = solve(slots, cfg.waitAllowed, stallFree);
        const good = goodSlots(ans);
        if (ans.waitIsBest) { expect(good).toEqual([]); expect(isCorrect(ans, stallFree ? 'stall' : 'wait')).toBe(true); }
        else { expect(good.length).toBeGreaterThan(0); expect(good.length).toBeLessThanOrEqual(3); }
        if (!cfg.stalls) expect(stallFree).toBe(false);
        expect(slots.length).toBe(cfg.urinals);
      }
    }
  });
  it('Duos stehen nebeneinander', () => {
    const r = mulberry32(21);
    let seen = 0;
    for (let i = 0; i < 80; i++) {
      const { slots } = makeRound(LEVELS.find((c) => c.name === 'The Boss')!, r);
      slots.forEach((s, k) => { if (s.kind === 'taken' && s.who.trait === 'duo') { seen++; const n = [slots[k - 1], slots[k + 1]].some((x) => x && x.kind === 'taken' && x.who.trait === 'duo'); expect(n).toBe(true); } });
    }
    expect(seen).toBeGreaterThan(0);
  });
  it('ohne Warten-Knopf ist der richtige Platz immer trocken', () => {
    const r = mulberry32(31);
    for (const cfg of LEVELS.filter((c) => !c.waitAllowed)) for (let i = 0; i < 60; i++) {
      const { slots } = makeRound(cfg, r);
      const good = goodSlots(solve(slots, false));
      expect(good.some((g) => slots[g].kind === 'free')).toBe(true);
    }
  });
  it('der Riese belegt zwei Plätze und zählt einmal', () => {
    const cfg = LEVELS.find((c) => c.boss === 'giant')!;
    const { slots } = makeRound(cfg, mulberry32(41));
    const gi = slots.map((s, i) => (s.kind === 'taken' && s.who.trait === 'giant' ? i : -1)).filter((i) => i >= 0);
    expect(gi.length).toBe(2);
    expect(gi[1]).toBe(gi[0] + 1);
    const far = slots.findIndex((s, i) => s.kind === 'free' && Math.abs(i - gi[0]) >= 3 && Math.abs(i - gi[1]) >= 3);
    if (far >= 0) expect(judge(slots, far).score).toBeLessThan(WAIT_THRESHOLD);
  });
  it('Wanderer landet auf einem freien Platz, Spiegel wählt Nachbarn', () => {
    const slots: Slot[] = [guy('friend'), F, F, F, F, guy('talker')];
    const at = placeWanderer(slots, mulberry32(5));
    expect(slots[at].kind).toBe('taken');
    const m = mirrorLooker(slots, 2, mulberry32(6));
    expect(m).not.toBeNull();
    expect(typeof m!.wantsNod).toBe('boolean');
  });
  it('vor Level 5 gibt es nie eine Warten-Runde', () => {
    const r = mulberry32(10);
    for (const cfg of LEVELS.slice(0, 4)) for (let i = 0; i < 40; i++) expect(solve(makeRound(cfg, r).slots, true).waitIsBest).toBe(false);
  });
});
