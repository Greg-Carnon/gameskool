import { H, W } from '../kit/canvas';
import { mulberry32 } from '../kit/rng';
import { RULES } from './rules';
import type { State } from './state';

export interface SceneFx {
  t: number;
  flash: number;   // 0..1
}

const C = {
  skyTop: [11, 16, 38] as const,
  skyBottom: [5, 6, 12] as const,
  dangerTop: [92, 20, 60] as const,
  charge: '#7cc4ff',
  chargeHot: '#ff8a8a',
  rod: '#dff1ff',
  rodDim: '#5b6b85',
  bolt: '#ffffff',
  boltGlow: '#7cc4ff',
  window: '#ffd9a0',
};

const seeded = mulberry32(20260930);
const STARS = Array.from({ length: 70 }, () => ({ x: seeded() * W, y: seeded() * 480, r: 0.6 + seeded() * 1.3, p: seeded() * 6.28 }));
const RAIN = Array.from({ length: 70 }, () => ({ x: seeded() * (W + 80), y: seeded() * H, l: 10 + seeded() * 14, s: 520 + seeded() * 260 }));
const BUILDINGS: { x: number; w: number; h: number; win: { x: number; y: number }[] }[] = [];
{
  let x = -10;
  while (x < W + 10) {
    const w = 18 + seeded() * 34;
    const h = 40 + seeded() * 110;
    const win: { x: number; y: number }[] = [];
    for (let wy = 10; wy < h - 8; wy += 12) for (let wx = 4; wx < w - 5; wx += 9) if (seeded() < 0.16) win.push({ x: wx, y: wy });
    BUILDINGS.push({ x, w, h, win });
    x += w + 2 + seeded() * 6;
  }
}

