import { beginFrame, createView, W } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { vibrate } from '../kit/haptics';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { dailySeed, mulberry32 } from '../kit/rng';
import { createSamples } from '../kit/samples';
import { unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { ACHIEVEMENTS, bump, loadMeta, saveMeta, unlock, type PMeta } from './achievements';
import type { Cosmetics } from './characters';
import { DOOR_X, DRYER, dryerPos, FLOOR_Y, POSTERS, render, slotW, slotX, STALL, URINAL_Y, type Scene } from './render';
import { addLatecomer, goodSlots, isCorrect, isMoveCorrect, judge, levelAt, makeRound, mirrorLooker, placeWanderer, solve, solveMove, TRAIT_INFO, type Answer, type Choice, type LevelConfig, type MoveAnswer, type Slot } from './rules';
import { themeAt, THEMES } from './themes';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(200);
const floats = new FloatText(12);
const shake = new Shake(8, 3);

const samples = createSamples('/audio/pissoir');
samples.preload(['step', 'zip', 'flush', 'good', 'bad', 'bad2', 'over', 'level', 'power', 'tick', 'door', 'applause', 'bells']);
const AMB: Record<string, string> = { Office: 'office', Pub: 'pub', 'Gas station': 'gas', Club: 'club', Stadium: 'stadium', Airport: 'airport', School: 'school', Festival: 'festival' };
const VOL: Record<string, { n: string; v: number }> = {
  step: { n: 'step', v: 0.5 }, good: { n: 'good', v: 0.8 }, level: { n: 'level', v: 0.8 }, over: { n: 'over', v: 0.8 }, power: { n: 'power', v: 0.7 },
  tick: { n: 'tick', v: 0.4 }, flush: { n: 'flush', v: 0.7 }, zip: { n: 'zip', v: 0.6 }, door: { n: 'door', v: 0.6 }, applause: { n: 'applause', v: 0.7 }, bells: { n: 'bells', v: 0.7 },
};
const sfx = { play(name: string, jitter = 0.04, vol = 1): void { const m = name === 'bad' ? { n: Math.random() < 0.5 ? 'bad' : 'bad2', v: 0.8 } : VOL[name]; if (m) samples.play(m.n, { vol: m.v * vol, jitter }); } };

let meta: PMeta = loadMeta();

// ---------- Perks (Shop, mit Punkten bezahlt) ----------
type Power = 'steel' | 'skip' | 'second';
const POWER_INFO: Record<Power, { name: string; desc: string; icon: string; price: number; hud: string }> = {
  steel: { name: 'Bladder of steel', desc: 'Twice the time for one level', icon: '🛡️', price: 120, hud: '2× time' },
  skip: { name: 'Fake phone call', desc: 'Skip one round. "Sorry, gotta take this."', icon: '📱', price: 90, hud: 'skip' },
  second: { name: 'Nobody saw that', desc: 'Remove one awkward moment', icon: '🙈', price: 160, hud: 'undo' },
};

// ---------- Meilensteine: Runden in einem Lauf, jede mit Belohnung ----------
const MILESTONES: { rounds: number; reward: string; cos: Partial<Cosmetics> }[] = [
  { rounds: 5, reward: 'A cap', cos: { hat: 'cap' } },
  { rounds: 10, reward: 'Round glasses', cos: { glasses: 'round' } },
  { rounds: 20, reward: 'Red shirt', cos: { shirt: '#e63946' } },
  { rounds: 35, reward: 'Shades', cos: { glasses: 'shades' } },
  { rounds: 50, reward: 'Fedora', cos: { hat: 'fedora' } },
  { rounds: 75, reward: 'Gold shirt', cos: { shirt: '#f2c94c' } },
  { rounds: 100, reward: 'The crown', cos: { hat: 'crown' } },
];

let rng = mulberry32(1);
let daily = false;
let levelIndex = 0;
let level: LevelConfig = levelAt(0);
let round = 0;
let slots: Slot[] = [];
let answer: Answer = { best: 0, waitIsBest: false, stallFree: false, scores: [] };
let moveAnswer: MoveAnswer | null = null;
let playerSlot = -1;
let bladder = 0, bladderMax = 7;
let score = 0, streak = 0, bestStreak = 0, strikes = 0, rounds = 0, awkward = 0, levelStrikes = 0;
let phase: 'idle' | 'choosing' | 'reacting' | 'moving' | 'mirror' | 'dryer' | 'levelup' | 'over' = 'idle';
let powers: Power[] = [];
let steelActive = false;
let tickAcc = 0;
const sc: Scene = { slots: [], playerX: DOOR_X + 40, playerTarget: null, playerT: 0, playerState: 'door', reactT: 0, reactKind: 'none', reactSlot: -1, bubble: null, hover: -1, t: 0, theme: themeAt(0), good: [], stallFree: false, showStall: false, late: null, mirror: null, dryer: null, moveMode: false, wanderer: null, cos: {}, posters: [] };

const startEl = $('start'), overEl = $('over'), levelEl = $('levelup'), mirrorBox = $('mirrorBox');
const hud = { score: $('score'), streak: $('streak'), strikes: $('strikes'), level: $('level'), bladder: $('bladder'), powers: $('powers') };
const waitBtn = $<HTMLButtonElement>('waitBtn'), stallBtn = $<HTMLButtonElement>('stallBtn');

function multiplier(): number { return 1 + Math.floor(streak / 3); }
function themeFor(i: number) { const cfg = levelAt(i); return THEMES.find((t) => t.name === cfg.place) ?? themeAt(i); }
function award(id: string): void { const a = unlock(meta, id); if (a) toastAch(a.icon, a.name); }
function count(counter: string, id: string, needed: number): void { const a = bump(meta, counter, id, needed); if (a) toastAch(a.icon, a.name); }
function toastAch(icon: string, name: string): void { const el = $('achToast'); el.textContent = `${icon} ${name}`; el.classList.add('show'); sfx.play('bells', 0.02, 0.6); setTimeout(() => el.classList.remove('show'), 2400); }
function cosmetics(): Cosmetics { const c: Cosmetics = {}; for (const m of MILESTONES) if (meta.milestones.includes(m.rounds) && meta.wear?.includes(m.rounds)) Object.assign(c, m.cos); return c; }

// ---------- Runden ----------
function startRound(): void {
  const r = makeRound(level, rng);
  slots = r.slots;
  moveAnswer = null; playerSlot = -1;
  sc.wanderer = null;
  if (level.boss === 'wanderer') { const to = placeWanderer(slots, rng); sc.wanderer = { from: 0, to, t: 0, settled: false }; }
  answer = solve(slots, level.waitAllowed, r.stallFree);
  sc.slots = slots; sc.stallFree = r.stallFree; sc.showStall = level.stalls;
  sc.playerX = DOOR_X + 40; sc.playerTarget = null; sc.playerT = 0; sc.playerState = 'door';
  sc.reactKind = 'none'; sc.reactT = 0; sc.bubble = null; sc.good = []; sc.late = null; sc.mirror = null; sc.moveMode = false;
  bladderMax = level.bladder * (steelActive ? 2 : 1);
  bladder = bladderMax;
  phase = 'choosing';
  waitBtn.hidden = !level.waitAllowed;
  stallBtn.hidden = !level.stalls;
  mirrorBox.hidden = true;
  sfx.play('door', 0.05, 0.5);
}

function makePosters(i: number, n: number): Scene['posters'] {
  const r = mulberry32(500 + i);
  const count = 2 + Math.floor(r() * 2);
  const used = new Set<number>();
  const out: Scene['posters'] = [];
  for (let k = 0; k < count; k++) {
    const slot = Math.floor(r() * n);
    if (used.has(slot)) continue;
    used.add(slot);
    out.push({ slot, text: POSTERS[Math.floor(r() * POSTERS.length)].text, color: POSTERS[Math.floor(r() * POSTERS.length)].color, rot: (r() - 0.5) * 0.12 });
  }
  return out;
}

function startLevel(i: number): void {
  levelIndex = i; level = levelAt(i); round = 0; steelActive = false; levelStrikes = 0;
  sc.theme = themeFor(i);
  sc.posters = makePosters(i, level.urinals);
  sc.cos = cosmetics();
  document.body.style.background = sc.theme.wall;
  samples.loop(`amb-${AMB[sc.theme.name] ?? 'office'}`, 0.9);
  hud.level.textContent = `L${i + 1} · ${level.name}`;
  $('lvPlace').textContent = `${level.time} · ${level.place}`;
  $('lvName').textContent = level.name;
  $('lvBoss').hidden = !level.boss;
  $('lvStory').textContent = level.story;
  $('lvIntro').textContent = level.intro;
  renderShop();
  phase = 'levelup';
  levelEl.hidden = false;
}

function renderShop(): void {
  const box = $('lvPowers');
  box.innerHTML = '';
  $('lvPick').textContent = levelIndex > 0 ? `Perk shop · you have ${score} points` : '';
  if (levelIndex === 0) return;
  for (const p of Object.keys(POWER_INFO) as Power[]) {
    const info = POWER_INFO[p];
    const b = document.createElement('button');
    b.className = 'secondary shop';
    const owned = powers.filter((x) => x === p).length;
    b.innerHTML = `<span class="ic">${info.icon}</span><span><b>${info.name}</b><small>${info.desc}</small></span><span class="price">${info.price}${owned ? ` · ×${owned}` : ''}</span>`;
    b.disabled = score < info.price || powers.length >= 4;
    b.addEventListener('click', () => { unlockAudio(); score -= info.price; powers.push(p); sfx.play('power'); syncPowers(); syncHud(); renderShop(); });
    box.appendChild(b);
  }
}

function syncPowers(): void {
  hud.powers.innerHTML = powers.map((p, k) => `<button data-k="${k}" class="pw">${POWER_INFO[p].icon}<small>${POWER_INFO[p].hud}</small></button>`).join('');
  hud.powers.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => usePower(Number(b.dataset.k))));
}

