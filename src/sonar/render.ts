import { H, W } from '../kit/canvas';
import { RULES, type State } from './logic';

export interface SceneFx {
  t: number;
  fade: number;        // 0..1 schwarz
  bossFlash: number;
}

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

function drawSub(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, t: number, facing: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.rotate(ang * facing);
  ctx.translate(0, Math.sin(t * 2) * 1.5);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0b12e';
  ctx.beginPath(); ctx.ellipse(0, 4, 20, 7, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-6, -18, 12, 9);
  ctx.fillRect(-1, -24, 2, 7);
  ctx.fillStyle = '#7ff5e6';
  ctx.beginPath(); ctx.arc(6, -1, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 2.5;
  const p = Math.sin(t * 25) * 6;
  ctx.beginPath(); ctx.moveTo(-24, -p); ctx.lineTo(-24, p); ctx.stroke();
  ctx.restore();
}

function drawBoss(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const b = s.boss!;
  const facing = Math.cos(b.angle) < 0 ? -1 : 1;
  // Köderlicht: immer sichtbar
  const lx = b.x + facing * 44, ly = b.y - 26 + Math.sin(t * 3) * 3;
  ctx.drawImage(glow(), lx - 20, ly - 20, 40, 40);
  ctx.fillStyle = '#fff6d0';
  ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
  const a = Math.max(b.vis, b.mode === 'stunned' ? 0.6 + 0.4 * Math.sin(t * 20) : 0);
  if (a <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(b.x, b.y);
  ctx.scale(facing, 1);
  // Angel
  ctx.strokeStyle = '#2a3b45'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(10, -22); ctx.quadraticCurveTo(30, -46, 44, -26 + Math.sin(t * 3) * 3); ctx.stroke();
  // Körper
  ctx.fillStyle = '#1d2c36';
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
  // Schwanz
  ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(-58, -22); ctx.lineTo(-52, 0); ctx.lineTo(-58, 22); ctx.lineTo(-34, 6); ctx.closePath(); ctx.fill();
  // Maul
  ctx.fillStyle = '#0a1116';
  ctx.beginPath(); ctx.moveTo(6, 2); ctx.quadraticCurveTo(28, 6, 40, 4); ctx.quadraticCurveTo(30, 20, 8, 18); ctx.closePath(); ctx.fill();
  // Zähne
  ctx.fillStyle = '#e8f0f2';
  for (let i = 0; i < 6; i++) {
    const tx = 10 + i * 5.5;
    ctx.beginPath(); ctx.moveTo(tx, 4); ctx.lineTo(tx + 2.5, 12); ctx.lineTo(tx + 5, 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx + 2, 18); ctx.lineTo(tx + 4.5, 10); ctx.lineTo(tx + 7, 18); ctx.closePath(); ctx.fill();
  }
  // Auge
  ctx.fillStyle = '#c9f5ff';
  ctx.beginPath(); ctx.arc(12, -10, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = b.mode === 'hunt' ? '#ff4d4d' : '#0a1116';
  ctx.beginPath(); ctx.arc(13.5, -10, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, s: State, fx: SceneFx, playing: boolean): void {
  const t = fx.t;
  // Tiefsee, dunkler je tiefer
  const deep = Math.min(1, s.levelIndex / 6);
  const g = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, 260 - 60 * deep);
  g.addColorStop(0, s.level.boss ? '#0b1a20' : '#06202b');
  g.addColorStop(1, '#020a12');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Schwebeteilchen
  ctx.fillStyle = 'rgba(127,245,230,0.12)';
  for (let i = 0; i < 24; i++) {
    const px = (i * 97 + Math.sin(t * 0.3 + i) * 20) % W;
    const py = ((i * 61 + t * 6) % H);
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  // Strömungen
  for (const c of s.currents) {
    ctx.fillStyle = 'rgba(127,245,230,0.04)';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = 'rgba(127,245,230,0.22)';
    ctx.lineWidth = 1.5;
    const horizontal = c.dx !== 0;
    const n = 14;
    for (let i = 0; i < n; i++) {
      const k = ((i / n) + (t * 0.25 * (horizontal ? Math.sign(c.dx) : Math.sign(c.dy))) % 1 + 1) % 1;
      if (horizontal) {
        const x = c.x + k * c.w; const y = c.y + 12 + ((i * 37) % (c.h - 24));
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14 * Math.sign(c.dx), y); ctx.stroke();
      } else {
        const y = c.y + k * c.h; const x = c.x + 12 + ((i * 37) % (c.w - 24));
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 14 * Math.sign(c.dy)); ctx.stroke();
      }
    }
  }
  // Luke
  {
    const hx = RULES.hatch.x, hy = RULES.hatch.y;
    const open = s.hatchOpen;
    ctx.strokeStyle = open ? `rgba(127,245,230,${0.7 + 0.3 * Math.sin(t * 5)})` : 'rgba(127,245,230,0.12)';
    ctx.lineWidth = open ? 3 : 1.5;
    ctx.beginPath(); ctx.arc(hx, hy, RULES.hatch.r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, RULES.hatch.r * 0.55, 0, Math.PI * 2); ctx.stroke();
    if (open) {
      ctx.fillStyle = 'rgba(127,245,230,0.15)';
      ctx.beginPath(); ctx.arc(hx, hy, RULES.hatch.r + 8 * (0.5 + 0.5 * Math.sin(t * 5)), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ff5e6';
      ctx.font = '800 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('HATCH OPEN', hx, hy - RULES.hatch.r - 12);
      ctx.beginPath(); ctx.moveTo(hx - 6, hy - 5); ctx.lineTo(hx, hy + 4); ctx.lineTo(hx + 6, hy - 5); ctx.closePath(); ctx.fill();
    }
  }
  // Pings
  for (const p of s.pings) {
    const a = 1 - p.r / p.max;
    ctx.strokeStyle = `rgba(127,245,230,${0.9 * a})`;
    ctx.lineWidth = p.big ? 4 : 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(127,245,230,${0.25 * a})`;
    ctx.lineWidth = p.big ? 22 : 14;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.r - 8), 0, Math.PI * 2); ctx.stroke();
  }
  // Objekte
  let near = Infinity;
  for (const o of s.objects) if (o.kind === 'mine') near = Math.min(near, Math.hypot(o.x - s.x, o.y - s.y));
  for (const o of s.objects) {
    let a = o.vis;
    if (o.kind === 'mine' && near < 90) {
      const d = Math.hypot(o.x - s.x, o.y - s.y);
      if (d < 90) a = Math.max(a, 0.25 + 0.2 * Math.sin(t * 12));
    }
    if (o.kind === 'fish' && o.huntT > 0) a = Math.max(a, 0.18);
    if (a <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = a;
    if (o.kind === 'pearl') {
      ctx.drawImage(glow(), o.x - 26, o.y - 26, 52, 52);
      ctx.fillStyle = '#fff7e0';
      ctx.beginPath(); ctx.arc(o.x, o.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(o.x - 2, o.y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (o.kind === 'tank') {
      ctx.fillStyle = '#9fb6c4';
      ctx.beginPath(); ctx.roundRect(o.x - 8, o.y - 16, 16, 30, 6); ctx.fill();
      ctx.fillStyle = '#5c7382';
      ctx.fillRect(o.x - 3, o.y - 21, 6, 6);
      ctx.fillStyle = '#7ff5e6';
      ctx.font = '800 9px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('O₂', o.x, o.y);
    } else if (o.kind === 'mine') {
      ctx.strokeStyle = '#2b3340'; ctx.lineWidth = 4;
      for (let i = 0; i < 8; i++) {
        const an = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(o.x + Math.cos(an) * 10, o.y + Math.sin(an) * 10); ctx.lineTo(o.x + Math.cos(an) * 19, o.y + Math.sin(an) * 19); ctx.stroke();
      }
      ctx.fillStyle = '#2b3340';
      ctx.beginPath(); ctx.arc(o.x, o.y, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = Math.sin(t * 8 + o.phase) > 0 ? '#ff4d4d' : '#5a1a1a';
      ctx.beginPath(); ctx.arc(o.x, o.y, 3.5, 0, Math.PI * 2); ctx.fill();
    } else if (o.kind === 'fish') {
      const dir = o.huntT > 0 ? Math.atan2(o.ty - o.y, o.tx - o.x) : Math.atan2(o.vy, o.vx);
      ctx.translate(o.x, o.y); ctx.rotate(dir);
      ctx.fillStyle = '#b9c9d6';
      ctx.beginPath(); ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-17, -6); ctx.lineTo(-17, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = o.huntT > 0 ? '#ff4d4d' : '#0a1116';
      ctx.beginPath(); ctx.arc(6, -1, 1.8, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,140,200,0.75)';
      ctx.beginPath(); ctx.arc(o.x, o.y, 15, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,140,200,0.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(o.x + i * 6, o.y);
        ctx.quadraticCurveTo(o.x + i * 6 + Math.sin(t * 3 + i) * 5, o.y + 14, o.x + i * 6 + Math.sin(t * 3 + i + 1) * 6, o.y + 26);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  if (s.boss) drawBoss(ctx, s, t);
  // Zielmarke
  if (playing && Math.hypot(s.tx - s.x, s.ty - s.y) > 4) {
    ctx.strokeStyle = 'rgba(127,245,230,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(s.tx, s.ty, 6 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  // Lade-Ring beim Halten
  if (s.holding && s.charge > 0.08) {
    const k = Math.min(1, s.charge / RULES.chargeTime);
    ctx.strokeStyle = k >= 1 ? '#fff6d0' : 'rgba(127,245,230,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(s.x, s.y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
  }
  // U-Boot
  const moving = Math.hypot(s.tx - s.x, s.ty - s.y) > 4;
  const facing = moving ? (s.tx < s.x ? -1 : 1) : 1;
  const ang = moving ? Math.atan2(s.ty - s.y, Math.abs(s.tx - s.x)) * 0.25 : 0;
  if (s.alive || !playing) drawSub(ctx, s.x, s.y, ang, t, facing);
  // Boss-Treffer-Flash
  if (fx.bossFlash > 0) {
    ctx.fillStyle = `rgba(255,120,80,${0.3 * fx.bossFlash})`;
    ctx.fillRect(0, 0, W, H);
  }
  // Abstieg
  if (fx.fade > 0) {
    ctx.fillStyle = `rgba(0,4,8,${fx.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}
