import { beginFrame, createView, W } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { vibrate } from '../kit/haptics';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { DOOR_X, FLOOR_Y, render, slotW, slotX, URINAL_Y, type Scene } from './render';
import { isCorrect, judge, levelAt, makeRound, solve, TRAIT_INFO, type Answer, type LevelConfig, type Slot } from './rules';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(200);
const floats = new FloatText(12);
const shake = new Shake(8, 3);
const sfx = createSfx({
  step: [0.3, 0.05, 180, 0.005, 0.01, 0.05, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.01],
  good: [0.6, 0.02, 700, 0.01, 0.05, 0.15, 0, 1.4, 0, 0, 300, 0.06, 0, 0, 0, 0, 0, 0.8, 0.02],
  bad: [0.9, 0.05, 160, 0.02, 0.15, 0.35, 2, 0.8, -6, 0, 0, 0, 0, 0.4, 0, 0.2, 0, 0.7, 0.05],
  level: [0.7, 0.02, 500, 0.02, 0.2, 0.5, 0, 1.3, 0, 0, 250, 0.2, 0, 0, 0, 0, 0, 0.7, 0.05],
  over: [1.2, 0.1, 110, 0.05, 0.4, 0.8, 2, 1.0, -6, 0, 0, 0, 0, 0.5, 0, 0.3, 0, 0.6, 0.1],
  power: [0.6, 0.02, 900, 0.01, 0.1, 0.3, 0, 1.5, 0, 0, 400, 0.1, 0, 0, 0, 0, 0, 0.7, 0.03],
  tick: [0.3, 0, 1200, 0.005, 0.01, 0.03, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01],
  flush: [0.8, 0.1, 200, 0.05, 0.3, 0.6, 4, 0.5, 0, 0, 0, 0, 0, 1.5, 0, 0.4, 0, 0.5, 0.1],
});

interface Meta { best: number; bestLevel: number; games: number; milestones: number[] }
const META_KEY = 'pissoir-meta';
let meta = load<Meta>(META_KEY, { best: 0, bestLevel: 0, games: 0, milestones: [] });

type Power = 'steel' | 'skip' | 'second';
const POWER_INFO: Record<Power, { name: string; desc: string; icon: string }> = {
  steel: { name: 'Bladder of steel', desc: 'Double time this level', icon: '🛡️' },
  skip: { name: 'Fake phone call', desc: 'Skip one round', icon: '📱' },
  second: { name: 'Nobody saw that', desc: 'Remove one strike', icon: '🙈' },
};
const MILESTONES = [5, 10, 20, 35, 50, 75, 100];

let rng = mulberry32(1);
let levelIndex = 0;
let level: LevelConfig = levelAt(0);
let round = 0;
let slots: Slot[] = [];
let answer: Answer = { best: 0, waitIsBest: false, scores: [] };
let bladder = 0;
let bladderMax = 7;
let score = 0;
let streak = 0;
let bestStreak = 0;
let strikes = 0;
let rounds = 0;
let phase: 'idle' | 'choosing' | 'reacting' | 'levelup' | 'over' = 'idle';
let powers: Power[] = [];
let steelActive = false;
let tickAcc = 0;
const sc: Scene = { slots: [], playerX: DOOR_X + 40, playerTarget: null, playerT: 0, playerState: 'door', reactT: 0, reactKind: 'none', reactSlot: -1, bubble: null, hover: -1, t: 0 };

const startEl = $('start'), overEl = $('over'), levelEl = $('levelup'), hud = { score: $('score'), streak: $('streak'), strikes: $('strikes'), level: $('level'), bladder: $('bladder'), powers: $('powers') };
const waitBtn = $<HTMLButtonElement>('waitBtn');

function multiplier(): number { return 1 + Math.floor(streak / 3); }

function startRound(): void {
  slots = makeRound(level, rng);
  answer = solve(slots, level.waitAllowed);
  sc.slots = slots;
  sc.playerX = DOOR_X + 40; sc.playerTarget = null; sc.playerT = 0; sc.playerState = 'door';
  sc.reactKind = 'none'; sc.reactT = 0; sc.bubble = null;
  bladderMax = level.bladder * (steelActive ? 2 : 1);
  bladder = bladderMax;
  phase = 'choosing';
  waitBtn.hidden = !level.waitAllowed;
}