function usePower(k: number): void {
  if (phase !== 'choosing') return;
  const p = powers[k];
  powers.splice(k, 1);
  unlockAudio(); sfx.play('power'); vibrate(15);
  if (p === 'steel') { steelActive = true; bladderMax = level.bladder * 2; bladder = bladderMax; floats.add('BLADDER OF STEEL · 2× TIME', W / 2, 200, { color: '#5cf2a0', size: 20, life: 1.4 }); }
  if (p === 'skip') { floats.add('"Sorry, gotta take this"', W / 2, 200, { color: '#ffd23f', size: 18, life: 1.4 }); nextRound(false); }
  if (p === 'second') { strikes = Math.max(0, strikes - 1); floats.add('NOBODY SAW THAT · STRIKE REMOVED', W / 2, 200, { color: '#ffd23f', size: 18, life: 1.4 }); }
  syncPowers(); syncHud();
}

// ---------- Wahl ----------
function bubbleFor(choice: number): { x: number; y: number; text: string } | null {
  let speaker = -1;
  for (let j = 0; j < slots.length; j++) { const s = slots[j]; if (s.kind === 'taken' && j !== choice && Math.abs(j - choice) <= 2 && (speaker < 0 || Math.abs(j - choice) < Math.abs(speaker - choice))) speaker = j; }
  if (speaker >= 0) { const s = slots[speaker] as { who: { trait: keyof typeof TRAIT_INFO } }; return { x: slotX(slots.length, speaker), y: FLOOR_Y - 200, text: TRAIT_INFO[s.who.trait].line }; }
  if (slots[choice].kind === 'broken') return { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: 'That one is broken, genius.' };
  if (slots[choice].kind === 'wet') return { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: 'Your shoes. Look at your shoes.' };
  if (answer.waitIsBest) return { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: answer.stallFree ? 'There was a free stall.' : 'Should have waited.' };
  return null;
}

