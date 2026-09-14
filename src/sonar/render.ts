import { H, W } from '../kit/canvas';
import { mulberry32 } from '../kit/rng';
import { LEVELS, type Env } from './levels';
import { krakenArmPoints, RULES, type State } from './logic';
import { drawComponentAt } from '../jack-vs-slop/render';
import { spawnComponent } from '../jack-vs-slop/components';
import type { Component } from '../jack-vs-slop/state';

export interface SceneFx {
  t: number;
  fade: number;        // 0..1 schwarz
  bossFlash: number;
  shownDepth: number;  // rollende Tiefenzahl
  paint: string;       // Bootsfarbe aus Meilensteinen
  whale: number;       // 0 = kein Wal, sonst Fortschritt 0..1
}

const TEAL = '#7ff5e6';

const grottoRng = mulberry32(777);
const GROTTO_CARDS: Component[] = [];
for (let i = 0; i < 6; i++) { const c = spawnComponent(0, grottoRng, i + 1, false); if (c.template === 'hero') c.template = 'card'; GROTTO_CARDS.push(c); }

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

// Umgebungsdaten pro Level, deterministisch aus dem Level-Index
interface EnvData { seabed: number[]; kelp: { x: number; h: number; ph: number }[]; dots: { x: number; y: number; ph: number }[]; rocks: number[][] }
const envCache = new Map<number, EnvData>();
function envFor(index: number): EnvData {
  const cached = envCache.get(index);
  if (cached) return cached;
  const r = mulberry32(1000 + index);
  const seabed: number[] = [];
  for (let x = 0; x <= W + 20; x += 20) seabed.push(H - 60 - r() * 34);
  const kelp = Array.from({ length: 9 }, () => ({ x: 20 + r() * (W - 40), h: 160 + r() * 260, ph: r() * 6.28 }));
  const dots = Array.from({ length: 34 }, () => ({ x: r() * W, y: 60 + r() * (H - 160), ph: r() * 6.28 }));
  const rocks = [
    Array.from({ length: 7 }, (_, i) => 30 + r() * 40 + (i % 2) * 20),
    Array.from({ length: 7 }, (_, i) => 30 + r() * 40 + (i % 2) * 20),
  ];
  const d = { seabed, kelp, dots, rocks };
  envCache.set(index, d);
  return d;
}

function drawSeabed(ctx: CanvasRenderingContext2D, e: EnvData, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-10, H + 10);
  e.seabed.forEach((y, i) => ctx.lineTo(i * 20 - 10, y));
  ctx.lineTo(W + 10, H + 10);
  ctx.closePath();
  ctx.fill();
}

