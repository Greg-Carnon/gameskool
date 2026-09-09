import { beginFrame, createView } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { render, type SceneFx } from './render';
import { createState, type State } from './state';
import { placeRod, update, type Events } from './update';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(500);
const floats = new FloatText(20);
const shake = new Shake(12, 3);
const sfx = createSfx({
  place: [0.5, 0.02, 560, 0.01, 0.02, 0.07, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02],
  zap: [0.9, 0.05, 900, 0.01, 0.04, 0.2, 3, 2.2, 0, 0, 0, 0, 0, 1.2, 0, 0.2, 0.05, 0.8, 0.03],
  thunder: [1.6, 0.2, 55, 0.05, 0.25, 0.7, 4, 1, 0, 0, 0, 0, 0, 2.5, 0, 0.5, 0, 0.5, 0.15],
  over: [1.2, 0.1, 160, 0.05, 0.3, 0.6, 2, 1.1, -8, 0, 0, 0, 0, 0.5, 0, 0.3, 0, 0.6, 0.1],
});

const BEST_KEY = 'blitz-best';
let state: State = createState(load(BEST_KEY, 0));
let playing = false;
let freeze = 0;
const rng = mulberry32((Date.now() >>> 0) || 1);
const fx: SceneFx = { t: 0, flash: 0 };
const CHAIN_WORDS = ['', '', 'DOUBLE', 'TRIPLE', 'QUAD', 'MEGA'];

const scoreEl = $('score');
const bestEl = $('best');
const startEl = $('start');
const overEl = $('over');

const events: Events = {
  onChain(rods, zaps, x, y) {
    if (zaps === 0) return;
    const gained = zaps * zaps * 10 * rods;
    particles.emit({ x, y, count: Math.min(120, 14 * zaps + 6 * rods), speed: 140 + 40 * rods, life: 0.55, color: '#cfe8ff', size: 3 });
    particles.emit({ x, y, count: 12, speed: 60, life: 0.9, color: '#ffffff', size: 2, gravity: 120 });
    floats.add(`+${gained}`, x, y - 20, { color: '#ffffff', size: 24 + Math.min(16, rods * 3), family: '"Bricolage Grotesque", Inter, sans-serif' });
    if (rods >= 2) {
      fx.flash = Math.min(1, 0.35 + 0.2 * rods);
      floats.add(`${CHAIN_WORDS[Math.min(5, rods)]} ×${rods}`, x, y - 60, { color: '#7cc4ff', size: 30, life: 1.1, family: '"Bricolage Grotesque", Inter, sans-serif' });
    }
    if (rods >= 3) {
      freeze = 0.07;
      sfx.play('thunder', 0.2, Math.min(1.5, 0.6 + 0.2 * rods));
    }
    shake.add(0.2 + 0.15 * rods);
    sfx.play('zap', 0.1, Math.min(1.5, 0.6 + 0.2 * zaps));
  },
  onGameOver() {
    playing = false;
    shake.add(0.8);
    sfx.play('over');
    save(BEST_KEY, state.best);
    $('finalScore').textContent = String(state.score);
    const diff = state.best - state.score;
    $('nearMiss').textContent =
      state.score >= state.best && state.score > 0 ? 'New record!' : diff > 0 ? `${diff} points below your record` : '';
    $('chainInfo').textContent = `Best chain this run: ${state.bestChain} rods`;
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
  up(x, y) {
    unlockAudio();
    if (!playing) return;
    placeRod(state, x, y);
    particles.emit({ x, y: y - 20, count: 8, speed: 50, life: 0.35, color: '#7cc4ff', size: 2 });
    sfx.play('place');
  },
});

$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });

startLoop({
  update(dt) {
    fx.t += dt;
    fx.flash = Math.max(0, fx.flash - dt * 4);
    if (freeze > 0) { freeze -= dt; return; }
    if (playing) update(state, dt, rng, events);
    particles.update(dt);
    floats.update(dt);
    shake.update(dt);
  },
  render() {
    beginFrame(view, '#05060c');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state, fx);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    scoreEl.textContent = String(state.score);
    bestEl.textContent = state.best > 0 ? `best ${state.best}` : '';
  },
});
