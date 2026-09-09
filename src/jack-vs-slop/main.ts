import { beginFrame, createView } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import type { Pose } from './jack';
import { JACK, render, type UiFx } from './render';
import { RULES } from './rules';
import { createState, type State } from './state';
import { levelName, multiplier, tapAt, update, type Events } from './update';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(400);
const floats = new FloatText(24);
const shake = new Shake(9, 3);
const sfx = createSfx({
  swipe: [0.7, 0.05, 380, 0.01, 0.05, 0.14, 4, 1.8, -20, 0, 0, 0, 0, 0, 0, 0.1, 0, 0.7, 0.03],
  stamp: [0.8, 0.02, 200, 0.01, 0.02, 0.1, 1, 1.5, -30, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.8, 0.02],
  good: [0.45, 0.02, 720, 0.01, 0.03, 0.09, 0, 1.3, 0, 0, 140, 0.05, 0, 0, 0, 0, 0, 0.8, 0.02],
  bad: [0.9, 0.05, 130, 0.02, 0.15, 0.32, 2, 0.8, -4, 0, 0, 0, 0, 0.4, 0, 0.2, 0, 0.7, 0.05],
  over: [1.2, 0.1, 110, 0.05, 0.4, 0.8, 2, 1.0, -6, 0, 0, 0, 0, 0.5, 0, 0.3, 0, 0.6, 0.1],
});

const BEST_KEY = 'slop-best';
let state: State = createState(load(BEST_KEY, 0));
let playing = false;
const rng = mulberry32((Date.now() >>> 0) || 1);

const fx: UiFx = { t: 0, pose: 'idle', poseT: 0, bubble: null, bubbleT: 0, comboGlow: 0, slopFlash: 0 };
const PHRASES_GOOD = ['Clean.', 'Beautiful.', 'Just watch.', 'Insane.', 'Ship it.'];
const PHRASES_SLOP = ['No AI slop.', 'Nope.', 'Delete.', 'Not on my site.'];
const PHRASES_MISS = ['Noooo.', 'That was slop.', 'Come on.'];
const PHRASES_WRONG = ['That was clean!', 'Wait, that was good.'];

function setPose(p: Pose): void { fx.pose = p; fx.poseT = 0; }
function say(list: string[]): void { fx.bubble = list[Math.floor(Math.random() * list.length)]; fx.bubbleT = 0; }

const scoreEl = $('score');
const comboEl = $('combo');
const strikesEl = $('strikes');
const startEl = $('start');
const overEl = $('over');

const centerX = RULES.field.x + RULES.field.w / 2;

const events: Events = {
  onCorrect(c, combo) {
    const y = c.y + c.h / 2;
    if (c.phase === 'rejected') {
      particles.emit({ x: centerX - 40, y, count: 26, speed: 220, life: 0.45, color: '#c58bff', size: 3.5, angle: Math.PI, spread: 1.4 });
      particles.emit({ x: centerX, y, count: 10, speed: 120, life: 0.4, color: '#ffd23f', size: 2.5 });
      floats.add('SLOP!', centerX, y - 10, { color: '#ffd23f', size: 30, rot: -0.12, family: '"Archivo Black", Inter, sans-serif' });
      setPose('swipe');
      if (combo % 3 === 0) say(PHRASES_SLOP);
      sfx.play('swipe');
      sfx.play('stamp', 0.05, 0.7);
      shake.add(0.15);
    } else {
      floats.add(`+${RULES.score.perAccept * multiplier(combo)}`, centerX + 60, RULES.field.acceptY - 10, { color: '#5cf2a0', size: 18, life: 0.6 });
      if (combo % 4 === 0) { setPose('nod'); say(PHRASES_GOOD); }
      sfx.play('good', 0.05, 0.5 + Math.min(0.5, combo * 0.04));
    }
    if (combo > 0 && combo % RULES.score.comboStep === 0) {
      floats.add(`×${multiplier(combo)}`, centerX, RULES.field.acceptY - 60, { color: '#5cf2a0', size: 40, life: 1.0, family: '"Archivo Black", Inter, sans-serif' });
    }
  },
  onMistake(c, reason) {
    const y = Math.min(c.y + c.h / 2, RULES.field.acceptY);
    particles.emit({ x: centerX, y, count: 30, speed: 160, life: 0.5, color: '#ff5e5e', size: 3 });
    fx.slopFlash = 1;
    shake.add(0.55);
    setPose('facepalm');
    say(reason.startsWith('That was clean') ? PHRASES_WRONG : PHRASES_MISS);
    sfx.play('bad');
  },
  onGameOver() {
    playing = false;
    shake.add(0.8);
    sfx.play('over');
    save(BEST_KEY, state.best);
    $('finalScore').textContent = String(state.score);
    $('level').textContent = levelName(state.score);
    $('reason').textContent = state.lastMistake ?? '';
    const slopCount = state.built.filter((b) => b.slop).length;
    const pct = state.built.length ? Math.round((100 * slopCount) / state.built.length) : 0;
    $('siteInfo').textContent = `Slop in your website: ${pct}%. Best combo: ${state.bestCombo}.`;
    const diff = state.best - state.score;
    $('nearMiss').textContent = state.score >= state.best && state.score > 0 ? 'New record!' : diff > 0 ? `${diff} below your record` : '';
    overEl.hidden = false;
  },
};

function startGame(): void {
  state = createState(load(BEST_KEY, 0));
  playing = true;
  fx.bubble = null;
  setPose('idle');
  startEl.hidden = true;
  overEl.hidden = true;
}

bindPointer(view, {
  down(x, y) {
    unlockAudio();
    if (!playing) return;
    tapAt(state, x, y, events);
  },
  up() { unlockAudio(); },
});

$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });

startLoop({
  update(dt) {
    fx.t += dt;
    fx.poseT += dt;
    fx.bubbleT += dt;
    if (fx.pose !== 'idle' && fx.poseT > (fx.pose === 'facepalm' ? 0.9 : 0.5)) setPose('idle');
    if (fx.bubble && fx.bubbleT > 1.5) fx.bubble = null;
    fx.slopFlash = Math.max(0, fx.slopFlash - dt * 3);
    const targetGlow = Math.min(1, (multiplier(state.combo) - 1) / 3);
    fx.comboGlow += (targetGlow - fx.comboGlow) * Math.min(1, dt * 4);
    if (playing) update(state, dt, rng, events);
    particles.update(dt);
    floats.update(dt);
    shake.update(dt);
  },
  render() {
    beginFrame(view, '#0a0b10');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state, fx);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    scoreEl.textContent = String(state.score);
    const m = multiplier(state.combo);
    comboEl.hidden = m <= 1;
    comboEl.textContent = `×${m}`;
    strikesEl.textContent = '●'.repeat(RULES.strikes - state.strikes) + '○'.repeat(state.strikes);
  },
});
void JACK;
