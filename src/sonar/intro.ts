import { drawJack } from '../jack-vs-slop/jack';

/** Drei Bilder, je ein Satz. Gezeichnet, nicht geladen. */
export const INTRO_LINES = [
  '2026. The surface is drowning in AI slop.',
  "Jack can't take it anymore. He takes the sub.",
  'Pearls are the last real things. 160 m down, something guards them.',
];

const SLOP_A = '#7b3fe4';
const SLOP_B = '#e44fb0';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function slopCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, label: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, SLOP_A); g.addColorStop(1, SLOP_B);
  ctx.fillStyle = g;
  roundRect(ctx, -w / 2, -h / 2, w, h, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `700 ${Math.round(h * 0.32)}px "Comic Sans MS", "Comic Neue", cursive`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0, w - 12);
  ctx.restore();
}

function bigSub(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0b12e';
  ctx.beginPath(); ctx.ellipse(0, 4, 20, 7, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-6, -18, 12, 9);
  ctx.fillRect(-1, -24, 2, 7);
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 2.5;
  const p = Math.sin(t * 25) * 6;
  ctx.beginPath(); ctx.moveTo(-24, -p); ctx.lineTo(-24, p); ctx.stroke();
  // Großes Bullauge mit Jack
  ctx.fillStyle = '#c9f5ff';
  ctx.beginPath(); ctx.arc(6, -1, 7.5, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(6, -1, 7.5, 0, Math.PI * 2); ctx.clip();
  drawJack(ctx, 6, 8, 0.075, 'idle', 0, t);
  ctx.restore();
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(6, -1, 7.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff6d0';
  ctx.beginPath(); ctx.arc(20, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawIntroFrame(ctx: CanvasRenderingContext2D, frame: number, t: number, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  if (frame === 0) {
    // Studio, Slop steigt
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.2, h, 10, w * 0.2, h, 260);
    g.addColorStop(0, 'rgba(92,242,160,0.25)'); g.addColorStop(1, 'rgba(92,242,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const labels = ['Certainly!', 'Lorem ipsum', '🚀✨🔥', 'Here is your', 'AI slop', 'Synergy'];
    for (let i = 0; i < 9; i++) {
      const k = ((t * 0.12 + i * 0.13) % 1);
      const x = 40 + ((i * 71) % (w - 80)) + Math.sin(t + i) * 10;
      const y = h + 40 - k * (h + 120);
      slopCard(ctx, x, y, 96 + (i % 3) * 18, 34 + (i % 2) * 10, Math.sin(i) * 0.3, labels[i % labels.length]);
    }
    drawJack(ctx, w / 2, h - 30, 0.62, 'facepalm', 0.3 + Math.abs(Math.sin(t)) * 0.2, t);
  } else if (frame === 1) {
    ctx.fillStyle = '#031a24';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b3a48'); g.addColorStop(1, '#020a12');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Oberfläche oben, Slop-Karten treiben darauf
    ctx.fillStyle = 'rgba(200,240,255,0.15)';
    ctx.fillRect(0, 30, w, 3);
    for (let i = 0; i < 5; i++) slopCard(ctx, 40 + i * 78, 20 + Math.sin(t * 2 + i) * 3, 60, 22, 0, 'slop');
    // Blasen
    ctx.fillStyle = 'rgba(200,240,255,0.35)';
    for (let i = 0; i < 12; i++) {
      const k = (t * 0.2 + i * 0.09) % 1;
      ctx.beginPath(); ctx.arc(w / 2 - 40 + Math.sin(i * 3 + t) * 30, h - k * h, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
    }
    bigSub(ctx, w / 2, h / 2 + 10 + Math.sin(t * 1.5) * 6, 4.2, t);
    // Lichtkegel
    const cone = ctx.createLinearGradient(w / 2 + 90, 0, w, 0);
    cone.addColorStop(0, 'rgba(255,246,208,0.18)'); cone.addColorStop(1, 'rgba(255,246,208,0)');
    ctx.fillStyle = cone;
    ctx.beginPath(); ctx.moveTo(w / 2 + 84, h / 2 - 4); ctx.lineTo(w, h / 2 - 90); ctx.lineTo(w, h / 2 + 100); ctx.lineTo(w / 2 + 84, h / 2 + 12); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = '#020a12';
    ctx.fillRect(0, 0, w, h);
    // Tiefenskala mit Marke
    ctx.strokeStyle = 'rgba(127,245,230,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(40, h - 30); ctx.stroke();
    ctx.font = '700 12px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    [['20 m', 0.1], ['45 m', 0.25], ['80 m', 0.42], ['120 m', 0.6]].forEach(([l, k]) => {
      const y = 30 + (h - 60) * (k as number);
      ctx.fillStyle = 'rgba(127,245,230,0.6)';
      ctx.beginPath(); ctx.arc(40, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(l as string, 52, y);
    });
    const by = 30 + (h - 60) * 0.82;
    ctx.fillStyle = '#ff9a5c';
    ctx.beginPath(); ctx.arc(40, by, 6 + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.fill();
    ctx.font = '800 14px Inter, system-ui, sans-serif';
    ctx.fillText('160 m · THE ANGLER', 52, by);
    // Perle mit Glow
    const px = w * 0.68, py = h * 0.55;
    const pg = ctx.createRadialGradient(px, py, 2, px, py, 70);
    pg.addColorStop(0, 'rgba(255,240,200,0.9)'); pg.addColorStop(0.3, 'rgba(255,220,150,0.35)'); pg.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff7e0'; ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - 4, py - 4, 4, 0, Math.PI * 2); ctx.fill();
    // Köderlicht und Zähne im Dunkeln
    const lx = w * 0.7, ly = h * 0.86;
    const lg = ctx.createRadialGradient(lx, ly, 1, lx, ly, 30);
    lg.addColorStop(0, 'rgba(255,246,208,0.9)'); lg.addColorStop(1, 'rgba(255,246,208,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, ly, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,240,242,0.35)';
    for (let i = 0; i < 7; i++) {
      const tx = lx - 60 + i * 12;
      ctx.beginPath(); ctx.moveTo(tx, ly + 30); ctx.lineTo(tx + 5, ly + 44); ctx.lineTo(tx + 10, ly + 30); ctx.closePath(); ctx.fill();
    }
    bigSub(ctx, w * 0.3, h * 0.2 + Math.sin(t * 1.5) * 4, 1.6, t);
  }
}