let glowSprite: HTMLCanvasElement | null = null;
function getGlow(): HTMLCanvasElement {
  if (glowSprite) return glowSprite;
  const s = document.createElement('canvas');
  s.width = s.height = 96;
  const g = s.getContext('2d')!;
  const rg = g.createRadialGradient(48, 48, 0, 48, 48, 48);
  rg.addColorStop(0, 'rgba(180,225,255,0.9)');
  rg.addColorStop(0.25, 'rgba(124,196,255,0.45)');
  rg.addColorStop(1, 'rgba(124,196,255,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 96, 96);
  glowSprite = s;
  return s;
}

function mix(a: readonly number[], b: readonly number[], k: number): string {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

function drawSky(ctx: CanvasRenderingContext2D, danger: number, t: number): void {
  const k = Math.max(0, (danger - 0.4) / 0.6);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mix(C.skyTop, C.dangerTop, k));
  g.addColorStop(1, mix(C.skyBottom, C.skyBottom, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Wetterleuchten in den Wolken
  const wl = 0.06 + 0.1 * k + 0.05 * Math.max(0, Math.sin(t * 0.7) * Math.sin(t * 2.3));
  const cg = ctx.createRadialGradient(W * 0.7, -40, 10, W * 0.7, -40, 260);
  cg.addColorStop(0, `rgba(124,196,255,${wl})`);
  cg.addColorStop(1, 'rgba(124,196,255,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, 320);
  // Sterne
  for (const s of STARS) {
    const tw = 0.5 + 0.5 * Math.sin(t * 1.7 + s.p);
    ctx.globalAlpha = 0.25 + 0.55 * tw;
    ctx.fillStyle = '#dfe9ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawRain(ctx: CanvasRenderingContext2D, t: number): void {
  ctx.strokeStyle = 'rgba(160,190,230,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const r of RAIN) {
    const y = (r.y + t * r.s) % (H + 40) - 20;
    const x = r.x - (t * r.s * 0.12) % (W + 80);
    const xx = ((x % (W + 80)) + W + 80) % (W + 80) - 40;
    ctx.moveTo(xx, y);
    ctx.lineTo(xx - r.l * 0.12, y + r.l);
  }
  ctx.stroke();
}

function drawCity(ctx: CanvasRenderingContext2D, t: number): void {
  const base = H - 8;
  ctx.fillStyle = '#04050a';
  for (const b of BUILDINGS) {
    ctx.fillRect(b.x, base - b.h, b.w, b.h);
  }
  for (const b of BUILDINGS) {
    for (const w of b.win) {
      const flick = Math.sin(t * 0.9 + w.x * 3 + w.y) > -0.85;
      ctx.fillStyle = flick ? C.window : '#3a2c1a';
      ctx.globalAlpha = 0.75;
      ctx.fillRect(b.x + w.x, base - b.h + w.y, 4, 5);
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#04050a';
  ctx.fillRect(0, base, W, 8);
}

function boltPath(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, seed: number, segs: number, amp: number): void {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.moveTo(x1, y1);
  for (let i = 1; i < segs; i++) {
    const tt = i / segs;
    const wobble = Math.sin(seed + i * 12.9898) * amp * Math.sin(tt * Math.PI);
    ctx.lineTo(x1 + dx * tt + nx * wobble, y1 + dy * tt + ny * wobble);
  }
  ctx.lineTo(x2, y2);
}

function drawBolt(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, seed: number, alpha: number): void {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Glow
  ctx.globalAlpha = alpha * 0.35;
  ctx.strokeStyle = C.boltGlow;
  ctx.lineWidth = 14;
  ctx.beginPath(); boltPath(ctx, x1, y1, x2, y2, seed, 8, 14); ctx.stroke();
  // Mitte
  ctx.globalAlpha = alpha * 0.8;
  ctx.lineWidth = 5;
  ctx.beginPath(); boltPath(ctx, x1, y1, x2, y2, seed, 8, 14); ctx.stroke();
  // Kern
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = C.bolt;
  ctx.lineWidth = 2;
  ctx.beginPath(); boltPath(ctx, x1, y1, x2, y2, seed, 8, 14); ctx.stroke();
  // Zwei Nebenäste
  ctx.globalAlpha = alpha * 0.6;
  ctx.lineWidth = 1.2;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  for (let b = 0; b < 2; b++) {
    const a = ang + (b ? 0.9 : -0.9) + Math.sin(seed + b) * 0.3;
    const L = 18 + (Math.sin(seed * 3 + b) + 1) * 12;
    ctx.beginPath(); boltPath(ctx, mx, my, mx + Math.cos(a) * L, my + Math.sin(a) * L, seed + 7 * b, 4, 6); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function render(ctx: CanvasRenderingContext2D, s: State, fx: SceneFx): void {
  const danger = s.charges.length / RULES.charge.maxOnField;
  drawSky(ctx, danger, fx.t);
  drawRain(ctx, fx.t);
  drawCity(ctx, fx.t);

  // Radius-Ring nach dem Setzen
  for (const r of s.radiusShows) {
    ctx.globalAlpha = 0.5 * (r.t / RULES.rod.radiusShowTime);
    ctx.strokeStyle = C.charge;
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, RULES.rod.chainRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;

  // Ableiter: Neon-Pin mit leuchtender Spitze
  const glow = getGlow();
  for (const r of s.rods) {
    const life = 1 - r.age / RULES.rod.lifetime;
    const col = life < 0.3 ? C.rodDim : C.rod;
    // Bodenring
    ctx.strokeStyle = 'rgba(124,196,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(r.x, r.y + 6, 12, 4, 0, 0, Math.PI * 2); ctx.stroke();
    // Restlebensdauer
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(r.x, r.y, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * life); ctx.stroke();
    // Stab
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r.x, r.y + 4); ctx.lineTo(r.x, r.y - 22); ctx.stroke();
    // Spitze
    ctx.globalAlpha = life < 0.3 ? 0.4 : 0.9;
    ctx.drawImage(glow, r.x - 14, r.y - 36, 28, 28);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(r.x, r.y - 22, 3, 0, Math.PI * 2); ctx.fill();
  }

  // Ladungen: Glühkugeln mit Halo und Flackern
  for (const c of s.charges) {
    const fl = 0.85 + 0.15 * Math.sin(fx.t * 23 + c.x);
    const size = 44 * fl;
    ctx.globalAlpha = danger > 0.75 ? 0.75 : 0.95;
    ctx.drawImage(glow, c.x - size / 2, c.y - size / 2, size, size);
    ctx.globalAlpha = 1;
    ctx.fillStyle = danger > 0.75 ? C.chargeHot : '#eaf6ff';
    ctx.beginPath(); ctx.arc(c.x, c.y, RULES.charge.radius * 0.55, 0, Math.PI * 2); ctx.fill();
  }

  // Blitze
  for (const b of s.bolts) drawBolt(ctx, b.x1, b.y1, b.x2, b.y2, b.seed, b.t / RULES.bolt.life);

  // Entladungsringe
  for (const z of s.zaps) {
    const p = 1 - z.t / 0.3;
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = C.boltGlow;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(z.x, z.y, 8 + p * 36, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Sturm-Meter unten
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(24, H - 22, W - 48, 5);
  ctx.fillStyle = danger > 0.75 ? C.chargeHot : C.charge;
  ctx.fillRect(24, H - 22, (W - 48) * Math.min(1, danger), 5);
  ctx.font = '800 9px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(223,241,255,0.5)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('STORM', 24, H - 28);

  // Flash
  if (fx.flash > 0) {
    ctx.fillStyle = `rgba(220,240,255,${0.55 * fx.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
}
