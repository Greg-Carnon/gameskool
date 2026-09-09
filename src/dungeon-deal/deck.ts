export type Kind = 'gold' | 'monster' | 'potion' | 'trap';
export interface Card { kind: Kind; value: number }

export interface Run {
  floor: number;
  hp: number;
  maxHp: number;
  carried: number;
  banked: number;
  deck: Card[];
  revealed: Card[];
  dead: boolean;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeck(floor: number, rng: () => number): Card[] {
  const cards: Card[] = [];
  const mult = 1 + 0.5 * (floor - 1);
  for (let i = 0; i < 8; i++) cards.push({ kind: 'gold', value: Math.round((10 + Math.floor(rng() * 31)) * mult) });
  const monsters = 6 + 2 * (floor - 1);
  for (let i = 0; i < monsters; i++) cards.push({ kind: 'monster', value: 1 + Math.floor(rng() * Math.min(3, 1 + floor / 2)) });
  for (let i = 0; i < 3; i++) cards.push({ kind: 'potion', value: 2 });
  for (let i = 0; i < 2; i++) cards.push({ kind: 'trap', value: 0 });
  return shuffle(cards, rng);
}

export function createRun(rng: () => number, banked = 0): Run {
  return { floor: 1, hp: 5, maxHp: 5, carried: 0, banked, deck: buildDeck(1, rng), revealed: [], dead: false };
}

export function monstersLeft(r: Run): number {
  return r.deck.filter((c) => c.kind === 'monster').length;
}

/** Nächste Karte aufdecken und anwenden. Gibt die Karte zurück, null wenn nichts geht. */
export function draw(r: Run): Card | null {
  if (r.dead || r.deck.length === 0) return null;
  const c = r.deck.pop()!;
  r.revealed.push(c);
  switch (c.kind) {
    case 'gold': r.carried += c.value; break;
    case 'monster': r.hp -= c.value; break;
    case 'potion': r.hp = Math.min(r.maxHp, r.hp + c.value); break;
    case 'trap': r.carried = Math.floor(r.carried / 2); break;
  }
  if (r.hp <= 0) { r.hp = 0; r.dead = true; r.carried = 0; }
  return c;
}

/** Mit dem Gold raus: sichern, nächste Etage. */
export function leave(r: Run, rng: () => number): number {
  if (r.dead) return 0;
  const gained = r.carried;
  r.banked += gained;
  r.carried = 0;
  r.floor++;
  r.deck = buildDeck(r.floor, rng);
  r.revealed = [];
  r.hp = Math.min(r.maxHp, r.hp + 1);
  return gained;
}