function explain(choice: number): string {
  const v = judge(slots, choice);
  if (answer.waitIsBest) return answer.stallFree ? 'Every spot was bad. The stall was free.' : 'Every spot was bad. Waiting was the move.';
  const good = goodSlots(answer);
  const wetGood = good.some((g) => slots[g].kind === 'wet');
  if (v.reasons[0]) return wetGood ? `${v.reasons[0]} Wet shoes beat that.` : v.reasons[0];
  return 'There was a better spot.';
}

function choose(choice: Choice): void {
  if (phase === 'moving') { chooseMove(choice); return; }
  if (phase !== 'choosing') return;
  if (sc.wanderer && !sc.wanderer.settled) { sc.wanderer.settled = true; sc.wanderer.t = 1; }
  const ok = isCorrect(answer, choice);
  phase = 'reacting';
  sc.reactT = 0;
  if (choice === 'wait' || choice === 'stall') {
    sc.playerState = 'waiting';
    sc.playerTarget = null;
    sc.reactKind = ok ? 'good' : 'bad';
    sc.reactSlot = -1;
    if (choice === 'stall') sc.playerX = STALL.x + STALL.w / 2;
    if (!ok) { sc.good = goodSlots(answer); sc.bubble = { x: sc.playerX, y: FLOOR_Y - 200, text: choice === 'stall' ? (answer.stallFree ? 'Nothing wrong with the urinals.' : "It's occupied. Read the sign.") : (answer.stallFree ? 'The stall is free. Just go.' : 'Why are you just standing there?') }; }
    if (ok) { if (choice === 'wait') count('waits', 'patient', 10); else count('stalls', 'stall', 5); }
    resolve(ok, ok ? '' : choice === 'stall' ? 'Wrong call on the stall.' : 'Nothing wrong with that spot, mate.');
    return;
  }
  if (choice === 'stay') return;
  sc.playerTarget = choice; sc.playerState = 'walking'; sc.playerT = 0; sc.reactKind = 'none';
  setTimeout(() => { if (phase === 'reacting') arrive(choice, ok); }, 620);
}

