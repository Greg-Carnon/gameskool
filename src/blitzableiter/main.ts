import { beginFrame, createView } from '../kit/canvas';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { render } from './render';
import { createState, type State } from './state';
import { placeRod, update, type Events } from './update';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(400);
const shake = new Shake(10, 3);
const sfx = createSfx({
  place: [0.6, 0.02, 520, 0.01, 0.02, 0.06, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02],
  zap: [0.9, 0.05, 900, 0.01, 0.04, 0.18, 3, 2.2, 0, 0, 0, 0, 0, 1.2, 0, 0.2, 0.05, 0.8, 0.03],
  over: [1.2, 0.1, 160, 0.05, 0.3, 0.6, 2, 1.1, -8, 0, 0, 0, 0, 0.5, 0, 0.3, 0, 0.6, 0.1],
});

const BEST_KEY = 'blitz-best';
let state: State = createState(load(BEST_KEY, 0));
let playing = false;
const rng = mulberry32((Date.now() >>> 0) || 1);

const scoreEl = $('score');
const bestEl = $('best');
const startEl = $('start');
const overEl = $('over');

const events: Events = {
  onChain(rods, zaps, x, y) {
    if (zaps === 0) return;
    particles.emit({ x, y, count: Math.min(80, 12 * zaps), speed: 120 + 40 * rods, life: 0.5, color: '#cfe8ff', size: 3 });
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
      state.score >= state.best && state.score > 0
        ? 'New record!'
        : diff > 0 ? `${diff} points below your record` : '';
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
    sfx.play('place');
  },
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
    beginFrame(view, '#070911');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state);
    particles.draw(view.ctx);
    scoreEl.textContent = String(state.score);
    bestEl.textContent = state.best > 0 ? `best ${state.best}` : '';
  },
});
