import { H, W } from '../kit/canvas';
import { easeOutBack, easeOutCubic, lerp } from '../kit/tween';
import { drawBubble, drawJack, type Pose } from './jack';
import { RULES, type Style } from './rules';
import type { Component, State } from './state';

export interface UiFx {
  t: number;
  pose: Pose;
  poseT: number;
  bubble: string | null;
  bubbleT: number;
  comboGlow: number;   // 0..1
  slopFlash: number;   // 0..1, klingt ab
}

const INK = '#0a0b10';
const PAPER = '#f4f1ea';
const GREEN = '#5cf2a0';
const SLOP_A = '#7b3fe4';
const SLOP_B = '#e44fb0';

export const PHONE = { x: 222, y: 522, w: 132, h: 236, r: 20 };
export const JACK = { x: 108, y: 640, scale: 0.78 };
const MINI = 0.36;

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

function slopGradient(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): CanvasGradient {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, SLOP_A);
  g.addColorStop(1, SLOP_B);
  return g;
}

function surface(ctx: CanvasRenderingContext2D, s: Style, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x, y + 6, w, h, s.radius);
  ctx.fill();
  roundRect(ctx, x, y, w, h, s.radius);
  ctx.fillStyle = s.gradient ? slopGradient(ctx, x, y, w, h) : s.surface;
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,241,234,0.10)';
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

/** Zeichnet eine Komponente mit linker oberer Ecke bei (x, y), Breite RULES.field.w. */
export function drawComponentAt(ctx: CanvasRenderingContext2D, c: Component, x: number, y: number): void {
  const s = c.style;
  const w = RULES.field.w;
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
      let lx = tx + 60;
      for (const l of ['Work', 'About', 'Contact']) {
        ctx.fillText(l, lx, y + h / 2);
        lx += ctx.measureText(l).width + 22;
      }
      break;
    }
  }
}