function drawEnvironment(ctx: CanvasRenderingContext2D, env: Env, index: number, t: number, s: State): void {
  const e = envFor(index);
  if (env === 'shallows') {
    // Lichtstrahlen von oben
    for (let i = 0; i < 5; i++) {
      const x = 60 + i * 75 + Math.sin(t * 0.3 + i) * 18;
      const g = ctx.createLinearGradient(0, 0, 0, 520);
      g.addColorStop(0, 'rgba(127,245,230,0.10)');
      g.addColorStop(1, 'rgba(127,245,230,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 14, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 70, 520); ctx.lineTo(x - 30, 520); ctx.closePath(); ctx.fill();
    }
    drawSeabed(ctx, e, '#062028');
  } else if (env === 'kelp') {
    drawSeabed(ctx, e, '#06231f');
    for (const k of e.kelp) {
      const baseY = H - 70;
      ctx.strokeStyle = '#0b2f29';
      ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(k.x, baseY);
      const sway = Math.sin(t * 0.7 + k.ph) * 18;
      ctx.quadraticCurveTo(k.x + sway, baseY - k.h * 0.5, k.x + sway * 1.6, baseY - k.h);
      ctx.stroke();
      ctx.fillStyle = '#0b2f29';
      for (let j = 1; j <= 4; j++) {
        const yy = baseY - k.h * (j / 4.5);
        const xx = k.x + sway * (j / 4.5) * 1.2;
        ctx.beginPath(); ctx.ellipse(xx + (j % 2 ? 12 : -12), yy, 14, 5, (j % 2 ? 0.4 : -0.4), 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (env === 'wreck') {
    drawSeabed(ctx, e, '#0a1a24');
    // Schiffsrumpf rechts, gekippt
    ctx.save();
    ctx.translate(300, H - 120);
    ctx.rotate(-0.18);
    ctx.fillStyle = '#071119';
    ctx.beginPath();
    ctx.moveTo(-150, -10); ctx.lineTo(120, -10); ctx.lineTo(90, 60); ctx.lineTo(-120, 60); ctx.closePath(); ctx.fill();
    ctx.fillRect(-80, -70, 70, 62);
    ctx.fillRect(-20, -150, 8, 145);
    ctx.fillStyle = 'rgba(127,245,230,0.10)';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-110 + i * 45, 22, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  } else if (env === 'trench') {
    // Felswände
    ctx.fillStyle = '#04101a';
    ctx.beginPath(); ctx.moveTo(0, 0);
    e.rocks[0].forEach((w, i) => ctx.lineTo(w, i * (H / 6)));
    ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, 0);
    e.rocks[1].forEach((w, i) => ctx.lineTo(W - w, i * (H / 6)));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    drawSeabed(ctx, e, '#030c14');
    // Biolumineszenz
    for (const d of e.dots) {
      const a = 0.25 + 0.35 * Math.max(0, Math.sin(t * 1.3 + d.ph));
      ctx.fillStyle = `rgba(90,160,255,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  } else if (env === 'kraken') {
    drawSeabed(ctx, e, '#0d0a1a');
    for (const d of e.dots) {
      const a = 0.2 + 0.3 * Math.max(0, Math.sin(t * 1.1 + d.ph));
      ctx.fillStyle = `rgba(170,110,255,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    if (s.boss && s.boss.mode === 'strike') {
      ctx.fillStyle = `rgba(170,110,255,${0.05 + 0.05 * Math.sin(t * 9)})`;
      ctx.fillRect(0, 0, W, H);
    }
  } else if (env === 'deep') {
    drawSeabed(ctx, e, '#050a10');
    // Schwarze Raucher
    for (let i = 0; i < 3; i++) {
      const x = 70 + i * 125;
      ctx.fillStyle = '#0a1016';
      ctx.beginPath(); ctx.moveTo(x - 22, H - 60); ctx.lineTo(x - 8, H - 150 - i * 20); ctx.lineTo(x + 8, H - 150 - i * 20); ctx.lineTo(x + 22, H - 60); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 6; k++) {
        const kk = ((t * 0.25 + k * 0.17 + i * 0.3) % 1);
        ctx.fillStyle = `rgba(90,90,110,${0.25 * (1 - kk)})`;
        ctx.beginPath(); ctx.arc(x + Math.sin(kk * 6 + k) * 14, H - 150 - i * 20 - kk * 260, 8 + kk * 22, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `rgba(255,120,60,${0.5 + 0.4 * Math.sin(t * 7 + i)})`;
      ctx.beginPath(); ctx.arc(x, H - 152 - i * 20, 4, 0, Math.PI * 2); ctx.fill();
    }
  } else if (env === 'grotto') {
    // Warme Höhle, Licht von oben, saubere Websites schweben
    const g = ctx.createRadialGradient(W / 2, 120, 20, W / 2, 120, 620);
    g.addColorStop(0, 'rgba(255,214,150,0.22)');
    g.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a1410';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(90, 0); ctx.quadraticCurveTo(30, 200, 70, 420); ctx.quadraticCurveTo(20, 600, 60, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - 80, 0); ctx.quadraticCurveTo(W - 30, 240, W - 60, 460); ctx.quadraticCurveTo(W - 10, 620, W - 50, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    drawSeabed(ctx, e, '#1a1410');
    for (let i = 0; i < GROTTO_CARDS.length; i++) {
      const c = GROTTO_CARDS[i];
      const cx = 70 + (i % 2) * 130 + Math.sin(t * 0.5 + i) * 8;
      const cy = 150 + i * 92 + Math.cos(t * 0.4 + i * 1.3) * 6;
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t * 0.3 + i) * 0.04);
      ctx.scale(0.5, 0.5);
      ctx.shadowColor = 'rgba(255,214,150,0.35)'; ctx.shadowBlur = 24;
      drawComponentAt(ctx, c, 0, 0);
      ctx.restore();
    }
    for (const d of e.dots.slice(0, 20)) {
      const a = 0.2 + 0.3 * Math.max(0, Math.sin(t * 0.8 + d.ph));
      ctx.fillStyle = `rgba(255,230,180,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  } else if (env === 'lair') {
    drawSeabed(ctx, e, '#120a10');
    // Rippen und Schädel
    ctx.strokeStyle = 'rgba(200,190,180,0.14)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 52;
      ctx.beginPath(); ctx.arc(x, H - 60, 40 + (i % 2) * 14, Math.PI, Math.PI * 1.9); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(200,190,180,0.14)';
    ctx.beginPath(); ctx.arc(330, H - 95, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#120a10';
    ctx.beginPath(); ctx.arc(322, H - 100, 6, 0, Math.PI * 2); ctx.arc(340, H - 100, 6, 0, Math.PI * 2); ctx.fill();
    // Roter Schimmer wenn der Boss jagt
    if (s.boss && s.boss.mode === 'hunt') {
      ctx.fillStyle = `rgba(255,60,40,${0.05 + 0.04 * Math.sin(t * 6)})`;
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    drawSeabed(ctx, e, '#02060c');
    for (const d of e.dots.slice(0, 12)) {
      const a = 0.12 + 0.2 * Math.max(0, Math.sin(t * 0.7 + d.ph));
      ctx.fillStyle = `rgba(120,200,255,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawGauge(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const x = 12, y0 = 130, y1 = 640;
  const maxDepth = Math.max(240, s.level.depth + 40);
  const yOf = (d: number) => y0 + (y1 - y0) * (d / maxDepth);
  ctx.strokeStyle = 'rgba(127,245,230,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
  ctx.font = '700 9px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  LEVELS.forEach((l, i) => {
    const yy = yOf(l.depth);
    const reached = i <= s.levelIndex;
    ctx.fillStyle = reached ? TEAL : 'rgba(127,245,230,0.25)';
    ctx.beginPath(); ctx.arc(x, yy, reached ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
    if (i === s.levelIndex + 1 || i === s.levelIndex) {
      ctx.fillStyle = i === s.levelIndex ? TEAL : 'rgba(127,245,230,0.45)';
      ctx.fillText(`${l.depth} m`, x + 9, yy);
    }
  });
  // Aktuelle Position
  const cy = yOf(s.level.depth);
  ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, cy, 7 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2); ctx.stroke();
}

function drawSub(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, t: number, facing: number, paint = '#ffd23f'): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.rotate(ang * facing);
  ctx.translate(0, Math.sin(t * 2) * 1.5);
  // Scheinwerfer
  const cone = ctx.createLinearGradient(20, 0, 20 + RULES.headlight * 1.6, 0);
  cone.addColorStop(0, 'rgba(255,246,208,0.16)');
  cone.addColorStop(1, 'rgba(255,246,208,0)');
  ctx.fillStyle = cone;
  ctx.beginPath(); ctx.moveTo(18, -4); ctx.lineTo(20 + RULES.headlight * 1.6, -30); ctx.lineTo(20 + RULES.headlight * 1.6, 30); ctx.lineTo(18, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = paint;
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(0, 4, 20, 7, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = paint;
  ctx.fillRect(-6, -18, 12, 9);
  ctx.fillRect(-1, -24, 2, 7);
  // Bullauge mit Jack: Cap, blonde Haare, Schnurrbart
  ctx.fillStyle = '#c9f5ff';
  ctx.beginPath(); ctx.arc(6, -1, 5.2, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(6, -1, 5.2, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#f1c7a3';
  ctx.beginPath(); ctx.arc(6, 0.5, 3.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c25c';
  ctx.fillRect(2.4, -2.4, 7.2, 1.6);
  ctx.fillStyle = '#f5f2ea';
  ctx.beginPath(); ctx.arc(6, -2.6, 3.9, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(2, -3, 9.5, 1.1);
  ctx.fillStyle = '#c48f45';
  ctx.fillRect(4.2, 1.6, 3.6, 1);
  ctx.fillStyle = '#2a1e14';
  ctx.fillRect(4.6, -0.6, 0.9, 0.9); ctx.fillRect(6.6, -0.6, 0.9, 0.9);
  ctx.restore();
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(6, -1, 5.2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff6d0';
  ctx.beginPath(); ctx.arc(20, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 2.5;
  const p = Math.sin(t * 25) * 6;
  ctx.beginPath(); ctx.moveTo(-24, -p); ctx.lineTo(-24, p); ctx.stroke();
  ctx.restore();
}

function drawKraken(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const b = s.boss!;
  const a = Math.max(0.16, b.vis, b.mode === 'stunned' ? 0.6 + 0.4 * Math.sin(t * 20) : 0);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = '#2a1f4a';
  ctx.lineCap = 'round';
  for (const arm of krakenArmPoints(b, t)) {
    ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(arm.x1, arm.y1);
    const mx = (arm.x1 + arm.x2) / 2 + Math.sin(t * 2 + arm.x2) * 18, my = (arm.y1 + arm.y2) / 2 + Math.cos(t * 2 + arm.y2) * 18;
    ctx.quadraticCurveTo(mx, my, arm.x2, arm.y2); ctx.stroke();
    ctx.fillStyle = 'rgba(170,110,255,0.5)';
    for (let k = 0.3; k < 1; k += 0.2) {
      ctx.beginPath(); ctx.arc(arm.x1 + (arm.x2 - arm.x1) * k, arm.y1 + (arm.y2 - arm.y1) * k, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = '#2a1f4a';
  ctx.beginPath(); ctx.ellipse(b.x, b.y - 10, 44, 56, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9f5ff';
  ctx.beginPath(); ctx.ellipse(b.x, b.y, 18, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = b.mode === 'strike' ? '#ff4d4d' : '#0a1116';
  ctx.beginPath(); ctx.ellipse(b.x, b.y, 7, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (b.mode === 'strike') {
    const k = 1 - b.modeT / RULES.kraken.telegraph;
    ctx.strokeStyle = `rgba(255,77,77,${0.4 + 0.5 * k})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(b.strikeX, b.strikeY, RULES.kraken.strikeRadius * (1.4 - 0.4 * k), 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawLeviathan(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const b = s.boss!;
  const a = Math.max(0.12, b.vis, b.mode === 'stunned' ? 0.6 + 0.4 * Math.sin(t * 20) : 0);
  ctx.save();
  ctx.globalAlpha = a;
  for (let i = b.trail.length - 1; i >= 0; i -= 4) {
    const p = b.trail[i];
    const k = 1 - i / b.trail.length;
    ctx.fillStyle = i % 8 === 0 ? '#12303a' : '#0e2630';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + 10 * k, 7 + 8 * k, 0, 0, Math.PI * 2); ctx.fill();
    if (i % 8 === 0) { ctx.fillStyle = 'rgba(127,245,230,0.5)'; ctx.beginPath(); ctx.arc(p.x, p.y - 6, 2, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);
  ctx.fillStyle = '#12303a';
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a1116';
  ctx.beginPath(); ctx.moveTo(6, 4); ctx.lineTo(32, 2); ctx.lineTo(28, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8f0f2';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(8 + i * 5, 4); ctx.lineTo(10 + i * 5, 10); ctx.lineTo(12 + i * 5, 4); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#ff4d4d';
  ctx.beginPath(); ctx.arc(10, -6, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawMegalodon(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const b = s.boss!;
  const M = RULES.megalodon;
  // Angriffsbahn
  if (b.mode === 'strike') {
    const k = 1 - b.modeT / M.telegraph;
    ctx.strokeStyle = `rgba(255,77,77,${0.35 + 0.55 * k})`;
    ctx.lineWidth = 2 + 4 * k;
    ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.strikeX * 1200, b.y + b.strikeY * 1200); ctx.stroke();
    ctx.setLineDash([]);
  }
  // Flosse und Kielwasser immer schwach sichtbar
  const a = Math.max(0.28, b.vis, b.mode === 'stunned' ? 0.6 + 0.4 * Math.sin(t * 20) : 0, b.mode === 'hunt' ? 0.9 : 0);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);
  const open = b.mode === 'strike' || b.mode === 'hunt';
  ctx.fillStyle = '#243846';
  ctx.beginPath(); ctx.ellipse(0, 0, 78, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9d6dd';
  ctx.beginPath(); ctx.ellipse(6, 9, 62, 12, 0, 0, Math.PI); ctx.fill();
  // Schwanz
  ctx.fillStyle = '#243846';
  ctx.beginPath(); ctx.moveTo(-70, -4); ctx.lineTo(-104, -34); ctx.lineTo(-96, 0); ctx.lineTo(-104, 30); ctx.lineTo(-70, 4); ctx.closePath(); ctx.fill();
  // Rückenflosse und Brustflosse
  ctx.beginPath(); ctx.moveTo(-10, -22); ctx.lineTo(4, -54); ctx.lineTo(22, -22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, 18); ctx.lineTo(-2, 44); ctx.lineTo(28, 24); ctx.closePath(); ctx.fill();
  // Kiemen
  ctx.strokeStyle = '#162530'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(26 + i * 6, -10); ctx.lineTo(24 + i * 6, 10); ctx.stroke(); }
  // Maul
  ctx.fillStyle = '#0a1116';
  ctx.beginPath();
  if (open) { ctx.moveTo(44, -10); ctx.lineTo(82, -18); ctx.lineTo(80, 20); ctx.lineTo(44, 14); }
  else { ctx.moveTo(48, 4); ctx.quadraticCurveTo(66, 8, 78, 2); ctx.quadraticCurveTo(66, 12, 48, 10); }
  ctx.closePath(); ctx.fill();
  if (open) {
    ctx.fillStyle = '#eef4f6';
    for (let i = 0; i < 6; i++) {
      const tx = 48 + i * 6;
      ctx.beginPath(); ctx.moveTo(tx, -8); ctx.lineTo(tx + 3, 0); ctx.lineTo(tx + 6, -8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx, 14); ctx.lineTo(tx + 3, 5); ctx.lineTo(tx + 6, 14); ctx.closePath(); ctx.fill();
    }
  }
  // Auge
  ctx.fillStyle = '#0a1116';
  ctx.beginPath(); ctx.arc(40, -12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = open ? '#ff4d4d' : '#c9d6dd';
  ctx.beginPath(); ctx.arc(41, -12, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Kielwasser beim Rasen
  if (b.mode === 'hunt') {
    ctx.strokeStyle = 'rgba(200,230,255,0.35)'; ctx.lineWidth = 2;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath(); ctx.arc(b.x - b.strikeX * i * 30, b.y - b.strikeY * i * 30, 10 + i * 8, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

function drawBoss(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const b = s.boss!;
  if (b.kind === 'megalodon') { drawMegalodon(ctx, s, t); return; }
  if (b.kind === 'kraken') { drawKraken(ctx, s, t); return; }
  if (b.kind === 'leviathan') { drawLeviathan(ctx, s, t); return; }
  const facing = Math.cos(b.angle) < 0 ? -1 : 1;
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
  ctx.strokeStyle = '#2a3b45'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(10, -22); ctx.quadraticCurveTo(30, -46, 44, -26 + Math.sin(t * 3) * 3); ctx.stroke();
  ctx.fillStyle = '#1d2c36';
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, -6); ctx.lineTo(-58, -22); ctx.lineTo(-52, 0); ctx.lineTo(-58, 22); ctx.lineTo(-34, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0a1116';
  ctx.beginPath(); ctx.moveTo(6, 2); ctx.quadraticCurveTo(28, 6, 40, 4); ctx.quadraticCurveTo(30, 20, 8, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8f0f2';
  for (let i = 0; i < 6; i++) {
    const tx = 10 + i * 5.5;
    ctx.beginPath(); ctx.moveTo(tx, 4); ctx.lineTo(tx + 2.5, 12); ctx.lineTo(tx + 5, 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx + 2, 18); ctx.lineTo(tx + 4.5, 10); ctx.lineTo(tx + 7, 18); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#c9f5ff';
  ctx.beginPath(); ctx.arc(12, -10, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = b.mode === 'hunt' ? '#ff4d4d' : '#0a1116';
  ctx.beginPath(); ctx.arc(13.5, -10, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawHatch(ctx: CanvasRenderingContext2D, s: State, t: number): void {
  const hx = RULES.hatch.x, hy = RULES.hatch.y, r = RULES.hatch.r;
  const open = s.hatchOpen;
  // Metallring
  ctx.fillStyle = '#0b1a22';
  ctx.beginPath(); ctx.ellipse(hx, hy, r + 6, (r + 6) * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = open ? TEAL : 'rgba(127,245,230,0.2)';
  ctx.lineWidth = open ? 3 : 2;
  ctx.beginPath(); ctx.ellipse(hx, hy, r, r * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const an = (i / 8) * Math.PI * 2;
    ctx.fillStyle = open ? TEAL : 'rgba(127,245,230,0.3)';
    ctx.beginPath(); ctx.arc(hx + Math.cos(an) * r, hy + Math.sin(an) * r * 0.7, 2, 0, Math.PI * 2); ctx.fill();
  }
  if (open) {
    const g = ctx.createRadialGradient(hx, hy, 2, hx, hy, r);
    g.addColorStop(0, `rgba(127,245,230,${0.5 + 0.3 * Math.sin(t * 5)})`);
    g.addColorStop(1, 'rgba(127,245,230,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(hx, hy, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = TEAL;
    ctx.font = '800 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('DESCEND', hx, hy - r - 14 + Math.sin(t * 4) * 2);
    ctx.beginPath(); ctx.moveTo(hx - 6, hy - 6); ctx.lineTo(hx, hy + 3); ctx.lineTo(hx + 6, hy - 6); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(127,245,230,0.35)';
    ctx.font = '800 9px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.max(0, s.level.pearlsNeeded - s.pearls)} MORE`, hx, hy - r - 12);
  }
}

export function render(ctx: CanvasRenderingContext2D, s: State, fx: SceneFx, playing: boolean): void {
  const t = fx.t;
  const deep = Math.min(1, s.levelIndex / 6);
  const g = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, 280 - 70 * deep);
  g.addColorStop(0, s.level.env === 'lair' ? '#10151c' : s.level.env === 'shallows' ? '#083241' : s.level.env === 'grotto' ? '#2a2018' : '#06202b');
  g.addColorStop(1, s.level.env === 'grotto' ? '#0e0a08' : '#020a12');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawEnvironment(ctx, s.level.env, s.levelIndex, t, s);
  ctx.fillStyle = 'rgba(127,245,230,0.12)';
  for (let i = 0; i < 24; i++) {
    const px = (i * 97 + Math.sin(t * 0.3 + i) * 20) % W;
    const py = ((i * 61 + t * 6) % H);
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  for (const c of s.currents) {
    ctx.fillStyle = 'rgba(127,245,230,0.04)';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = 'rgba(127,245,230,0.25)';
    ctx.lineWidth = 1.5;
    const horizontal = c.dx !== 0;
    for (let i = 0; i < 14; i++) {
      const k = ((i / 14) + (t * 0.25 * (horizontal ? Math.sign(c.dx) : Math.sign(c.dy))) % 1 + 1) % 1;
      if (horizontal) {
        const x = c.x + k * c.w; const y = c.y + 12 + ((i * 37) % (c.h - 24));
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14 * Math.sign(c.dx), y); ctx.stroke();
      } else {
        const y = c.y + k * c.h; const x = c.x + 12 + ((i * 37) % (c.w - 24));
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 14 * Math.sign(c.dy)); ctx.stroke();
      }
    }
  }
  drawHatch(ctx, s, t);
  drawGauge(ctx, s, t);
  for (const p of s.pings) {
    const a = 1 - p.r / p.max;
    ctx.strokeStyle = `rgba(127,245,230,${0.9 * a})`;
    ctx.lineWidth = p.big ? 4 : 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(127,245,230,${0.25 * a})`;
    ctx.lineWidth = p.big ? 22 : 14;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.r - 8), 0, Math.PI * 2); ctx.stroke();
  }
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
    // Echo-Blip: frisch angepingt
    if (o.vis > 0.96) {
      ctx.strokeStyle = 'rgba(127,245,230,0.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(o.x, o.y, 22 + (1 - o.vis) * 400, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.save();
    ctx.globalAlpha = a;
    if (o.kind === 'gold') {
      ctx.drawImage(glow(), o.x - 40, o.y - 40, 80, 80);
      ctx.fillStyle = '#f2c94c';
      ctx.beginPath(); ctx.arc(o.x, o.y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6d0';
      ctx.beginPath(); ctx.arc(o.x - 3, o.y - 3, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2c94c';
      ctx.font = '800 9px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText("CAPTAIN'S PEARL", o.x, o.y - 22);
    } else if (o.kind === 'torpedo' || o.kind === 'flare' || o.kind === 'magnet' || o.kind === 'shield' || o.kind === 'boost') {
      const col = { torpedo: '#ff9a5c', flare: '#fff6d0', magnet: '#c58bff', shield: '#7ff5e6', boost: '#5cf2a0' }[o.kind];
      const bob = Math.sin(t * 3 + o.phase) * 3;
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(o.x - 14, o.y - 14 + bob, 28, 28, 8); ctx.stroke();
      ctx.fillStyle = col;
      ctx.globalAlpha *= 0.15; ctx.fill(); ctx.globalAlpha = a;
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
      const cx = o.x, cy = o.y + bob;
      if (o.kind === 'torpedo') { ctx.beginPath(); ctx.roundRect(cx - 9, cy - 3, 18, 6, 3); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - 9, cy - 6); ctx.lineTo(cx - 9, cy + 6); ctx.stroke(); }
      else if (o.kind === 'flare') { for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * 3, cy + Math.sin(an) * 3); ctx.lineTo(cx + Math.cos(an) * 9, cy + Math.sin(an) * 9); ctx.stroke(); } }
      else if (o.kind === 'magnet') { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy + 1, 7, Math.PI, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 7, cy + 1); ctx.lineTo(cx - 7, cy + 7); ctx.moveTo(cx + 7, cy + 1); ctx.lineTo(cx + 7, cy + 7); ctx.stroke(); }
      else if (o.kind === 'shield') { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy - 9); ctx.lineTo(cx + 8, cy - 5); ctx.lineTo(cx + 6, cy + 5); ctx.lineTo(cx, cy + 9); ctx.lineTo(cx - 6, cy + 5); ctx.lineTo(cx - 8, cy - 5); ctx.closePath(); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(cx + 2, cy - 10); ctx.lineTo(cx - 6, cy + 1); ctx.lineTo(cx, cy + 1); ctx.lineTo(cx - 2, cy + 10); ctx.lineTo(cx + 6, cy - 1); ctx.lineTo(cx, cy - 1); ctx.closePath(); ctx.fill(); }
    } else if (o.kind === 'pearl') {
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
      ctx.fillStyle = TEAL;
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
  for (const tp of s.torpedoes) {
    ctx.save();
    ctx.translate(tp.x, tp.y);
    ctx.rotate(Math.atan2(tp.vy, tp.vx));
    ctx.fillStyle = '#ff9a5c';
    ctx.beginPath(); ctx.roundRect(-10, -3, 20, 6, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,154,92,0.4)';
    ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(-24 - Math.random() * 6, 0); ctx.lineTo(-10, 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (s.boss) drawBoss(ctx, s, t);
  if (fx.whale > 0) {
    const k = fx.whale;
    const wx = -160 + (W + 320) * k;
    const wy = 250 + Math.sin(k * 6) * 20;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#0a2a30';
    ctx.beginPath(); ctx.ellipse(wx, wy, 120, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(wx - 110, wy); ctx.lineTo(wx - 160, wy - 30); ctx.lineTo(wx - 150, wy); ctx.lineTo(wx - 160, wy + 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(wx + 20, wy + 24, 40, 10, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (playing && Math.hypot(s.tx - s.x, s.ty - s.y) > 4) {
    ctx.strokeStyle = 'rgba(127,245,230,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(s.tx, s.ty, 6 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  if (s.holding && s.charge > 0.08) {
    const k = Math.min(1, s.charge / RULES.chargeTime);
    ctx.strokeStyle = k >= 1 ? '#fff6d0' : 'rgba(127,245,230,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(s.x, s.y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
  }
  const moving = Math.hypot(s.tx - s.x, s.ty - s.y) > 4;
  const facing = moving ? (s.tx < s.x ? -1 : 1) : 1;
  const ang = moving ? Math.atan2(s.ty - s.y, Math.abs(s.tx - s.x)) * 0.25 : 0;
  if (s.alive || !playing) {
    if (s.invuln > 0) ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 18));
    drawSub(ctx, s.x, s.y, ang, t, facing, fx.paint);
    ctx.globalAlpha = 1;
    if (s.invuln > 0) {
      ctx.strokeStyle = 'rgba(127,245,230,0.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, 34, 0, Math.PI * 2 * Math.min(1, s.invuln / RULES.respawnGrace)); ctx.stroke();
    }
    if (s.shield) {
      ctx.strokeStyle = `rgba(127,245,230,${0.5 + 0.3 * Math.sin(t * 4)})`; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 32, 24, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (s.boost > 0) {
      ctx.strokeStyle = 'rgba(92,242,160,0.5)'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s.x - facing * (30 + i * 9), s.y - 6 + i * 6); ctx.lineTo(s.x - facing * (48 + i * 12), s.y - 6 + i * 6); ctx.stroke(); }
    }
    if (s.magnet > 0) {
      ctx.strokeStyle = 'rgba(197,139,255,0.25)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(s.x, s.y, RULES.magnetRadius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  if (s.flare > 0) {
    ctx.fillStyle = `rgba(255,246,208,${0.06 + 0.06 * Math.min(1, s.flare)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (s.chain >= 2 && s.chainT > 0) {
    ctx.fillStyle = TEAL;
    ctx.font = '800 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`CHAIN ×${s.chain}`, s.x, s.y - 38);
    ctx.fillStyle = 'rgba(127,245,230,0.3)';
    ctx.fillRect(s.x - 20, s.y - 30, 40, 2);
    ctx.fillStyle = TEAL;
    ctx.fillRect(s.x - 20, s.y - 30, 40 * (s.chainT / RULES.chainWindow), 2);
  }
  if (fx.bossFlash > 0) {
    ctx.fillStyle = `rgba(255,120,80,${0.3 * fx.bossFlash})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (fx.fade > 0) {
    ctx.fillStyle = `rgba(0,4,8,${fx.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}
