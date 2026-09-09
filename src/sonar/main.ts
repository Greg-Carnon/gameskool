import { beginFrame, createView, H, W } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { load, save } from '../kit/storage';
import { createState, nearestMine, RULES, score, tap, update, type State } from './logic';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(300);
const floats = new FloatText(12);
const shake = new Shake(10, 3);
const sfx = createSfx({
  ping: [0.6, 0.01, 1200, 0.01, 0.1, 0.5, 0, 1, 0, 0, -600, 0.3, 0, 0, 0, 0, 0, 0.5, 0.05],
  pearl: [0.5, 0.02, 900, 0.01, 0.05, 0.15, 0, 1.4, 0, 0, 300, 0.06, 0, 0, 0, 0, 0, 0.8, 0.02],
  tick: [0.4, 0, 1800, 0.005, 0.01, 0.04, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01],
  boom: [1.5, 0.1, 50, 0.05, 0.3, 0.8, 4, 1, 0, 0, 0, 0, 0, 2.5, 0, 0.5, 0, 0.5, 0.15],
  sting: [0.8, 0.05, 400, 0.02, 0.1, 0.3, 3, 1.5, -10, 0, 0, 0, 0, 0.5, 0, 0.2, 0, 0.7, 0.05],
  drown: [1, 0.1, 120, 0.1, 0.4, 0.8, 1, 0.7, -3, 0, 0, 0, 0, 0.3, 0, 0.3, 0, 0.6, 0.1],
});

const BEST_KEY = 'sonar-best';
let best = load<number>(BEST_KEY, 0);
let state: State = createState();
let rng = mulberry32(1);
let playing = false;
let tickAcc = 0;
let sceneT = 0;

const startEl = $('start');
const overEl = $('over');
const o2El = $('o2');
const scoreEl = $('score');

function startGame(): void {
  rng = mulberry32((Date.now() >>> 0) || 1);
  state = createState();
  playing = true;
  startEl.hidden = true;
  overEl.hidden = true;
}

function endGame(): void {
  playing = false;
  const sc = score(state);
  if (sc > best) { best = sc; save(BEST_KEY, best); }
  const by = state.deathBy;
  shake.add(by === 'mine' ? 1 : 0.5);
  sfx.play(by === 'mine' ? 'boom' : by === 'jelly' ? 'sting' : 'drown');
  particles.emit({ x: state.x, y: state.y, count: 50, speed: 200, life: 0.7, color: by === 'mine' ? '#ff9a5c' : '#7ff5e6', size: 4 });
  for (const o of state.objects) o.vis = 1;
  $('finalScore').textContent = String(sc);
  $('cause').textContent = by === 'mine' ? 'You hit a mine.' : by === 'jelly' ? 'Stung by a jellyfish.' : 'Out of oxygen.';
  $('pearlLine').textContent = `${state.pearls} pearls · ${Math.floor(state.t)} s under water`;
  $('bestLine').textContent = sc >= best ? 'New record!' : `Record: ${best}`;
  overEl.hidden = false;
}

bindPointer(view, {
  down(x, y) {
    unlockAudio();
    if (!playing) return;
    tap(state, x, y);
    sfx.play('ping', 0.02);
  },
  up() { unlockAudio(); },
});
$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });

