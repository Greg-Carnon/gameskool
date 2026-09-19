export type Trait = 'normal' | 'talker' | 'splasher' | 'boss' | 'kid' | 'phone' | 'friend';
export interface Person { trait: Trait; shirt: string; skin: string; hair: string; hat: boolean }
export type Slot = { kind: 'free' } | { kind: 'broken' } | { kind: 'wet' } | { kind: 'taken'; who: Person };

export interface LevelConfig {
  name: string;
  intro: string;
  rounds: number;
  urinals: number;
  occupants: [number, number];
  traits: Trait[];
  broken: number;
  wet: number;
  waitAllowed: boolean;
  bladder: number; // Sekunden pro Runde
}

export const LEVELS: LevelConfig[] = [
  { name: 'The Basics', intro: 'Keep your distance.', rounds: 4, urinals: 5, occupants: [1, 1], traits: ['normal'], broken: 0, wet: 0, waitAllowed: false, bladder: 7 },
  { name: 'Two Guys', intro: 'Two of them now. Find the gap.', rounds: 4, urinals: 5, occupants: [2, 2], traits: ['normal'], broken: 0, wet: 0, waitAllowed: false, bladder: 6.5 },
  { name: 'Out of Order', intro: 'Some are broken. Some are wet. Neither counts.', rounds: 4, urinals: 6, occupants: [1, 2], traits: ['normal'], broken: 1, wet: 1, waitAllowed: false, bladder: 6 },
  { name: 'The Talker', intro: 'He wants to chat. Stay far away.', rounds: 4, urinals: 6, occupants: [2, 2], traits: ['normal', 'talker'], broken: 1, wet: 0, waitAllowed: false, bladder: 5.5 },
  { name: 'Wait For It', intro: 'Sometimes every spot is bad. Then you wait.', rounds: 4, urinals: 5, occupants: [2, 3], traits: ['normal', 'talker', 'splasher'], broken: 1, wet: 0, waitAllowed: true, bladder: 5.5 },
  { name: 'The Friend', intro: 'Green shirt is your mate. He wants you next to him.', rounds: 4, urinals: 6, occupants: [2, 3], traits: ['normal', 'friend', 'talker'], broken: 0, wet: 1, waitAllowed: true, bladder: 5 },
  { name: 'The Boss', intro: 'Never next to the boss. Never next to the kid.', rounds: 5, urinals: 7, occupants: [2, 3], traits: ['normal', 'boss', 'kid', 'phone'], broken: 1, wet: 1, waitAllowed: true, bladder: 5 },
  { name: 'Rush Hour', intro: 'Everyone at once. Good luck.', rounds: 6, urinals: 7, occupants: [3, 4], traits: ['normal', 'talker', 'splasher', 'boss', 'kid', 'phone', 'friend'], broken: 1, wet: 1, waitAllowed: true, bladder: 4.2 },
];

export function levelAt(i: number): LevelConfig {
  if (i < LEVELS.length) return LEVELS[i];
  const base = LEVELS[LEVELS.length - 1];
  const k = i - LEVELS.length + 1;
  return { ...base, name: `Rush Hour ${k + 1}`, intro: 'Faster.', bladder: Math.max(2.6, base.bladder - k * 0.3), rounds: 6 };
}

export const TRAIT_INFO: Record<Trait, { label: string; adj: number; near: number; line: string }> = {
  normal: { label: 'a guy', adj: 10, near: 3, line: 'Dude. Really?' },
  talker: { label: 'the talker', adj: 18, near: 7, line: 'So... come here often?' },
  splasher: { label: 'the splasher', adj: 16, near: 4, line: '*splash*' },
  boss: { label: 'your boss', adj: 20, near: 6, line: 'We need to talk about your numbers.' },
  kid: { label: 'a kid', adj: 18, near: 5, line: 'Daaad? Who is that man?' },
  phone: { label: 'phone guy', adj: 13, near: 3, line: "Hold on, some weirdo's next to me." },
  friend: { label: 'your mate', adj: -6, near: 2, line: "Bro! Didn't see you!" },
};

export const WALL_BONUS = -2;
export const WET_PENALTY = 6;
export const WAIT_THRESHOLD = 12;

export interface Verdict { score: number; reasons: string[] }