function arrive(choice: number, ok: boolean): void {
  sc.playerState = ok ? 'standing' : 'shame';
  sc.reactKind = ok ? 'good' : 'bad';
  sc.reactSlot = choice; sc.reactT = 0;
  playerSlot = choice;
  if (ok) {
    sfx.play('zip', 0.05, 0.5);
    const friendly = slots.some((s, j) => s.kind === 'taken' && s.who.trait === 'friend' && Math.abs(j - choice) === 1);
    if (friendly) { sc.bubble = { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: TRAIT_INFO.friend.line }; count('mates', 'mate', 5); }
    award('smooth');
  } else { sc.good = goodSlots(answer); sc.bubble = bubbleFor(choice); }
  resolve(ok, ok ? '' : explain(choice));
}

// ---------- Nachzügler ----------
function startLatecomer(): boolean {
  const me: Slot = { kind: 'taken', who: { trait: 'normal', shirt: '#3d7bd6', skin: '#f1c7a3', hair: '#5a3a22', hat: false, hairStyle: 'short', beard: false, glasses: false, build: 'normal', id: 0 } };
  const occupied: Slot[] = slots.map((s, i) => (i === playerSlot ? me : s));
  const at = addLatecomer(occupied, playerSlot, rng, level.traits);
  if (at < 0) return false;
  slots = occupied.map((s, i) => (i === playerSlot ? { kind: 'free' } : s));
  slots[at] = occupied[at];
  sc.slots = slots;
  sc.late = { slot: at, x: DOOR_X + 40, t: 0 };
  sc.bubble = null; sc.reactKind = 'none';
  phase = 'moving';
  moveAnswer = solveMove(slots, playerSlot);
  bladder = Math.max(bladder, bladderMax * 0.5);
  setTimeout(() => { if (phase === 'moving') { sc.moveMode = true; sc.late = null; floats.add('SOMEONE JUST WALKED IN', W / 2, 250, { color: '#ff5e5e', size: 18, life: 1.4 }); sfx.play('door', 0.05, 0.6); } }, 700);
  return true;
}

function chooseMove(choice: Choice): void {
  if (!moveAnswer || !sc.moveMode) return;
  const ok = isMoveCorrect(moveAnswer, choice);
  sc.moveMode = false;
  phase = 'reacting'; sc.reactT = 0;
  const goodMoves = moveAnswer.moveIsRight ? moveAnswer.scores.map((_, i) => i).filter((i) => isMoveCorrect(moveAnswer!, i)) : [];
  if (choice === 'stay' || typeof choice !== 'number') {
    sc.reactKind = ok ? 'good' : 'bad'; sc.reactSlot = playerSlot; sc.playerState = ok ? 'standing' : 'shame';
    if (!ok) { sc.good = goodMoves; sc.bubble = { x: slotX(slots.length, playerSlot), y: FLOOR_Y - 200, text: 'You could have just moved.' }; }
    if (ok) count('moves', 'mover', 5);
    resolve(ok, ok ? '' : 'There was a clean spot. Moving is fine.');
    return;
  }
  const from = playerSlot;
  sc.playerTarget = choice; sc.playerState = 'walking'; sc.playerT = 0;
  sc.playerX = slotX(slots.length, from);
  playerSlot = choice;
  setTimeout(() => {
    if (phase !== 'reacting') return;
    sc.playerState = ok ? 'standing' : 'shame'; sc.reactKind = ok ? 'good' : 'bad'; sc.reactSlot = choice; sc.reactT = 0;
    if (ok) { sfx.play('zip', 0.05, 0.5); count('moves', 'mover', 5); }
    else { sc.good = goodMoves; sc.bubble = { x: slotX(slots.length, from), y: FLOOR_Y - 200, text: moveAnswer!.moveIsRight ? 'Not there either.' : 'Hopping around is weirder than staying.' }; }
    resolve(ok, ok ? '' : moveAnswer!.moveIsRight ? 'Wrong spot to move to.' : 'Everything was bad. Staying was the move.');
  }, 620);
}

