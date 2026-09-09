import { beginFrame, createView } from '../kit/canvas';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { render } from './render';
import { RULES } from './rules';
import { createState, type State } from './state';
import { levelName, tapAt, update, type Events } from './update';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(300);
const shake = new Shake(8, 3);
const sfx = createSfx({
  swipe: [0.7, 0.05, 380, 0.01, 0.05, 0.12, 4, 1.8, -20, 0, 0, 0, 0, 0, 0, 0.1, 0, 0.7, 0.03],
  good: [0.5, 0.02, 660, 0.01, 0.03, 0.08, 0, 1.3, 0, 0, 120, 0.05, 0, 0, 0, 0, 0, 0.8, 0.02],
  bad: [0.9, 0.05, 140, 0.02, 0.15, 0.3, 2, 0.8, -4, 0, 0, 0, 0, 0.4, 0, 0.2, 0, 0.7, 0.05],
  over: [1.2, 0.1, 110, 0.05, 0.4, 0.8, 2, 1.0, -6, 0, 0, 0, 0, 0.5, 0, 0.3, 0, 0.6, 0.1],
});

const BEST_KEY = 'slop-best';
let state: State = createState(load(BEST_KEY, 0));
let playing = false;
const rng = mulberry32((Date.now() >>> 0) || 1);

const scoreEl = $('score');
const comboEl = $('combo');
const strikesEl = $('strikes');
const startEl = $('start');
const overEl = $('over');

function strikesText(n: number): string {
  return '●'.repeat(RULES.strikes - n) + '○'.repeat(n);
}

const events: Events = {
  onCorrect(c, combo) {
    const cx = RULES.field.x + RULES.field.w / 2;
    if (c.phase === 'rejected') {
      particles.emit({ x: cx, y: c.y + c.h / 2, count: 18, speed: 160, life: 0.4, color: '#c58bff', size: 3, angle: Math.PI, spread: 1.2 });
      sfx.play('swipe');
    } else {
      sfx.play('good', 0.05, 0.6 + Math.min(0.6, combo * 0.05));
    }
  },
  onMistake(c) {
    const cx = RULES.field.x + RULES.field.w / 2;
    particles.emit({ x: cx, y: c.y + c.h / 2, count: 24, speed: 120, life: 0.5, color: '#ff6b6b', size: 3 });
    shake.add(0.5);
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
    if (playing) update(state, dt, rng, events);
    particles.update(dt);
    shake.update(dt);
  },
  render() {
    beginFrame(view, '#0b0d14');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state);
    particles.draw(view.ctx);
    scoreEl.textContent = String(state.score);
    comboEl.textContent = state.combo >= RULES.score.comboStep ? `x${1 + Math.floor(state.combo / RULES.score.comboStep)}` : '';
    strikesEl.textContent = strikesText(state.strikes);
  },
});
