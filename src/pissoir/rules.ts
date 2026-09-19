export type Trait = 'normal' | 'talker' | 'splasher' | 'boss' | 'kid' | 'phone' | 'friend' | 'singer' | 'dog' | 'duo' | 'ex' | 'giant' | 'wanderer';
export type HairStyle = 'short' | 'quiff' | 'bald' | 'curly' | 'long' | 'buzz';
export type Build = 'slim' | 'normal' | 'big';
export interface Person { trait: Trait; shirt: string; skin: string; hair: string; hat: boolean; hairStyle: HairStyle; beard: boolean; glasses: boolean; build: Build; id: number }
export type Slot = { kind: 'free' } | { kind: 'broken' } | { kind: 'wet' } | { kind: 'taken'; who: Person };
export type Choice = number | 'wait' | 'stall' | 'stay';

export interface LevelConfig {
  name: string;
  place: string;
  time: string;
  story: string;
  intro: string;
  rounds: number;
  urinals: number;
  occupants: [number, number];
  traits: Trait[];
  broken: number;
  wet: number;
  waitAllowed: boolean;
  stalls: boolean;
  latecomer: number;   // Wahrscheinlichkeit pro richtiger Runde
  mirror: boolean;     // Spiegel-Moment möglich
  bladder: number;
  boss?: 'giant' | 'wanderer';
}

export const LEVELS: LevelConfig[] = [
  { name: 'The Basics', place: 'Office', time: '07:40', story: 'Monday. Coffee number two hits early.', intro: 'Keep your distance.', rounds: 4, urinals: 5, occupants: [1, 1], traits: ['normal'], broken: 0, wet: 0, waitAllowed: false, stalls: false, latecomer: 0, mirror: false, bladder: 7 },
  { name: 'Two Guys', place: 'Office', time: '10:15', story: 'The whole floor drank the same coffee.', intro: 'Two of them now. Find the gap.', rounds: 4, urinals: 5, occupants: [2, 2], traits: ['normal'], broken: 0, wet: 0, waitAllowed: false, stalls: false, latecomer: 0, mirror: false, bladder: 6.5 },
  { name: 'Out of Order', place: 'Gas station', time: '12:30', story: 'Lunch run. The sign on the door says "clean". It lies.', intro: 'Broken is broken. Wet floor is a last resort.', rounds: 4, urinals: 6, occupants: [1, 2], traits: ['normal'], broken: 1, wet: 1, waitAllowed: false, stalls: false, latecomer: 0.25, mirror: false, bladder: 6 },
  { name: 'The Talker', place: 'School', time: '15:00', story: 'Parent evening. He teaches your kid. He wants to chat.', intro: 'He wants to chat. Stay far away. Never look in the mirror.', rounds: 4, urinals: 6, occupants: [2, 2], traits: ['normal', 'talker', 'ex'], broken: 1, wet: 0, waitAllowed: false, stalls: false, latecomer: 0.3, mirror: true, bladder: 5.5 },
  { name: 'Wait For It', place: 'Airport', time: '17:20', story: 'Gate closes in ten minutes. So does your patience.', intro: 'Sometimes every spot is bad. Then you wait. Wet shoes beat standing next to a guy.', rounds: 4, urinals: 5, occupants: [2, 3], traits: ['normal', 'talker', 'splasher', 'phone'], broken: 1, wet: 0, waitAllowed: true, stalls: false, latecomer: 0.3, mirror: true, bladder: 5.5 },
  { name: 'The Giant', place: 'Stadium', time: '18:05', story: 'He needs two. Nobody argues.', intro: 'BOSS. He takes two urinals. Stay far away from both.', rounds: 3, urinals: 7, occupants: [1, 2], traits: ['normal', 'talker'], broken: 0, wet: 0, waitAllowed: true, stalls: false, latecomer: 0, mirror: false, bladder: 5, boss: 'giant' },
  { name: 'The Friend', place: 'Pub', time: '20:45', story: 'Quiz night. Your mate is already three pints in.', intro: 'Green shirt is your mate. He wants you next to him. A free stall beats waiting.', rounds: 5, urinals: 6, occupants: [2, 3], traits: ['normal', 'friend', 'talker', 'singer'], broken: 0, wet: 1, waitAllowed: true, stalls: true, latecomer: 0.35, mirror: true, bladder: 5 },
  { name: 'The Wanderer', place: 'Pub', time: '21:30', story: 'He walks the row. He picks last.', intro: 'BOSS. He walks, then stops. Wait for him. Then pick.', rounds: 3, urinals: 7, occupants: [1, 2], traits: ['normal', 'splasher'], broken: 1, wet: 0, waitAllowed: true, stalls: true, latecomer: 0, mirror: false, bladder: 6, boss: 'wanderer' },
  { name: 'The Boss', place: 'Club', time: '23:30', story: 'Company party. Your boss dances. Your boss also pees.', intro: 'Never next to the boss. Never next to the kid. Two mates together: give them room.', rounds: 5, urinals: 7, occupants: [2, 3], traits: ['normal', 'boss', 'kid', 'phone', 'duo', 'dog'], broken: 1, wet: 1, waitAllowed: true, stalls: true, latecomer: 0.4, mirror: true, bladder: 5 },
  { name: 'Rush Hour', place: 'Stadium', time: 'Half-time', story: 'Forty thousand people. One idea.', intro: 'Everyone at once. Good luck.', rounds: 6, urinals: 7, occupants: [3, 4], traits: ['normal', 'talker', 'splasher', 'boss', 'kid', 'phone', 'friend', 'singer', 'dog', 'duo', 'ex'], broken: 1, wet: 1, waitAllowed: true, stalls: true, latecomer: 0.45, mirror: true, bladder: 4.2 },
];