// ---------- Spiegel: schauen oder nicht ----------
function startMirror(): boolean {
  const m = mirrorLooker(slots, playerSlot, rng);
  if (!m) return false;
  sc.mirror = { t: 0, slot: m.slot, done: false, wantsNod: m.wantsNod, answered: null };
  sc.bubble = null;
  phase = 'mirror';
  $('mirrorLook').textContent = m.wantsNod ? '🙂 Nod back' : '👀 Look back';
  mirrorBox.hidden = false;
  return true;
}

function mirrorAnswer(choice: 'wall' | 'look'): void {
  if (!sc.mirror || sc.mirror.done) return;
  mirrorBox.hidden = true;
  const ok = sc.mirror.wantsNod ? choice === 'look' : choice === 'wall';
  sc.mirror.done = true; sc.mirror.answered = choice;
  phase = 'reacting'; sc.reactT = 0;
  sc.reactKind = ok ? 'good' : 'bad'; sc.reactSlot = playerSlot;
  const looker = slots[sc.mirror.slot];
  if (ok) { floats.add(sc.mirror.wantsNod ? 'BRO NOD' : 'ICE COLD', W / 2, 250, { color: '#5cf2a0', size: 22, life: 1.2 }); count('mirror', 'ice', 5); }
  else {
    sc.playerState = 'shame';
    const text = sc.mirror.wantsNod ? 'You just ignored your mate.' : looker.kind === 'taken' ? TRAIT_INFO[looker.who.trait].line : 'Eye contact. In the mirror. Wow.';
    sc.bubble = { x: slotX(slots.length, sc.mirror.slot), y: FLOOR_Y - 200, text };
  }
  resolve(ok, ok ? '' : sc.mirror.wantsNod ? 'A mate gets a nod. Always.' : 'Never look back in the mirror.');
}

// ---------- Handtrockner ----------
function startDryer(): void { phase = 'dryer'; sc.dryer = { t: 0, hit: null }; waitBtn.hidden = true; stallBtn.hidden = true; }
function dryerTap(): void {
  if (!sc.dryer || sc.dryer.hit !== null) return;
  const k = dryerPos(sc.dryer.t);
  sc.dryer.hit = k;
  const [a, b] = DRYER.zone;
  if (k >= a && k <= b) { score += 60; sfx.play('good'); count('dryer', 'dryer', 3); vibrate(20); floats.add('+60', W / 2, 200, { color: '#5cf2a0', size: 24 }); }
  else if (k >= a - 0.08 && k <= b + 0.08) { score += 20; sfx.play('power'); }
  else sfx.play('bad', 0.02, 0.5);
  syncHud();
  setTimeout(() => { sc.dryer = null; startLevel(levelIndex + 1); }, 1300);
}