function startLevel(i: number): void {
  levelIndex = i; level = levelAt(i); round = 0; steelActive = false;
  hud.level.textContent = `L${i + 1} · ${level.name}`;
  $('lvName').textContent = level.name;
  $('lvIntro').textContent = level.intro;
  const offer = (['steel', 'skip', 'second'] as Power[]).filter(() => true).sort(() => rng() - 0.5).slice(0, 2);
  const box = $('lvPowers');
  box.innerHTML = '';
  if (i > 0) {
    for (const p of offer) {
      const b = document.createElement('button');
      b.className = 'secondary';
      b.innerHTML = `${POWER_INFO[p].icon} <b>${POWER_INFO[p].name}</b><small>${POWER_INFO[p].desc}</small>`;
      b.addEventListener('click', () => { unlockAudio(); powers.push(p); sfx.play('power'); levelEl.hidden = true; syncPowers(); startRound(); });
      box.appendChild(b);
    }
  }
  $('lvGo').hidden = i > 0;
  phase = 'levelup';
  levelEl.hidden = false;
}

function syncPowers(): void {
  hud.powers.innerHTML = powers.map((p, k) => `<button data-k="${k}" class="pw">${POWER_INFO[p].icon}</button>`).join('');
  hud.powers.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => usePower(Number(b.dataset.k))));
}

function usePower(k: number): void {
  if (phase !== 'choosing') return;
  const p = powers[k];
  powers.splice(k, 1);
  unlockAudio(); sfx.play('power'); vibrate(15);
  if (p === 'steel') { steelActive = true; bladderMax = level.bladder * 2; bladder = bladderMax; floats.add('BLADDER OF STEEL', W / 2, 200, { color: '#5cf2a0', size: 20, life: 1.2 }); }
  if (p === 'skip') { floats.add('"Sorry, gotta take this"', W / 2, 200, { color: '#ffd23f', size: 18, life: 1.2 }); nextRound(false); }
  if (p === 'second') { strikes = Math.max(0, strikes - 1); floats.add('NOBODY SAW THAT', W / 2, 200, { color: '#ffd23f', size: 20, life: 1.2 }); }
  syncPowers();
}

function choose(choice: number | 'wait'): void {
  if (phase !== 'choosing') return;
  const ok = isCorrect(answer, choice);
  phase = 'reacting';
  sc.reactT = 0;
  if (choice === 'wait') {
    sc.playerState = 'waiting';
    sc.playerTarget = null;
    sc.reactKind = ok ? 'good' : 'bad';
    sc.reactSlot = -1;
    if (!ok) sc.bubble = { x: DOOR_X + 40, y: FLOOR_Y - 200, text: 'Why are you just standing there?' };
    resolve(ok, ok ? 'Smart. Waited it out.' : 'Nothing wrong with that spot, mate.');
    return;
  }
  sc.playerTarget = choice;
  sc.playerState = 'walking';
  sc.playerT = 0;
  sc.reactKind = 'none';
  setTimeout(() => {
    if (phase !== 'reacting') return;
    sc.playerState = ok ? 'standing' : 'shame';
    sc.reactKind = ok ? 'good' : 'bad';
    sc.reactSlot = choice;
    sc.reactT = 0;
    const v = judge(slots, choice);
    if (!ok) {
      let speaker = -1;
      for (let j = 0; j < slots.length; j++) { const s = slots[j]; if (s.kind === 'taken' && Math.abs(j - choice) <= 2 && (speaker < 0 || Math.abs(j - choice) < Math.abs(speaker - choice))) speaker = j; }
      if (speaker >= 0) { const s = slots[speaker] as { who: { trait: keyof typeof TRAIT_INFO } }; sc.bubble = { x: slotX(slots.length, speaker), y: FLOOR_Y - 200, text: TRAIT_INFO[s.who.trait].line }; }
      else if (slots[choice].kind === 'broken') sc.bubble = { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: 'That one is broken, genius.' };
      else if (slots[choice].kind === 'wet') sc.bubble = { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: 'Your shoes. Look at your shoes.' };
      else if (answer.waitIsBest) sc.bubble = { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: 'Should have waited.' };
    } else {
      const friendly = slots.some((s, j) => s.kind === 'taken' && s.who.trait === 'friend' && Math.abs(j - choice) === 1);
      if (friendly) sc.bubble = { x: slotX(slots.length, choice), y: FLOOR_Y - 200, text: TRAIT_INFO.friend.line };
    }
    resolve(ok, ok ? '' : v.reasons[0] ?? (answer.waitIsBest ? 'Every spot was bad. Waiting was the move.' : 'There was a better spot.'));
  }, 620);
}