export function levelAt(i: number): LevelConfig {
  if (i < LEVELS.length) return LEVELS[i];
  const base = LEVELS[LEVELS.length - 1];
  const k = i - LEVELS.length + 1;
  const places = ['Festival', 'Office', 'Pub', 'Club', 'Gas station', 'Airport', 'School', 'Stadium'];
  return { ...base, name: `Day ${k + 1}`, place: places[k % places.length], time: 'Again', story: 'It never ends.', intro: 'Faster.', bladder: Math.max(2.6, base.bladder - k * 0.3), rounds: 6 };
}

export const TRAIT_INFO: Record<Trait, { label: string; adj: number; near: number; line: string }> = {
  normal: { label: 'a guy', adj: 10, near: 3, line: 'Dude. Really?' },
  talker: { label: 'the talker', adj: 18, near: 7, line: 'So... come here often?' },
  splasher: { label: 'the splasher', adj: 16, near: 4, line: '*splash*' },
  boss: { label: 'your boss', adj: 20, near: 6, line: 'We need to talk about your numbers.' },
  kid: { label: 'a kid', adj: 18, near: 5, line: 'Daaad? Who is that man?' },
  phone: { label: 'phone guy', adj: 13, near: 3, line: "Hold on, some weirdo's next to me." },
  friend: { label: 'your mate', adj: -6, near: 2, line: "Bro! Didn't see you!" },
  singer: { label: 'the singer', adj: 15, near: 6, line: '...ooooh baby baby... you like this song?' },
  dog: { label: 'the dog guy', adj: 14, near: 6, line: 'He just wants to say hi.' },
  duo: { label: 'the two mates', adj: 14, near: 4, line: 'We were talking, mate.' },
  ex: { label: 'your ex-colleague', adj: 16, near: 8, line: "Wait. Didn't you get fired?" },
  giant: { label: 'the giant', adj: 25, near: 8, line: '*sigh*' },
  wanderer: { label: 'the wanderer', adj: 12, near: 4, line: 'Changed my mind.' },
};

export const WALL_BONUS = -2;
export const WET_PENALTY = 6;
export const WAIT_THRESHOLD = 8;
export const TOLERANCE = 5;

export interface Verdict { score: number; reasons: string[] }

/** Peinlichkeit eines Platzes. `ignore` blendet einen Platz aus (der Spieler selbst beim Wechseln). */
export function judge(slots: Slot[], i: number, ignore = -1): Verdict {
  const s = slots[i];
  if (s.kind === 'broken') return { score: Infinity, reasons: ['Out of order.'] };
  if (s.kind === 'taken' && i !== ignore) return { score: Infinity, reasons: ['Already taken.'] };
  let score = 0;
  const reasons: string[] = [];
  const counted = new Set<number>();
  for (let j = 0; j < slots.length; j++) {
    const o = slots[j];
    if (o.kind !== 'taken' || j === ignore || j === i) continue;
    const d = Math.abs(i - j);
    if (counted.has(o.who.id) && d >= 2) continue;
    counted.add(o.who.id);
    const info = TRAIT_INFO[o.who.trait];
    if (d === 1) { score += info.adj; reasons.push(info.adj < 0 ? `Next to ${info.label}. He likes that.` : `Right next to ${info.label}.`); }
    else if (d === 2) { score += info.near; if (info.near >= 5) reasons.push(`Too close to ${info.label}.`); }
  }
  if (i === 0 || i === slots.length - 1) score += WALL_BONUS;
  if (s.kind === 'wet') { score += WET_PENALTY; reasons.push('Wet floor.'); }
  return { score, reasons };
}