// ---------- Auswertung ----------
function resolve(ok: boolean, reason: string): void {
  rounds++;
  if (ok) {
    streak++; bestStreak = Math.max(bestStreak, streak);
    if (streak >= 10) award('streak10');
    const boss = level.boss ? 2 : 1;
    const gained = (10 * multiplier() + Math.round((bladder / bladderMax) * 5)) * boss;
    score += gained;
    floats.add(`+${gained}`, W / 2, 300, { color: '#5cf2a0', size: 24 });
    if (streak > 0 && streak % 3 === 0) floats.add(`×${multiplier()}`, W / 2, 340, { color: '#ffd23f', size: 30, life: 1 });
    particles.emit({ x: sc.playerTarget === null ? sc.playerX : slotX(slots.length, sc.playerTarget), y: URINAL_Y + 60, count: 20, speed: 120, life: 0.5, color: '#5cf2a0', size: 3 });
    sfx.play('good', 0.03, 0.7 + Math.min(0.4, streak * 0.04));
    if (streak > 0 && streak % 5 === 0) sfx.play('applause', 0.02, 0.5);
    vibrate(12);
    for (const m of MILESTONES) if (rounds === m.rounds && !meta.milestones.includes(m.rounds)) {
      meta.milestones.push(m.rounds); meta.wear = [...(meta.wear ?? []), m.rounds]; saveMeta(meta);
      setTimeout(() => { floats.add(`MILESTONE ${m.rounds} ROUNDS · ${m.reward.toUpperCase()} UNLOCKED`, W / 2, 380, { color: '#ffd23f', size: 15, life: 2 }); sfx.play('bells'); sc.cos = cosmetics(); }, 500);
    }
  } else {
    streak = 0; strikes++; levelStrikes++; awkward++;
    shake.add(0.5); sfx.play('bad'); vibrate([40, 30, 60]);
    if (reason) floats.add(reason, W / 2, 300, { color: '#ff5e5e', size: 15, life: 2.2 });
  }
  syncHud();
  const wait = ok ? 1100 : 2000;
  setTimeout(() => {
    if (strikes >= 3) { gameOver(reason); return; }
    if (ok && sc.playerState === 'standing' && phase === 'reacting') {
      if (!moveAnswer && level.latecomer > 0 && rng() < level.latecomer && startLatecomer()) return;
      if (!sc.mirror && level.mirror && rng() < 0.35 && startMirror()) return;
    }
    nextRound(ok);
  }, wait);
}

function nextRound(ok: boolean): void {
  round++;
  if (ok && sc.playerState === 'standing') sfx.play('flush', 0.1, 0.5);
  if (round >= level.rounds) {
    sfx.play('level');
    if (levelIndex + 1 > meta.bestLevel) { meta.bestLevel = levelIndex + 1; saveMeta(meta); }
    if (level.name === 'The Boss' && levelStrikes === 0) award('noboss');
    if (level.boss) award(level.boss === 'giant' ? 'giant' : 'wanderer');
    if (level.name === 'Rush Hour') { award('rush'); award('day'); }
    startDryer();
  } else startRound();
}

function gameOver(reason: string): void {
  phase = 'over';
  mirrorBox.hidden = true;
  sfx.play('over');
  samples.stopLoop(1.5);
  meta.games++;
  if (score > meta.best) meta.best = score;
  if (daily) { const k = new Date().toISOString().slice(0, 10); meta.daily[k] = Math.max(meta.daily[k] ?? 0, rounds); award('daily'); }
  saveMeta(meta);
  $('finalScore').textContent = String(score);
  $('finalReason').textContent = reason || 'Three awkward moments. Everyone remembers.';
  $('finalStats').textContent = `${rounds} rounds · level ${levelIndex + 1} · best streak ${bestStreak}${daily ? ' · daily run' : ''}`;
  $('finalBest').textContent = score >= meta.best ? 'New record!' : `Record: ${meta.best}`;
  overEl.hidden = false;
  void loadBoard(score);
}

function startGame(isDaily: boolean): void {
  daily = isDaily;
  rng = mulberry32(isDaily ? dailySeed() : ((Date.now() >>> 0) || 1));
  score = 0; streak = 0; bestStreak = 0; strikes = 0; rounds = 0; awkward = 0; powers = [];
  startEl.hidden = true; overEl.hidden = true;
  syncPowers(); syncHud();
  startLevel(0);
}

function syncHud(): void {
  hud.score.textContent = String(score);
  hud.streak.textContent = streak >= 3 ? `×${multiplier()}` : '';
  hud.strikes.textContent = '●'.repeat(3 - strikes) + '○'.repeat(strikes);
}