let glowSprite: HTMLCanvasElement | null = null;
function glow(): HTMLCanvasElement {
  if (glowSprite) return glowSprite;
  const s = document.createElement('canvas'); s.width = s.height = 96;
  const g = s.getContext('2d')!;
  const rg = g.createRadialGradient(48, 48, 0, 48, 48, 48);
  rg.addColorStop(0, 'rgba(255,240,200,0.95)');
  rg.addColorStop(0.3, 'rgba(255,220,150,0.4)');
  rg.addColorStop(1, 'rgba(255,220,150,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 96, 96);
  glowSprite = s;
  return s;
}

function drawSub(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, t: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const bob = Math.sin(t * 2) * 1.5;
  ctx.translate(0, bob);
  // Rumpf
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0b12e';
  ctx.beginPath(); ctx.ellipse(0, 4, 20, 7, 0, 0, Math.PI); ctx.fill();
  // Turm
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-6, -18, 12, 9);
  ctx.fillRect(-1, -24, 2, 7);
  // Bullauge
  ctx.fillStyle = '#7ff5e6';
  ctx.beginPath(); ctx.arc(6, -1, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 1.5; ctx.stroke();
  // Propeller
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 2.5;
  const p = Math.sin(t * 25) * 6;
  ctx.beginPath(); ctx.moveTo(-24, -p); ctx.lineTo(-24, p); ctx.stroke();
  ctx.restore();
}

function render(ctx: CanvasRenderingContext2D, s: State): void {
  // Tiefsee
  const g = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, 260);
  g.addColorStop(0, '#06202b');
  g.addColorStop(1, '#020a12');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Schwebeteilchen
  ctx.fillStyle = 'rgba(127,245,230,0.12)';
  for (let i = 0; i < 24; i++) {
    const px = (i * 97 + Math.sin(sceneT * 0.3 + i) * 20) % W;
    const py = ((i * 61 + sceneT * 6) % H);
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  // Pings
  for (const p of s.pings) {
    const a = 1 - p.r / RULES.pingMax;
    ctx.strokeStyle = `rgba(127,245,230,${0.9 * a})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(127,245,230,${0.25 * a})`;
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.r - 8), 0, Math.PI * 2); ctx.stroke();
  }
  // Objekte
  const near = nearestMine(s);
  for (const o of s.objects) {
    let a = o.vis;
    if (o.kind === 'mine' && near < 90) {
      const d = Math.hypot(o.x - s.x, o.y - s.y);
      if (d < 90) a = Math.max(a, 0.25 + 0.2 * Math.sin(sceneT * 12));
    }
    if (a <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = a;
    if (o.kind === 'pearl') {
      ctx.drawImage(glow(), o.x - 26, o.y - 26, 52, 52);
      ctx.fillStyle = '#fff7e0';
      ctx.beginPath(); ctx.arc(o.x, o.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(o.x - 2, o.y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (o.kind === 'mine') {
      ctx.fillStyle = '#2b3340';
      for (let i = 0; i < 8; i++) {
        const an = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(o.x + Math.cos(an) * 10, o.y + Math.sin(an) * 10); ctx.lineTo(o.x + Math.cos(an) * 19, o.y + Math.sin(an) * 19); ctx.lineWidth = 4; ctx.strokeStyle = '#2b3340'; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(o.x, o.y, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = Math.sin(sceneT * 8 + o.phase) > 0 ? '#ff4d4d' : '#5a1a1a';
      ctx.beginPath(); ctx.arc(o.x, o.y, 3.5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,140,200,0.75)';
      ctx.beginPath(); ctx.arc(o.x, o.y, 15, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,140,200,0.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(o.x + i * 6, o.y);
        ctx.quadraticCurveTo(o.x + i * 6 + Math.sin(sceneT * 3 + i) * 5, o.y + 14, o.x + i * 6 + Math.sin(sceneT * 3 + i + 1) * 6, o.y + 26);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  // Zielmarke
  if (playing && Math.hypot(s.tx - s.x, s.ty - s.y) > 4) {
    ctx.strokeStyle = 'rgba(127,245,230,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(s.tx, s.ty, 6 + Math.sin(sceneT * 6) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  // U-Boot
  const ang = Math.hypot(s.tx - s.x, s.ty - s.y) > 4 ? Math.atan2(s.ty - s.y, s.tx - s.x) * 0.25 : 0;
  if (s.alive || !playing) drawSub(ctx, s.x, s.y, ang, sceneT);
}

startLoop({
  update(dt) {
    sceneT += dt;
    if (playing) {
      const before = state.pearls;
      update(state, dt, rng);
      if (state.pearls > before) {
        particles.emit({ x: state.x, y: state.y, count: 20, speed: 120, life: 0.5, color: '#fff2c4', size: 3 });
        floats.add(`+${RULES.pearlAir} O₂`, state.x, state.y - 30, { color: '#7ff5e6', size: 18 });
        sfx.play('pearl');
      }
      const nm = nearestMine(state);
      if (nm < 90) { tickAcc += dt; const period = 0.15 + (nm / 90) * 0.5; if (tickAcc > period) { tickAcc = 0; sfx.play('tick', 0.02, 0.5); } }
      if (!state.alive) endGame();
    }
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, '#020a12');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    o2El.style.width = `${Math.max(0, state.oxygen)}%`;
    o2El.style.background = state.oxygen < 25 ? '#ff4d4d' : '#7ff5e6';
    scoreEl.textContent = String(score(state));
  },
});
