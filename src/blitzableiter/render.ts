import { H, W } from '../kit/canvas';
import { RULES } from './rules';
import type { State } from './state';

const COLORS = {
  bg: '#070911',
  field: '#0d1020',
  charge: '#9fb3c8',
  chargeDanger: '#ff7a7a',
  rod: '#e8ecf3',
  rodOld: '#5a6478',
  bolt: '#cfe8ff',
  radius: 'rgba(124, 196, 255, 0.25)',
};

function drawBolt(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, seed: number, alpha: number) {
  const segs = 7;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.strokeStyle = COLORS.bolt;
  ctx.lineWidth = 3;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const wobble = Math.sin(seed + i * 12.9898) * 10;
    ctx.lineTo(x1 + dx * t + nx * wobble, y1 + dy * t + ny * wobble);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function render(ctx: CanvasRenderingContext2D, s: State): void {
  // Spielfeld
  ctx.fillStyle = COLORS.field;
  ctx.fillRect(0, 0, W, H);

  // Radius-Anzeige nach dem Setzen
  for (const r of s.radiusShows) {
    ctx.globalAlpha = r.t / RULES.rod.radiusShowTime;
    ctx.strokeStyle = COLORS.radius;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, RULES.rod.chainRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ableiter
  for (const r of s.rods) {
    const life = 1 - r.age / RULES.rod.lifetime;
    ctx.strokeStyle = life < 0.3 ? COLORS.rodOld : COLORS.rod;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y - 14);
    ctx.lineTo(r.x, r.y + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r.x, r.y - 14, 4, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    // Restlebensdauer als Bogen
    ctx.beginPath();
    ctx.arc(r.x, r.y, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * life);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Ladungen
  const danger = s.charges.length / RULES.charge.maxOnField;
  ctx.fillStyle = danger > 0.75 ? COLORS.chargeDanger : COLORS.charge;
  for (const c of s.charges) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, RULES.charge.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blitze
  for (const b of s.bolts) drawBolt(ctx, b.x1, b.y1, b.x2, b.y2, b.seed, b.t / RULES.bolt.life);

  // Entladungs-Ringe
  for (const z of s.zaps) {
    const p = 1 - z.t / 0.3;
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = COLORS.bolt;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(z.x, z.y, 8 + p * 30, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Gefahr-Balken unten
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(20, H - 16, W - 40, 6);
  ctx.fillStyle = danger > 0.75 ? COLORS.chargeDanger : COLORS.charge;
  ctx.fillRect(20, H - 16, (W - 40) * Math.min(1, danger), 6);
}
