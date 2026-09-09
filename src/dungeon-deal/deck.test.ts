import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../kit/rng';
import { buildDeck, createRun, draw, leave, monstersLeft } from './deck';

describe('Dungeon Deal', () => {
  it('Deck hat die erwartete Zusammensetzung', () => {
    const d = buildDeck(1, mulberry32(1));
    expect(d.length).toBe(8 + 6 + 3 + 2);
    expect(d.filter((c) => c.kind === 'monster').length).toBe(6);
    expect(buildDeck(3, mulberry32(1)).filter((c) => c.kind === 'monster').length).toBe(10);
  });
  it('Gold sammelt sich, Monster tun weh, Tod löscht das Getragene', () => {
    const r = createRun(mulberry32(2));
    r.deck = [{ kind: 'monster', value: 5 }, { kind: 'gold', value: 20 }];
    expect(draw(r)!.kind).toBe('gold');
    expect(r.carried).toBe(20);
    draw(r);
    expect(r.dead).toBe(true);
    expect(r.carried).toBe(0);
    expect(draw(r)).toBeNull();
  });
  it('Falle halbiert, Trank heilt gedeckelt', () => {
    const r = createRun(mulberry32(3));
    r.carried = 31; r.hp = 4;
    r.deck = [{ kind: 'potion', value: 2 }, { kind: 'trap', value: 0 }];
    draw(r);
    expect(r.carried).toBe(15);
    draw(r);
    expect(r.hp).toBe(5);
  });
  it('Verlassen sichert Gold und baut die nächste Etage', () => {
    const r = createRun(mulberry32(4));
    r.carried = 40;
    const g = leave(r, mulberry32(5));
    expect(g).toBe(40);
    expect(r.banked).toBe(40);
    expect(r.floor).toBe(2);
    expect(monstersLeft(r)).toBe(8);
  });
});