/** Peinlichkeit eines Platzes. Unendlich für unbenutzbare. */
export function judge(slots: Slot[], i: number): Verdict {
  const s = slots[i];
  if (s.kind === 'broken') return { score: Infinity, reasons: ['Out of order.'] };
  if (s.kind === 'taken') return { score: Infinity, reasons: ['Already taken.'] };
  let score = 0;
  const reasons: string[] = [];
  for (let j = 0; j < slots.length; j++) {
    const o = slots[j];
    if (o.kind !== 'taken') continue;
    const d = Math.abs(i - j);
    const info = TRAIT_INFO[o.who.trait];
    if (d === 1) { score += info.adj; reasons.push(info.adj < 0 ? `Next to ${info.label}. He likes that.` : `Right next to ${info.label}.`); }
    else if (d === 2) { score += info.near; if (info.near >= 5) reasons.push(`Too close to ${info.label}.`); }
  }
  if (i === 0 || i === slots.length - 1) { score += WALL_BONUS; }
  if (s.kind === 'wet') { score += WET_PENALTY; reasons.push('Wet floor.'); }
  return { score, reasons };
}

export interface Answer { best: number; waitIsBest: boolean; scores: number[] }

export function solve(slots: Slot[], waitAllowed: boolean): Answer {
  const scores = slots.map((_, i) => judge(slots, i).score);
  let best = Infinity;
  for (const sc of scores) best = Math.min(best, sc);
  const waitIsBest = waitAllowed && best >= WAIT_THRESHOLD;
  return { best, waitIsBest, scores };
}

/** Ist der Tap richtig? Alle Plätze mit dem Minimalwert zählen. Warten nur, wenn alles schlecht ist. */
export function isCorrect(ans: Answer, choice: number | 'wait'): boolean {
  if (choice === 'wait') return ans.waitIsBest;
  if (ans.waitIsBest) return false;
  return ans.scores[choice] === ans.best && Number.isFinite(ans.best);
}

const SHIRTS = ['#e63946', '#457b9d', '#f4a261', '#8d99ae', '#6d597a', '#2a9d8f', '#e9c46a'];
const SKINS = ['#f1c7a3', '#d9a882', '#b87c5a', '#8d5a3b', '#f7d9c4'];
const HAIRS = ['#2a1e14', '#e8c25c', '#6b3e26', '#111111', '#9a9a9a'];

export function makePerson(trait: Trait, rng: () => number): Person {
  const shirt = trait === 'friend' ? '#5cf2a0' : trait === 'boss' ? '#1a1a2e' : trait === 'kid' ? '#ffd23f' : SHIRTS[Math.floor(rng() * SHIRTS.length)];
  return { trait, shirt, skin: SKINS[Math.floor(rng() * SKINS.length)], hair: HAIRS[Math.floor(rng() * HAIRS.length)], hat: trait === 'boss' || rng() < 0.2 };
}

/** Baut eine Runde. Stellt sicher, dass es eine eindeutige, lernbare Antwort gibt. */
export function makeRound(cfg: LevelConfig, rng: () => number): Slot[] {
  for (let attempt = 0; attempt < 60; attempt++) {
    const slots: Slot[] = Array.from({ length: cfg.urinals }, () => ({ kind: 'free' }));
    const idx = [...slots.keys()];
    const pick = () => idx.splice(Math.floor(rng() * idx.length), 1)[0];
    const n = cfg.occupants[0] + Math.floor(rng() * (cfg.occupants[1] - cfg.occupants[0] + 1));
    const traits = cfg.traits.slice();
    for (let k = 0; k < n && idx.length; k++) {
      let trait = traits[Math.floor(rng() * traits.length)];
      if (k === 0 && cfg.traits.length > 1 && rng() < 0.7) trait = cfg.traits[cfg.traits.length - 1 - Math.floor(rng() * Math.min(2, cfg.traits.length - 1))];
      slots[pick()] = { kind: 'taken', who: makePerson(trait, rng) };
    }
    for (let k = 0; k < cfg.broken && idx.length && rng() < 0.8; k++) slots[pick()] = { kind: 'broken' };
    for (let k = 0; k < cfg.wet && idx.length && rng() < 0.7; k++) slots[pick()] = { kind: 'wet' };
    const ans = solve(slots, cfg.waitAllowed);
    const winners = ans.scores.filter((s) => s === ans.best).length;
    if (!Number.isFinite(ans.best) && !cfg.waitAllowed) continue;
    if (!ans.waitIsBest && winners > 2) continue;
    if (!cfg.waitAllowed && ans.best >= WAIT_THRESHOLD) continue;
    return slots;
  }
  const slots: Slot[] = Array.from({ length: cfg.urinals }, () => ({ kind: 'free' }));
  slots[0] = { kind: 'taken', who: makePerson('normal', rng) };
  return slots;
}
