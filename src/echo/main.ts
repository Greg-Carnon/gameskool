import { beginFrame, createView, H, W } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { dailySeed, mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { createState, distanceM, GROUND, jump, jumpCut, PX, R, update, type Marker, type Replay, type State } from './logic';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(300);
const floats = new FloatText(12, 'Fredoka, system-ui, sans-serif');
const shake = new Shake(8, 3);
const sfx = createSfx({
  jump: [0.5, 0.02, 320, 0.01, 0.05, 0.1, 0, 1.6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.02],
  die: [1, 0.05, 180, 0.02, 0.2, 0.4, 2, 0.9, -6, 0, 0, 0, 0, 0.6, 0, 0.2, 0, 0.7, 0.05],
  echo: [1, 0.1, 90, 0.05, 0.3, 0.6, 4, 1, 0, 0, 0, 0, 0, 1.5, 0, 0.4, 0, 0.5, 0.1],
});

const SEED = dailySeed();
const MARK_KEY = `echo-markers-${SEED}`;
const REPLAY_KEY = `echo-replays-${SEED}`;
const RUN_KEY = `echo-runs-${SEED}`;
const BEST_KEY = 'echo-best';

let markers: Marker[] = load<Marker[]>(MARK_KEY, []);
let replays: Replay[] = load<Replay[]>(REPLAY_KEY, []);
let runNumber = load<number>(RUN_KEY, 0) + 1;
let best = load<number>(BEST_KEY, 0);
let state: State = createState(markers, replays, runNumber);
let rng = mulberry32(SEED);
let playing = false;
let holding = false;
let sceneT = 0;

const startEl = $('start');
const overEl = $('over');
const distEl = $('dist');
const runEl = $('run');

function startGame(): void {
  rng = mulberry32(SEED);
  state = createState(markers, replays, runNumber);
  playing = true;
  startEl.hidden = true;
  overEl.hidden = true;
  runEl.textContent = `run ${runNumber} · ${markers.length} echo${markers.length === 1 ? '' : 's'}`;
}

function endGame(): void {
  playing = false;
  const d = distanceM(state);
  const m: Marker = { x: state.worldX + PX, y: state.y - R, run: runNumber };
  markers = [...markers, m].slice(-7);
  replays = [...replays, { frames: state.frames.filter((_, i) => i % 2 === 0), run: runNumber }].slice(-4);
  save(MARK_KEY, markers);
  save(REPLAY_KEY, replays);
  save(RUN_KEY, runNumber);
  if (d > best) { best = d; save(BEST_KEY, best); }
  runNumber++;
  shake.add(0.7);
  sfx.play(state.deathBy === 'echo' ? 'echo' : 'die');
  particles.emit({ x: PX, y: state.y - R, count: 40, speed: 200, life: 0.6, color: '#ff9a5c', size: 4, gravity: 600 });
  $('finalDist').textContent = `${d} m`;
  $('cause').textContent = state.deathBy === 'echo'
    ? `Killed by your own echo from run ${state.deathRun}.`
    : 'Hit a block. Your echo now haunts this spot.';
  $('bestLine').textContent = d >= best ? 'New record today!' : `Record: ${best} m`;
  overEl.hidden = false;
}

bindPointer(view, {
  down() { unlockAudio(); if (!playing) return; holding = true; if (state.y >= GROUND) { jump(state); sfx.play('jump'); particles.emit({ x: PX, y: GROUND, count: 8, speed: 80, life: 0.3, color: '#2b1b3d', size: 3, angle: Math.PI, spread: 1 }); } },
  up() { unlockAudio(); holding = false; jumpCut(state); },
});
$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('resetBtn').addEventListener('click', () => {
  markers = []; replays = []; runNumber = 1;
  save(MARK_KEY, markers); save(REPLAY_KEY, replays); save(RUN_KEY, 0);
  startGame();
});

// Szene
const seededScene = mulberry32(SEED + 7);
const HILLS_FAR = Array.from({ length: 12 }, (_, i) => ({ x: i * 80, h: 60 + seededScene() * 80 }));
const HILLS_NEAR = Array.from({ length: 12 }, (_, i) => ({ x: i * 90, h: 30 + seededScene() * 50 }));
const STARS = Array.from({ length: 40 }, () => ({ x: seededScene() * W, y: seededScene() * 220, r: 0.6 + seededScene() }));

function drawBlob(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha: number, vy: number, eyes = true): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  const stretch = Math.max(-0.25, Math.min(0.25, -vy / 2000));
  ctx.scale(1 - stretch, 1 + stretch);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  if (eyes) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(6, -4, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1020';
    ctx.beginPath(); ctx.arc(7.5, -4, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function render(ctx: CanvasRenderingContext2D, s: State): void {
  // Himmel: Abenddämmerung
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#1b1035');
  g.addColorStop(0.55, '#6b2d5c');
  g.addColorStop(1, '#ff8a5b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (const st of STARS) { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill(); }
  // Sonne
  const sg = ctx.createRadialGradient(300, 430, 10, 300, 430, 120);
  sg.addColorStop(0, 'rgba(255,220,150,0.9)');
  sg.addColorStop(0.3, 'rgba(255,170,100,0.5)');
  sg.addColorStop(1, 'rgba(255,140,90,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(160, 300, 300, 300);
  ctx.fillStyle = '#ffd9a0';
  ctx.beginPath(); ctx.arc(300, 430, 42, 0, Math.PI * 2); ctx.fill();
  // Hügel mit Parallaxe
  const drawHills = (hills: { x: number; h: number }[], off: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-10, GROUND);
    const span = hills.length * 80;
    for (let i = -1; i <= hills.length + 1; i++) {
      const hh = hills[((i % hills.length) + hills.length) % hills.length];
      const x = ((i * 80 - off) % span + span) % span - 80;
      ctx.quadraticCurveTo(x - 40 + 40, GROUND - hh.h, x + 40, GROUND - hh.h * 0.6);
    }
    ctx.lineTo(W + 10, GROUND); ctx.closePath(); ctx.fill();
  };
  drawHills(HILLS_FAR, s.worldX * 0.15, '#3a1f4d');
  drawHills(HILLS_NEAR, s.worldX * 0.35, '#24122f');
  // Boden
  ctx.fillStyle = '#120a1f';
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const x = ((i * 40 - s.worldX) % 480 + 480) % 480 - 40;
    ctx.beginPath(); ctx.moveTo(x, GROUND + 14); ctx.lineTo(x + 20, GROUND + 14); ctx.stroke();
  }
  // Hindernisse
  for (const o of s.obstacles) {
    const x = o.x - s.worldX;
    ctx.fillStyle = '#120a1f';
    ctx.fillRect(x, GROUND - o.h, o.w, o.h);
    ctx.fillStyle = 'rgba(255,138,91,0.35)';
    ctx.fillRect(x, GROUND - o.h, o.w, 3);
  }
  // Replays: alte Läufe als Geister, rein kosmetisch
  for (const rp of s.replays) {
    const y = rp.frames[Math.floor(s.frame / 2)];
    if (y === undefined) continue;
    drawBlob(ctx, PX, y - R, '#7ad7ff', 0.22, 0, false);
  }
  // Marker: wo du gestorben bist, tödlich
  for (const m of s.markers) {
    const x = m.x - s.worldX;
    if (x < -40 || x > W + 40) continue;
    const bob = Math.sin(sceneT * 3 + m.x) * 4;
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#7ad7ff';
    ctx.beginPath(); ctx.arc(x, m.y + bob, R * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    drawBlob(ctx, x, m.y + bob, '#bfeeff', 0.85, 0, false);
    ctx.fillStyle = '#1a1020';
    ctx.font = '700 11px Fredoka, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`#${m.run}`, x, m.y + bob + 1);
  }
  // Spieler
  if (s.alive) drawBlob(ctx, PX, s.y - R, '#ff9a5c', 1, s.vy);
}

startLoop({
  update(dt) {
    sceneT += dt;
    if (playing) {
      update(state, dt, rng);
      if (holding && state.y < GROUND && state.vy < 0) state.vy -= 900 * dt; // längerer Sprung bei Halten
      if (!state.alive) endGame();
    }
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, '#1b1035');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    distEl.textContent = `${distanceM(state)} m`;
  },
});
runEl.textContent = `run ${runNumber} · ${markers.length} echo${markers.length === 1 ? '' : 's'}`;
