import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { fallTime, spawnComponent, tierAt, violationsFor } from './components';
import { RULES, TEMPLATES, VIOLATIONS } from './rules';
import { createState } from './state';
import { levelName, multiplier, tapAt, update, type Events } from './update';

const noop: Events = { onCorrect: () => {}, onMistake: () => {}, onGameOver: () => {} };

describe('Generator', () => {
  it('Tier steigt mit der Zeit', () => {
    expect(tierAt(0)).toBe(1);
    expect(tierAt(RULES.tierAt[1])).toBe(2);
    expect(tierAt(RULES.tierAt[2] + 1)).toBe(3);
  });
  it('Fallzeit wird kürzer, aber nie kürzer als das Ende', () => {
    expect(fallTime(0)).toBe(RULES.fall.timeStart);
    expect(fallTime(9999)).toBe(RULES.fall.timeEnd);
  });
  it('jedes Template hat in Tier 1 mindestens zwei Verletzungen', () => {
    for (const t of TEMPLATES) expect(violationsFor(t, 1).length).toBeGreaterThanOrEqual(2);
  });
  it('Slop-Komponente hat eine Verletzung, saubere nicht', () => {
    const rng = mulberry32(5);
    const slop = spawnComponent(0, rng, 1, true);
    const clean = spawnComponent(0, rng, 2, false);
    expect(slop.violationId).not.toBeNull();
    expect(slop.violationLabel).toBeTruthy();
    expect(clean.violationId).toBeNull();
  });
  it('vor Sekunde 30 kommt kein Tier-2-Slop', () => {
    const rng = mulberry32(9);
    const t2ids = new Set(VIOLATIONS.filter((v) => v.tier > 1).map((v) => v.id));
    for (let i = 0; i < 300; i++) {
      const c = spawnComponent(10, rng, i, true);
      expect(t2ids.has(c.violationId!)).toBe(false);
    }
  });
});

describe('Scoring', () => {
  it('Multiplikator steigt alle 5 Treffer', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(4)).toBe(1);
    expect(multiplier(5)).toBe(2);
    expect(multiplier(10)).toBe(3);
  });
  it('Level-Namen nach Score', () => {
    expect(levelName(0)).toBe('Intern');
    expect(levelName(900)).toBe('Jack');
  });
  it('Slop antippen ist richtig, sauberes antippen ist ein Strike', () => {
    const s = createState(0);
    const rng = mulberry32(1);
    const slop = spawnComponent(0, rng, 1, true); slop.y = 100;
    const clean = spawnComponent(0, rng, 2, false); clean.y = 300;
    s.components.push(slop, clean);
    expect(tapAt(s, 100, 110, noop)).toBe(true);
    expect(s.score).toBe(RULES.score.perCorrect);
    expect(s.combo).toBe(1);
    expect(tapAt(s, 100, 310, noop)).toBe(true);
    expect(s.strikes).toBe(1);
    expect(s.combo).toBe(0);
    expect(s.lastMistake).toContain('clean');
  });
  it('Tap neben dem Feld trifft nichts', () => {
    const s = createState(0);
    const c = spawnComponent(0, mulberry32(1), 1, true); c.y = 100;
    s.components.push(c);
    expect(tapAt(s, 10, 110, noop)).toBe(false);
  });
});

describe('Update', () => {
  it('durchgelassener Slop ist ein Strike, sauberes Design gibt Punkte und landet in der Website', () => {
    const s = createState(0);
    const rng = mulberry32(2);
    const slop = spawnComponent(0, rng, 1, true); slop.y = RULES.field.acceptY - slop.h - 1; slop.speed = 1000;
    s.components.push(slop);
    s.spawnAcc = -99;
    update(s, 1 / 60, rng, noop);
    expect(s.strikes).toBe(1);
    expect(s.built).toEqual([{ template: slop.template, slop: true }]);
    expect(s.lastMistake).toContain(slop.violationLabel);

    const clean = spawnComponent(0, rng, 2, false); clean.y = RULES.field.acceptY - clean.h - 1; clean.speed = 1000;
    s.components.push(clean);
    update(s, 1 / 60, rng, noop);
    expect(s.score).toBe(RULES.score.perCorrect);
    expect(s.built.length).toBe(2);
  });
  it('drei Strikes beenden das Spiel genau einmal', () => {
    const s = createState(0);
    let overs = 0;
    const ev: Events = { ...noop, onGameOver: () => overs++ };
    const rng = mulberry32(3);
    for (let i = 0; i < 5; i++) {
      const c = spawnComponent(0, rng, i, false); c.y = 100 + i * 20;
      s.components.push(c);
      tapAt(s, 100, 110 + i * 20, ev);
    }
    expect(s.over).toBe(true);
    expect(overs).toBe(1);
    expect(s.strikes).toBe(RULES.strikes);
  });
  it('ohne Eingriff bleibt der Spieler nicht ewig am Leben', () => {
    const s = createState(0);
    const rng = mulberry32(4);
    for (let i = 0; i < 60 * 60 && !s.over; i++) update(s, 1 / 60, rng, noop);
    expect(s.over).toBe(true);
  });
});
