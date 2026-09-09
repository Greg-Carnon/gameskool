import { beginFrame, createView, H, W } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { barAt, beamAngle, createState, LANE_L, LANE_R, multiplier, PX, pulseRadius, SCREEN_Y, update, type State } from './logic';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(300);
const floats = new FloatText(12);
const shake = new Shake(8, 3);
const sfx = createSfx({
  tick: [0.3, 0, 900, 0.005, 0.01, 0.03, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01],
  die: [1, 0.05, 200, 0.02, 0.2, 0.4, 2, 0.9, -8, 0, 0, 0, 0, 0.5, 0, 0.2, 0, 0.7, 0.05],
  mult: [0.5, 0.02, 700, 0.01, 0.04, 0.1, 0, 1.4, 0, 0, 200, 0.06, 0, 0, 0, 0, 0, 0.8, 0.02],
});

const BEST_KEY = 'zeit-best';
let best = load<number>(BEST_KEY, 0);
let state: State = createState();
let rng = mulberry32(1);
let playing = false;
let realT = 0;
let lastMult = 1;
let freezeK = 1; // 1 = eingefroren, 0 = läuft

const startEl = $('start');
const overEl = $('over');
const scoreEl = $('score');
const multEl = $('mult');

function startGame(): void {
  rng = mulberry32((Date.now() >>> 0) || 1);
  state = createState();
  playing = true;
  lastMult = 1;
  startEl.hidden = true;
  overEl.hidden = true;
}

function endGame(): void {
  playing = false;
  const sc = Math.floor(state.score);
  if (sc > best) { best = sc; save(BEST_KEY, best); }
  shake.add(0.7);
  sfx.play('die');
  particles.emit({ x: PX, y: SCREEN_Y, count: 40, speed: 220, life: 0.6, color: '#e63946', size: 4 });
  $('finalScore').textContent = String(sc);
  $('holdLine').textContent = `Longest hold: ${state.bestHold.toFixed(1)} s`;
  $('bestLine').textContent = sc >= best ? 'New record!' : `Record: ${best}`;
  overEl.hidden = false;
}

bindPointer(view, {
  down() { unlockAudio(); if (playing) state.held = true; },
  up() { unlockAudio(); state.held = false; },
});
$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });

function render(ctx: CanvasRenderingContext2D, s: State): void {
  const frozen = freezeK;
  // Papier
  ctx.fillStyle = frozen > 0.5 ? '#e9e6e0' : '#f7f1e6';
  ctx.fillRect(0, 0, W, H);
  // Bahn
  ctx.fillStyle = frozen > 0.5 ? '#e0dcd5' : '#f1e9da';
  ctx.fillRect(LANE_L, 0, LANE_R - LANE_L, H);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const y = ((i * 60 + s.y) % (H + 60)) - 30;
    ctx.beginPath(); ctx.moveTo(LANE_L, H - y); ctx.lineTo(LANE_R, H - y); ctx.stroke();
  }
  // Gefahren
  const red = frozen > 0.5 ? '#b8848a' : '#e63946';
  const toScreen = (wy: number) => SCREEN_Y - (wy - s.y);
  for (const h of s.hazards) {
    const sy = toScreen(h.y);
    if (sy < -200 || sy > H + 200) continue;
    ctx.strokeStyle = red;
    ctx.fillStyle = red;
    ctx.lineCap = 'round';
    if (h.kind === 'bar') {
      const { cx, hw } = barAt(h, s.t);
      ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(cx - hw, sy); ctx.lineTo(cx + hw, sy); ctx.stroke();
    } else if (h.kind === 'beam') {
      const a = beamAngle(h, s.t);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(h.x - Math.cos(a) * 150, sy + Math.sin(a) * 150);
      ctx.lineTo(h.x + Math.cos(a) * 150, sy - Math.sin(a) * 150);
      ctx.stroke();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(h.x, sy, 7, 0, Math.PI * 2); ctx.fill();
    } else {
      const r = pulseRadius(h, s.t);
      ctx.beginPath(); ctx.arc(h.x, sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(h.x - r * 0.3, sy - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Bewegungsstreifen beim Laufen
  if (frozen < 0.5 && s.held) {
    ctx.strokeStyle = 'rgba(26,26,26,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(PX - 8 + i * 8, SCREEN_Y + 16); ctx.lineTo(PX - 8 + i * 8, SCREEN_Y + 40 + i * 10); ctx.stroke();
    }
  }
  // Spieler
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(PX, SCREEN_Y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f7f1e6';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(PX, SCREEN_Y, 6, 0, Math.PI * 2); ctx.stroke();
  // Eingefroren: Uhr-Symbol und Hinweis
  if (frozen > 0.5 && playing) {
    ctx.fillStyle = 'rgba(26,26,26,0.85)';
    ctx.font = '800 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('TIME STOPPED · HOLD TO MOVE', PX, SCREEN_Y + 70);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(PX, SCREEN_Y - 60, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PX, SCREEN_Y - 60); ctx.lineTo(PX, SCREEN_Y - 70); ctx.moveTo(PX, SCREEN_Y - 60); ctx.lineTo(PX + 7, SCREEN_Y - 56); ctx.stroke();
  }
}

startLoop({
  update(dt) {
    realT += dt;
    if (playing) {
      update(state, dt, rng);
      const m = Math.floor(multiplier(state.holdT));
      if (m > lastMult) { floats.add(`×${m}`, PX, SCREEN_Y - 90, { color: '#e63946', size: 34, life: 0.9 }); sfx.play('mult'); }
      lastMult = m;
      if (!state.alive) endGame();
    }
    freezeK += ((state.held && playing ? 0 : 1) - freezeK) * Math.min(1, dt * 12);
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, '#f7f1e6');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    scoreEl.textContent = String(Math.floor(state.score));
    const m = multiplier(state.holdT);
    multEl.textContent = `×${m.toFixed(1)}`;
    multEl.style.opacity = state.held ? '1' : '0.35';
  },
});
void realT;