export interface Answer { best: number; waitIsBest: boolean; stallFree: boolean; scores: number[] }

export function solve(slots: Slot[], waitAllowed: boolean, stallFree = false): Answer {
  const scores = slots.map((_, i) => judge(slots, i).score);
  let best = Infinity;
  for (const sc of scores) best = Math.min(best, sc);
  const waitIsBest = waitAllowed && best >= WAIT_THRESHOLD;
  return { best, waitIsBest, stallFree, scores };
}

/** Richtig: bester Platz plus Toleranz. Wenn alles schlecht ist: freie Kabine, sonst warten. */
export function isCorrect(ans: Answer, choice: Choice): boolean {
  if (choice === 'stay') return false;
  if (choice === 'wait') return ans.waitIsBest && !ans.stallFree;
  if (choice === 'stall') return ans.waitIsBest && ans.stallFree;
  if (ans.waitIsBest) return false;
  const sc = ans.scores[choice];
  return Number.isFinite(ans.best) && Number.isFinite(sc) && sc <= ans.best + TOLERANCE && sc < WAIT_THRESHOLD;
}

export function goodSlots(ans: Answer): number[] {
  if (ans.waitIsBest) return [];
  return ans.scores.map((_, i) => i).filter((i) => isCorrect(ans, i));
}

/** Nachzügler: jemand stellt sich neben den Spieler. Gibt den Platz zurück oder -1. */
export function addLatecomer(slots: Slot[], playerSlot: number, rng: () => number, traits: Trait[]): number {
  const cand = [playerSlot - 1, playerSlot + 1].filter((i) => i >= 0 && i < slots.length && slots[i].kind === 'free');
  if (!cand.length) return -1;
  const i = cand[Math.floor(rng() * cand.length)];
  const pool = traits.filter((t) => t !== 'friend' && t !== 'duo');
  slots[i] = { kind: 'taken', who: makePerson(pool[Math.floor(rng() * pool.length)] ?? 'normal', rng) };
  return i;
}

export interface MoveAnswer { stayScore: number; scores: number[]; best: number; moveIsRight: boolean }

/** Nach dem Nachzügler: wechseln oder bleiben? Wechseln ist richtig, wenn es einen sauberen Platz gibt. */
export function solveMove(slots: Slot[], playerSlot: number): MoveAnswer {
  const stayScore = judge(slots, playerSlot, playerSlot).score;
  const scores = slots.map((s, i) => (i === playerSlot || s.kind !== 'free' && s.kind !== 'wet' ? Infinity : judge(slots, i, playerSlot).score));
  let best = Infinity;
  for (const sc of scores) best = Math.min(best, sc);
  return { stayScore, scores, best, moveIsRight: best < WAIT_THRESHOLD };
}

export function isMoveCorrect(m: MoveAnswer, choice: Choice): boolean {
  if (choice === 'stay') return !m.moveIsRight;
  if (typeof choice !== 'number') return false;
  return m.moveIsRight && Number.isFinite(m.scores[choice]) && m.scores[choice] <= m.best + TOLERANCE && m.scores[choice] < WAIT_THRESHOLD;
}

const SHIRTS = ['#e63946', '#457b9d', '#f4a261', '#8d99ae', '#6d597a', '#2a9d8f', '#e9c46a'];
const SKINS = ['#f1c7a3', '#d9a882', '#b87c5a', '#8d5a3b', '#f7d9c4'];
const HAIRS = ['#2a1e14', '#e8c25c', '#6b3e26', '#111111', '#9a9a9a'];

let personId = 1;
const STYLES: HairStyle[] = ['short', 'quiff', 'bald', 'curly', 'long', 'buzz'];
export function makePerson(trait: Trait, rng: () => number): Person {
  const shirt = trait === 'friend' ? '#5cf2a0' : trait === 'boss' ? '#1a1a2e' : trait === 'kid' ? '#ffd23f' : trait === 'singer' ? '#c026d3' : trait === 'duo' ? '#ff8c42' : trait === 'ex' ? '#7c8ea0' : trait === 'giant' ? '#3b4a3a' : trait === 'wanderer' ? '#b56576' : SHIRTS[Math.floor(rng() * SHIRTS.length)];
  const hairStyle = trait === 'kid' ? 'buzz' : trait === 'singer' ? 'quiff' : trait === 'giant' ? 'bald' : STYLES[Math.floor(rng() * STYLES.length)];
  const build: Build = trait === 'giant' ? 'big' : trait === 'kid' ? 'slim' : rng() < 0.25 ? 'big' : rng() < 0.5 ? 'slim' : 'normal';
  return { trait, shirt, skin: SKINS[Math.floor(rng() * SKINS.length)], hair: HAIRS[Math.floor(rng() * HAIRS.length)], hat: trait === 'boss' || (trait !== 'kid' && trait !== 'singer' && rng() < 0.18), hairStyle, beard: trait !== 'kid' && rng() < 0.3, glasses: trait === 'singer' || (trait !== 'kid' && rng() < 0.2), build, id: personId++ };
}