// ---------- Highscore ----------
async function loadBoard(mine: number): Promise<void> {
  const box = $('board');
  box.hidden = true;
  try {
    const r = await fetch('/api/scores');
    if (!r.ok) return;
    const j = (await r.json()) as { enabled?: boolean; week: string; top: { name: string; score: number }[] };
    if (j.enabled === false) return;
    box.hidden = false;
    $('boardList').innerHTML = j.top.length ? j.top.map((e, i) => `<div class="row"><span>#${i + 1}</span><b>${e.name}</b><span>${e.score}</span></div>`).join('') : '<div class="row"><span>Nobody yet. Be the first.</span></div>';
    $('boardSubmit').hidden = !(mine > 0 && (j.top.length < 10 || mine > j.top[j.top.length - 1].score));
  } catch { /* kein Board */ }
}
$('boardBtn').addEventListener('click', async () => {
  const name = ($('boardName') as HTMLInputElement).value.trim() || 'anon';
  $('boardSubmit').hidden = true;
  try { await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, score }) }); } catch { /* egal */ }
  void loadBoard(0);
});

// ---------- Start-Screen, Meilensteine, Achievements ----------
function renderStart(): void {
  $('bestLine').textContent = meta.best > 0 ? `Record ${meta.best} · reached level ${meta.bestLevel}` : 'Nobody has gone yet.';
  const k = new Date().toISOString().slice(0, 10);
  $('dailyLine').textContent = meta.daily[k] ? `Today's daily: ${meta.daily[k]} rounds` : 'Same rooms for everyone today.';
  $('achs').innerHTML = ACHIEVEMENTS.map((a) => `<span class="ach ${meta.achievements.includes(a.id) ? 'on' : ''}" title="${a.name}: ${a.desc}">${a.icon}</span>`).join('');
  const box = $('msList');
  box.innerHTML = '';
  for (const m of MILESTONES) {
    const got = meta.milestones.includes(m.rounds);
    const worn = got && (meta.wear ?? []).includes(m.rounds);
    const row = document.createElement('button');
    row.className = `ms ${got ? 'on' : ''} ${worn ? 'worn' : ''}`;
    row.innerHTML = `<b>${m.rounds} rounds</b><span>${got ? m.reward : `Survive ${m.rounds} rounds in one run → ${m.reward}`}</span><em>${got ? (worn ? 'wearing' : 'tap to wear') : 'locked'}</em>`;
    row.disabled = !got;
    row.addEventListener('click', () => {
      const w = new Set(meta.wear ?? []);
      if (w.has(m.rounds)) w.delete(m.rounds); else { for (const o of MILESTONES) if (Object.keys(o.cos)[0] === Object.keys(m.cos)[0]) w.delete(o.rounds); w.add(m.rounds); }
      meta.wear = [...w]; saveMeta(meta); renderStart();
    });
    box.appendChild(row);
  }
  $('msHint').textContent = meta.milestones.length ? 'Tap an unlocked milestone to wear it. One hat, one pair of glasses, one shirt.' : 'Milestones are round counts in a single run. Each one unlocks something your guy can wear.';
}
$('msBtn').addEventListener('click', () => { const p = $('msPanel'); p.hidden = !p.hidden; });
$('achBtn').addEventListener('click', () => { const p = $('achPanel'); p.hidden = !p.hidden; $('achList').innerHTML = ACHIEVEMENTS.map((a) => `<div class="achrow ${meta.achievements.includes(a.id) ? 'on' : ''}"><span>${a.icon}</span><span><b>${a.name}</b><small>${a.desc}</small></span></div>`).join(''); });
$('shareBtn').addEventListener('click', async () => {
  const text = `PISSOIR${daily ? ' · daily' : ''} · ${rounds} rounds · level ${levelIndex + 1} · ${awkward} awkward moment${awkward === 1 ? '' : 's'} · score ${score}\n${'🚽'.repeat(Math.min(10, Math.floor(rounds / 3)))}${'😳'.repeat(awkward)}\n${location.origin}${location.pathname}`;
  try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); floats.add('Copied', W / 2, 300, { color: '#1a2a30', size: 18 }); } } catch { /* abgebrochen */ }
});

