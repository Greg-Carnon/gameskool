import { fallTime, spawnComponent } from './components';
import { RULES } from './rules';
import type { Component, State } from './state';

export interface Events {
  onCorrect: (c: Component, combo: number) => void;
  onMistake: (c: Component, reason: string) => void;
  onGameOver: () => void;
}

export function multiplier(combo: number): number {
  return 1 + Math.floor(combo / RULES.score.comboStep);
}

export function levelName(score: number): string {
  let name = RULES.levels[0].name;
  for (const l of RULES.levels) if (score >= l.min) name = l.name;
  return name;
}

/** Slop erkennen zählt voll, sauberes durchlassen zählt wenig: Nichtstun darf sich nicht lohnen. */
function correct(s: State, c: Component, ev: Events): void {
  s.combo++;
  if (s.combo > s.bestCombo) s.bestCombo = s.combo;
  const base = c.phase === 'rejected' ? RULES.score.perReject : RULES.score.perAccept;
  s.score += base * multiplier(s.combo);
  ev.onCorrect(c, s.combo);
}

function mistake(s: State, c: Component, reason: string, ev: Events): void {
  s.combo = 0;
  s.strikes++;
  s.lastMistake = reason;
  ev.onMistake(c, reason);
  if (s.strikes >= RULES.strikes) {
    s.over = true;
    if (s.score > s.best) s.best = s.score;
    ev.onGameOver();
  }
}

/** Tap auf eine fallende Komponente: rauswerfen. Richtig bei Slop, falsch bei sauberem Design. */
export function tapAt(s: State, x: number, y: number, ev: Events): boolean {
  if (s.over) return false;
  const { x: fx, w } = RULES.field;
  if (x < fx || x > fx + w) return false;
  for (const c of s.components) {
    if (c.phase !== 'falling') continue;
    if (y >= c.y && y <= c.y + c.h) {
      c.phase = 'rejected';
      c.anim = 0;
      if (c.violationId) correct(s, c, ev);
      else mistake(s, c, 'That was clean design. Jack keeps the good stuff.', ev);
      return true;
    }
  }
  return false;
}

function accept(s: State, c: Component, ev: Events): void {
  const slop = c.violationId !== null;
  c.phase = 'accepted';
  c.anim = 0;
  s.built.push({ template: c.template, slop, h: c.h, component: c });
  if (s.built.length > 8) s.built.shift();
  if (slop) mistake(s, c, `That was slop: ${c.violationLabel}`, ev);
  else correct(s, c, ev);
}

export function update(s: State, dt: number, rng: () => number, ev: Events): void {
  if (s.over) return;
  s.t += dt;

  // Spawn: Abstand relativ zur aktuellen Fallzeit, damit die Dichte konstant bleibt
  s.spawnAcc += dt;
  const gap = RULES.fall.spawnGap * fallTime(s.t);
  if (s.spawnAcc >= gap) {
    s.spawnAcc = 0;
    s.components.push(spawnComponent(s.t, rng, s.nextId++));
  }

  for (const c of s.components) {
    if (c.phase !== 'falling') { c.anim += dt; continue; }
    c.y += c.speed * dt;
  }

  // Unten angekommen: eingebaut
  const arrived = s.components.filter((c) => c.phase === 'falling' && c.y + c.h >= RULES.field.acceptY);
  for (const c of arrived) {
    if (s.over) break;
    accept(s, c, ev);
  }
  s.components = s.components.filter((c) => c.phase === 'falling' || c.anim <= 0.5);
}