export interface Round { slots: Slot[]; stallFree: boolean }

/** Wanderer: läuft die Reihe ab und bleibt an einem freien Platz stehen. Gibt den Zielplatz zurück. */
export function placeWanderer(slots: Slot[], rng: () => number): number {
  const free = slots.map((s, i) => (s.kind === 'free' ? i : -1)).filter((i) => i >= 0);
  const i = free[Math.floor(rng() * free.length)];
  slots[i] = { kind: 'taken', who: makePerson('wanderer', rng) };
  return i;
}

/** Spiegel: wer schaut? Kumpel will ein Nicken, alle anderen wollen die Wand. */
export function mirrorLooker(slots: Slot[], playerSlot: number, rng: () => number): { slot: number; wantsNod: boolean } | null {
  const near = slots.map((s, i) => (s.kind === 'taken' && i !== playerSlot && Math.abs(i - playerSlot) <= 3 && ['talker', 'ex', 'boss', 'friend', 'singer'].includes(s.who.trait) ? i : -1)).filter((i) => i >= 0);
  if (!near.length) return null;
  const slot = near[Math.floor(rng() * near.length)];
  const who = slots[slot] as { who: Person };
  return { slot, wantsNod: who.who.trait === 'friend' };
}

/** Baut eine Runde mit garantierter Antwort: sauberer Platz, oder Warten oder Kabine eindeutig. */
export function makeRound(cfg: LevelConfig, rng: () => number): Round {
  for (let attempt = 0; attempt < 80; attempt++) {
    const slots: Slot[] = Array.from({ length: cfg.urinals }, () => ({ kind: 'free' }));
    const idx = [...slots.keys()];
    const pick = () => idx.splice(Math.floor(rng() * idx.length), 1)[0];
    const n = cfg.occupants[0] + Math.floor(rng() * (cfg.occupants[1] - cfg.occupants[0] + 1));
    if (cfg.boss === 'giant') {
      const pairs = idx.filter((i) => idx.includes(i + 1));
      const a = pairs[Math.floor(rng() * pairs.length)];
      idx.splice(idx.indexOf(a), 1); idx.splice(idx.indexOf(a + 1), 1);
      const g = makePerson('giant', rng);
      slots[a] = { kind: 'taken', who: g }; slots[a + 1] = { kind: 'taken', who: g };
    }
    for (let k = 0; k < n && idx.length; k++) {
      let trait = cfg.traits[Math.floor(rng() * cfg.traits.length)];
      if (k === 0 && cfg.traits.length > 1 && rng() < 0.7) trait = cfg.traits[cfg.traits.length - 1 - Math.floor(rng() * Math.min(3, cfg.traits.length - 1))];
      if (trait === 'duo') {
        const pairs = idx.filter((i) => idx.includes(i + 1));
        if (!pairs.length) { trait = 'normal'; }
        else {
          const a = pairs[Math.floor(rng() * pairs.length)];
          idx.splice(idx.indexOf(a), 1); idx.splice(idx.indexOf(a + 1), 1);
          slots[a] = { kind: 'taken', who: makePerson('duo', rng) };
          slots[a + 1] = { kind: 'taken', who: makePerson('duo', rng) };
          continue;
        }
      }
      slots[pick()] = { kind: 'taken', who: makePerson(trait, rng) };
    }
    for (let k = 0; k < cfg.broken && idx.length && rng() < 0.8; k++) slots[pick()] = { kind: 'broken' };
    for (let k = 0; k < cfg.wet && idx.length && rng() < 0.7; k++) slots[pick()] = { kind: 'wet' };
    const stallFree = cfg.stalls && rng() < 0.5;
    const ans = solve(slots, cfg.waitAllowed, stallFree);
    if (!Number.isFinite(ans.best)) continue;
    if (!cfg.waitAllowed && ans.best >= WAIT_THRESHOLD) continue;
    const good = goodSlots(ans);
    if (!ans.waitIsBest && (good.length === 0 || good.length > 3)) continue;
    if (!cfg.waitAllowed && !good.some((i) => slots[i].kind === 'free')) continue; // früh: immer ein trockener richtiger Platz
    return { slots, stallFree };
  }
  const slots: Slot[] = Array.from({ length: cfg.urinals }, () => ({ kind: 'free' }));
  slots[0] = { kind: 'taken', who: makePerson('normal', rng) };
  return { slots, stallFree: false };
}