function drawStudio(ctx: CanvasRenderingContext2D, fx: UiFx): void {
  // Grundton
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  // LED-Schein unten links, wächst mit Combo
  const glow = 0.22 + 0.45 * fx.comboGlow;
  const g1 = ctx.createRadialGradient(40, H, 10, 40, H, 420);
  g1.addColorStop(0, `rgba(92,242,160,${glow})`);
  g1.addColorStop(1, 'rgba(92,242,160,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  // Zweiter, kühler Schein oben rechts
  const g2 = ctx.createRadialGradient(W, 0, 10, W, 0, 360);
  g2.addColorStop(0, 'rgba(92,242,160,0.08)');
  g2.addColorStop(1, 'rgba(92,242,160,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
  // LED-Streifen an der Wand
  ctx.fillStyle = `rgba(92,242,160,${0.5 + 0.5 * fx.comboGlow})`;
  ctx.fillRect(0, 512, 3, H - 512);
  // Pflanze links hinter Jack
  ctx.fillStyle = '#13251f';
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.36;
    ctx.save();
    ctx.translate(26, 640);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -46, 12, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#1a1712';
  roundRect(ctx, 6, 636, 40, 40, 6);
  ctx.fill();
  // Mikrofon am Arm von rechts oben ins Bild
  ctx.strokeStyle = '#2a2d36';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W + 10, 560);
  ctx.lineTo(300, 600);
  ctx.lineTo(206, 596);
  ctx.stroke();
  ctx.fillStyle = '#3a3d47';
  roundRect(ctx, 172, 580, 40, 30, 14);
  ctx.fill();
  ctx.fillStyle = '#1f2129';
  for (let i = 0; i < 4; i++) ctx.fillRect(178 + i * 8, 586, 4, 18);
}

function drawFeedFrame(ctx: CanvasRenderingContext2D): void {
  const { x, w, acceptY } = RULES.field;
  ctx.fillStyle = 'rgba(244,241,234,0.03)';
  roundRect(ctx, x - 8, 56, w + 16, acceptY - 56, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,241,234,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = '800 10px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(244,241,234,0.35)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('AI FEED', x + 4, 72);
  // Akzeptanzlinie
  ctx.strokeStyle = 'rgba(92,242,160,0.5)';
  ctx.setLineDash([5, 7]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, acceptY);
  ctx.lineTo(x + w + 8, acceptY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = GREEN;
  ctx.textAlign = 'right';
  ctx.fillText('INTO THE SITE ↓', x + w + 4, acceptY - 6);
}

function drawPhone(ctx: CanvasRenderingContext2D, s: State, fx: UiFx): void {
  const { x, y, w, h, r } = PHONE;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, x, y + 8, w, h, r);
  ctx.fill();
  ctx.fillStyle = '#1b1e27';
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,241,234,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Display
  const dx = x + 7, dy = y + 7, dw = w - 14, dh = h - 14;
  ctx.save();
  roundRect(ctx, dx, dy, dw, dh, r - 6);
  ctx.clip();
  ctx.fillStyle = fx.slopFlash > 0 ? `rgba(123,63,228,${0.25 * fx.slopFlash})` : '#0e1017';
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = '#0e1017';
  if (fx.slopFlash <= 0) ctx.fillRect(dx, dy, dw, dh);
  // Gebaute Komponenten gestapelt, neueste unten
  const gap = 4;
  let total = 0;
  for (const b of s.built) total += b.h * MINI + gap;
  let cy = dy + 12 + Math.min(0, dh - 16 - total);
  const innerX = dx + (dw - RULES.field.w * MINI) / 2;
  for (const b of s.built) {
    ctx.save();
    ctx.translate(innerX, cy);
    ctx.scale(MINI, MINI);
    drawComponentAt(ctx, b.component, 0, 0);
    ctx.restore();
    cy += b.h * MINI + gap;
  }
  if (s.built.length === 0) {
    ctx.fillStyle = 'rgba(244,241,234,0.3)';
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('your site', dx + dw / 2, dy + dh / 2);
  }
  ctx.restore();
  // Notch
  ctx.fillStyle = '#1b1e27';
  roundRect(ctx, x + w / 2 - 18, y + 4, 36, 8, 4);
  ctx.fill();
  // Label
  ctx.fillStyle = 'rgba(244,241,234,0.4)';
  ctx.font = '800 10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('$10,000 WEBSITE', x + w / 2, y + h + 18);
}

export function render(ctx: CanvasRenderingContext2D, s: State, fx: UiFx): void {
  drawStudio(ctx, fx);
  drawFeedFrame(ctx);

  // Fallende und animierte Komponenten
  const fieldX = RULES.field.x;
  for (const c of s.components) {
    if (c.phase === 'falling') {
      drawComponentAt(ctx, c, fieldX, c.y);
    } else if (c.phase === 'rejected') {
      const k = easeOutCubic(Math.min(1, c.anim / 0.35));
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.translate(fieldX + RULES.field.w / 2 - 260 * k, c.y + c.h / 2 - 40 * k);
      ctx.rotate(-0.5 * k);
      ctx.scale(1 - 0.3 * k, 1 - 0.3 * k);
      drawComponentAt(ctx, c, -RULES.field.w / 2, -c.h / 2);
      ctx.restore();
    } else {
      // accepted: schrumpft ins Phone
      const k = easeOutCubic(Math.min(1, c.anim / 0.45));
      const tx = PHONE.x + PHONE.w / 2;
      const ty = PHONE.y + PHONE.h - 30;
      const cx = lerp(fieldX + RULES.field.w / 2, tx, k);
      const cy = lerp(c.y + c.h / 2, ty, k);
      const sc = lerp(1, MINI, k);
      ctx.save();
      ctx.globalAlpha = 1 - Math.max(0, k - 0.8) * 5;
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      drawComponentAt(ctx, c, -RULES.field.w / 2, -c.h / 2);
      ctx.restore();
    }
  }

  drawPhone(ctx, s, fx);
  drawJack(ctx, JACK.x, JACK.y, JACK.scale, fx.pose, fx.poseT, fx.t);

  if (fx.bubble) {
    const k = easeOutBack(Math.min(1, fx.bubbleT / 0.25));
    const alpha = fx.bubbleT > 1.2 ? Math.max(0, 1 - (fx.bubbleT - 1.2) / 0.3) : 1;
    ctx.save();
    ctx.translate(150, 500);
    ctx.scale(k, k);
    drawBubble(ctx, 0, 0, fx.bubble, alpha);
    ctx.restore();
  }

  // Slop-Flash über allem
  if (fx.slopFlash > 0) {
    ctx.fillStyle = `rgba(255,94,94,${0.25 * fx.slopFlash})`;
    ctx.fillRect(0, 0, W, H);
  }
  void PAPER;
}
