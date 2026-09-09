import { H, W } from '../kit/canvas';
import { easeOutCubic } from '../kit/tween';
import { RULES, type Style } from './rules';
import type { Component, State } from './state';

const BG = '#0b0d14';
const STRIP_BG = '#10131d';
const SLOP_A = '#7b3fe4';
const SLOP_B = '#e44fb0';

function font(s: Style, size: number, heading: boolean): string {
  return `${heading ? s.headingWeight : s.bodyWeight} ${size}px ${heading ? s.headingFamily : s.bodyFamily}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function surface(ctx: CanvasRenderingContext2D, s: Style, x: number, y: number, w: number, h: number): void {
  roundRect(ctx, x, y, w, h, s.radius);
  if (s.gradient) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, SLOP_A);
    g.addColorStop(1, SLOP_B);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = s.surface;
  }
  ctx.fill();
  ctx.strokeStyle = '#262c3b';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function button(ctx: CanvasRenderingContext2D, s: Style, x: number, y: number, w: number, h: number, label: string): void {
  roundRect(ctx, x, y, w, h, s.radius);
  ctx.fillStyle = s.accent;
  ctx.fill();
  ctx.fillStyle = s.accentText;
  ctx.font = font(s, 16, true);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2 + s.textOffsetX, y + h / 2, w - 16);
}

function icon(ctx: CanvasRenderingContext2D, s: Style, cx: number, cy: number): void {
  const r = s.iconSize / 2;
  if (s.iconBlob) {
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r * 1.2);
    g.addColorStop(0, '#c58bff');
    g.addColorStop(1, '#5a2ea6');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.15, r * 0.95, 0.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.35, cy);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.3);
  ctx.lineTo(cx + r * 0.4, cy - r * 0.3);
  ctx.stroke();
}

function drawComponent(ctx: CanvasRenderingContext2D, c: Component): void {
  const s = c.style;
  const x = RULES.field.x;
  const w = RULES.field.w;
  const y = c.y;
  const h = c.h;
  const p = s.pad;
  const tx = x + p + s.textOffsetX;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  switch (c.template) {
    case 'button':
      surface(ctx, s, x, y, w, h);
      button(ctx, s, x + p, y + 12, w - 2 * p, h - 24, c.cta);
      break;
    case 'card':
      surface(ctx, s, x, y, w, h);
      ctx.fillStyle = s.text;
      ctx.font = font(s, 20, true);
      ctx.fillText(c.title, tx, y + p + 18, w - 2 * p);
      ctx.fillStyle = s.muted;
      ctx.font = font(s, 14, false);
      ctx.fillText(c.body, tx, y + p + 44, w - 2 * p);
      if (s.ctaCount === 2) {
        button(ctx, s, x + p, y + h - p - 40, (w - 3 * p) / 2, 40, c.cta);
        button(ctx, s, x + p * 2 + (w - 3 * p) / 2, y + h - p - 40, (w - 3 * p) / 2, 40, 'Learn more');
      } else {
        button(ctx, s, x + p, y + h - p - 40, 140, 40, c.cta);
      }
      break;
    case 'hero':
      surface(ctx, s, x, y, w, h);
      ctx.fillStyle = s.text;
      ctx.font = font(s, 28, true);
      ctx.fillText(c.title, tx, y + p + 26, w - 2 * p);
      ctx.fillStyle = s.muted;
      ctx.font = font(s, 15, false);
      ctx.fillText(c.body, tx, y + p + 56, w - 2 * p);
      if (s.ctaCount === 2) {
        button(ctx, s, x + p, y + h - p - 44, (w - 3 * p) / 2, 44, c.cta);
        button(ctx, s, x + p * 2 + (w - 3 * p) / 2, y + h - p - 44, (w - 3 * p) / 2, 44, 'Learn more');
      } else {
        button(ctx, s, x + p, y + h - p - 44, 160, 44, c.cta);
      }
      break;
    case 'tile':
      surface(ctx, s, x, y, w, h);
      icon(ctx, s, x + p + 20, y + h / 2);
      ctx.fillStyle = s.text;
      ctx.font = font(s, 18, true);
      ctx.textBaseline = 'middle';
      ctx.fillText(c.title, tx + 52, y + h / 2, w - 2 * p - 52);
      break;
    case 'stat':
      surface(ctx, s, x, y, w, h);
      ctx.fillStyle = s.accent;
      ctx.font = font(s, 34, true);
      ctx.fillText(c.title, tx, y + p + 32, w - 2 * p);
      ctx.fillStyle = s.muted;
      ctx.font = font(s, 14, false);
      ctx.fillText(c.body, tx, y + p + 58, w - 2 * p);
      break;
    case 'nav': {
      surface(ctx, s, x, y, w, h);
      icon(ctx, s, x + p + 12, y + h / 2);
      ctx.fillStyle = s.text;
      ctx.font = font(s, 14, false);
      ctx.textBaseline = 'middle';
      const links = ['Work', 'About', 'Contact'];
      let lx = tx + 60;
      for (const l of links) {
        ctx.fillText(l, lx, y + h / 2);
        lx += ctx.measureText(l).width + 22;
      }
      break;
    }
  }
}

function drawStrip(ctx: CanvasRenderingContext2D, s: State): void {
  const y0 = RULES.field.stripY;
  ctx.fillStyle = STRIP_BG;
  ctx.fillRect(0, y0, W, H - y0);
  ctx.fillStyle = '#262c3b';
  ctx.fillRect(0, y0, W, 1);
  ctx.fillStyle = '#6b7385';
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('YOUR $10,000 WEBSITE', RULES.field.x, y0 + 20);
  const cell = 20;
  const gap = 4;
  const startX = RULES.field.x;
  const perRow = Math.floor(RULES.field.w / (cell + gap));
  s.built.forEach((b, i) => {
    const cx = startX + (i % perRow) * (cell + gap);
    const cy = y0 + 30 + Math.floor(i / perRow) * (cell + gap);
    roundRect(ctx, cx, cy, cell, cell, 4);
    if (b.slop) {
      const g = ctx.createLinearGradient(cx, cy, cx + cell, cy + cell);
      g.addColorStop(0, SLOP_A);
      g.addColorStop(1, SLOP_B);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = '#2b3345';
    }
    ctx.fill();
  });
}

export function render(ctx: CanvasRenderingContext2D, s: State): void {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Akzeptanzlinie
  ctx.strokeStyle = 'rgba(92, 242, 160, 0.35)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(RULES.field.x, RULES.field.acceptY);
  ctx.lineTo(RULES.field.x + RULES.field.w, RULES.field.acceptY);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const c of s.components) {
    if (c.phase === 'rejected') {
      const k = easeOutCubic(Math.min(1, c.anim / 0.3));
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.translate(RULES.field.x + RULES.field.w / 2, c.y + c.h / 2);
      ctx.rotate(-0.25 * k);
      ctx.translate(-(RULES.field.x + RULES.field.w / 2) - 220 * k, -(c.y + c.h / 2));
      drawComponent(ctx, c);
      ctx.restore();
    } else {
      drawComponent(ctx, c);
    }
  }

  drawStrip(ctx, s);
}