// ---------- Input ----------
bindPointer(view, {
  up(x, y) {
    unlockAudio();
    if (phase === 'dryer') { dryerTap(); return; }
    if (phase !== 'choosing' && phase !== 'moving') return;
    if (y < URINAL_Y - 90 || y > FLOOR_Y + 60) return;
    const n = slots.length;
    const w = slotW(n);
    for (let i = 0; i < n; i++) if (Math.abs(x - slotX(n, i)) < Math.max(w / 2 + 8, (W - 110) / n / 2)) { choose(phase === 'moving' && i === playerSlot ? 'stay' : i); return; }
  },
});
waitBtn.addEventListener('click', () => { unlockAudio(); choose('wait'); });
stallBtn.addEventListener('click', () => { unlockAudio(); choose('stall'); });
$('mirrorWall').addEventListener('click', () => { unlockAudio(); mirrorAnswer('wall'); });
$('mirrorLook').addEventListener('click', () => { unlockAudio(); mirrorAnswer('look'); });
$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(false); });
$('dailyBtn').addEventListener('click', () => { unlockAudio(); startGame(true); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(daily); });
$('menuBtn').addEventListener('click', () => { overEl.hidden = true; renderStart(); startEl.hidden = false; });
$('lvGo').addEventListener('click', () => { unlockAudio(); levelEl.hidden = true; startRound(); });
renderStart();
if (location.search.includes('debug')) {
  (window as unknown as { __pq: () => unknown }).__pq = () => ({ phase, good: phase === 'moving' && moveAnswer ? (moveAnswer.moveIsRight ? moveAnswer.scores.map((_, i) => i).filter((i) => isMoveCorrect(moveAnswer!, i)) : ['stay']) : goodSlots(answer), wait: answer.waitIsBest, stall: answer.stallFree, n: slots.length, mirror: sc.mirror && !sc.mirror.done ? (sc.mirror.wantsNod ? 'look' : 'wall') : null, dryer: !!sc.dryer, level: levelIndex, round, playerSlot, wanderer: !!sc.wanderer && !sc.wanderer.settled });
}

startLoop({
  update(dt) {
    sc.t += dt; sc.reactT += dt;
    if (sc.playerState === 'walking' && sc.playerTarget !== null) {
      sc.playerT = Math.min(1, sc.playerT + dt / 0.6);
      const tx = slotX(slots.length, sc.playerTarget);
      if (!moveAnswer) sc.playerX = DOOR_X + 40 + (tx - DOOR_X - 40) * (1 - Math.pow(1 - sc.playerT, 3));
      else sc.playerX += (tx - sc.playerX) * Math.min(1, dt * 7);
      tickAcc += dt; if (tickAcc > 0.22) { tickAcc = 0; sfx.play('step', 0.12, 0.5); }
    }
    if (sc.late) { sc.late.t = Math.min(1, sc.late.t + dt / 0.7); const tx = slotX(slots.length, sc.late.slot); sc.late.x = DOOR_X + 40 + (tx - DOOR_X - 40) * (1 - Math.pow(1 - sc.late.t, 3)); }
    if (sc.wanderer && !sc.wanderer.settled) { sc.wanderer.t = Math.min(1, sc.wanderer.t + dt / 2.4); if (sc.wanderer.t >= 1) { sc.wanderer.settled = true; sfx.play('zip', 0.05, 0.4); } }
    if (phase === 'mirror' && sc.mirror && !sc.mirror.done) { sc.mirror.t += dt; if (sc.mirror.t >= 3) mirrorAnswer('wall'); }
    if (sc.dryer && sc.dryer.hit === null) sc.dryer.t += dt;
    if (phase === 'choosing' || phase === 'moving') {
      if (!(sc.wanderer && !sc.wanderer.settled)) bladder -= dt;
      if (bladder < bladderMax * 0.3) { tickAcc += dt; if (tickAcc > 0.4) { tickAcc = 0; sfx.play('tick', 0.02, 0.5); } }
      if (bladder <= 0) { bladder = 0; sc.moveMode = false; phase = 'reacting'; sc.reactKind = 'bad'; sc.playerState = 'shame'; sc.reactT = 0; sc.bubble = { x: sc.playerX, y: FLOOR_Y - 200, text: 'Too late.' }; resolve(false, 'Too slow. Now everyone knows.'); }
    }
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, sc.theme.wall);
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, sc);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    const k = Math.max(0, bladder / bladderMax);
    hud.bladder.style.width = `${k * 100}%`;
    hud.bladder.style.background = k < 0.3 ? '#ff5e5e' : k < 0.6 ? '#ffd23f' : '#5cf2a0';
  },
});