function resolve(ok: boolean, reason: string): void {
  rounds++;
  if (ok) {
    streak++; bestStreak = Math.max(bestStreak, streak);
    const gained = 10 * multiplier() + Math.round((bladder / bladderMax) * 5);
    score += gained;
    floats.add(`+${gained}`, W / 2, 300, { color: '#5cf2a0', size: 24 });
    if (streak > 0 && streak % 3 === 0) floats.add(`×${multiplier()}`, W / 2, 340, { color: '#ffd23f', size: 30, life: 1 });
    particles.emit({ x: sc.playerTarget === null ? DOOR_X + 40 : slotX(slots.length, sc.playerTarget), y: URINAL_Y + 60, count: 20, speed: 120, life: 0.5, color: '#5cf2a0', size: 3 });
    sfx.play('good', 0.05, 0.7 + Math.min(0.5, streak * 0.05));
    vibrate(12);
    for (const m of MILESTONES) if (rounds === m && !meta.milestones.includes(m)) { meta.milestones.push(m); save(META_KEY, meta); setTimeout(() => { floats.add(`${m} ROUNDS · MILESTONE`, W / 2, 380, { color: '#ffd23f', size: 18, life: 1.6 }); sfx.play('level'); }, 500); }
  } else {
    streak = 0;
    strikes++;
    shake.add(0.5);
    sfx.play('bad');
    vibrate([40, 30, 60]);
    if (reason) floats.add(reason, W / 2, 300, { color: '#ff5e5e', size: 15, life: 2 });
  }
  syncHud();
  const wait = ok ? 1100 : 1900;
  setTimeout(() => {
    if (strikes >= 3) { gameOver(reason); return; }
    nextRound(ok);
  }, wait);
}

function nextRound(ok: boolean): void {
  round++;
  if (ok && sc.playerState === 'standing') sfx.play('flush', 0.1, 0.5);
  if (round >= level.rounds) {
    sfx.play('level');
    if (levelIndex + 1 > meta.bestLevel) { meta.bestLevel = levelIndex + 1; save(META_KEY, meta); }
    startLevel(levelIndex + 1);
  } else startRound();
}

function gameOver(reason: string): void {
  phase = 'over';
  sfx.play('over');
  meta.games++;
  if (score > meta.best) meta.best = score;
  save(META_KEY, meta);
  $('finalScore').textContent = String(score);
  $('finalReason').textContent = reason || 'Three awkward moments. Everyone remembers.';
  $('finalStats').textContent = `${rounds} rounds · level ${levelIndex + 1} · best streak ${bestStreak}`;
  $('finalBest').textContent = score >= meta.best ? 'New record!' : `Record: ${meta.best}`;
  overEl.hidden = false;
}

function startGame(): void {
  rng = mulberry32((Date.now() >>> 0) || 1);
  score = 0; streak = 0; bestStreak = 0; strikes = 0; rounds = 0; powers = [];
  startEl.hidden = true; overEl.hidden = true;
  syncPowers();
  syncHud();
  startLevel(0);
}

function syncHud(): void {
  hud.score.textContent = String(score);
  hud.streak.textContent = streak >= 3 ? `×${multiplier()}` : '';
  hud.strikes.textContent = '●'.repeat(3 - strikes) + '○'.repeat(strikes);
}

bindPointer(view, {
  up(x, y) {
    unlockAudio();
    if (phase !== 'choosing') return;
    if (y < URINAL_Y - 90 || y > FLOOR_Y + 60) return;
    const n = slots.length;
    const w = slotW(n);
    for (let i = 0; i < n; i++) if (Math.abs(x - slotX(n, i)) < Math.max(w / 2 + 8, (W - 48) / n / 2)) { choose(i); return; }
  },
});
waitBtn.addEventListener('click', () => { unlockAudio(); choose('wait'); });
$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('lvGo').addEventListener('click', () => { unlockAudio(); levelEl.hidden = true; startRound(); });
$('bestLine').textContent = meta.best > 0 ? `Record ${meta.best} · reached level ${meta.bestLevel}` : 'Nobody has gone yet.';

startLoop({
  update(dt) {
    sc.t += dt;
    sc.reactT += dt;
    if (sc.playerState === 'walking' && sc.playerTarget !== null) {
      sc.playerT = Math.min(1, sc.playerT + dt / 0.6);
      const tx = slotX(slots.length, sc.playerTarget);
      sc.playerX = DOOR_X + 40 + (tx - DOOR_X - 40) * (1 - Math.pow(1 - sc.playerT, 3));
      tickAcc += dt; if (tickAcc > 0.15) { tickAcc = 0; sfx.play('step', 0.2, 0.4); }
    }
    if (phase === 'choosing') {
      bladder -= dt;
      if (bladder < bladderMax * 0.3) { tickAcc += dt; if (tickAcc > 0.25) { tickAcc = 0; sfx.play('tick', 0.02, 0.4); } }
      if (bladder <= 0) { bladder = 0; phase = 'reacting'; sc.reactKind = 'bad'; sc.playerState = 'shame'; sc.reactT = 0; sc.bubble = { x: DOOR_X + 40, y: FLOOR_Y - 200, text: 'Too late.' }; resolve(false, 'Too slow. Now everyone knows.'); }
    }
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, '#dfe9ec');
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
