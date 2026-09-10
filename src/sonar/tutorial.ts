import { RULES, type State } from './logic';

export type TutStage = 'tap' | 'pearl' | 'hold' | 'hatch' | 'done';

/** Hinweise als Zeichen, nicht als Text. Ein Wort pro Schritt. */
export function drawTutorial(ctx: CanvasRenderingContext2D, s: State, stage: TutStage, t: number): void {
  if (stage === 'done' || !s.alive || s.transition > 0) return;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  ctx.save();
  ctx.font = '800 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineCap = 'round';
  if (stage === 'tap' || stage === 'hold') {
    const x = s.x, y = s.y + 120;
    // Fingerpunkt
    ctx.strokeStyle = `rgba(127,245,230,${0.4 + 0.5 * pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, 14 + pulse * 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(127,245,230,0.9)';
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    if (stage === 'hold') {
      // wachsender Ring wie beim Laden
      const k = (t % 1.2) / 1.2;
      ctx.strokeStyle = k > 0.9 ? '#fff6d0' : 'rgba(255,246,208,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, k * 1.2)); ctx.stroke();
    }
    ctx.fillStyle = '#7ff5e6';
    ctx.fillText(stage === 'tap' ? 'TAP' : 'HOLD', x, y + 48);
  } else if (stage === 'pearl') {
    const pearl = s.objects.filter((o) => o.kind === 'pearl').sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
    if (!pearl) { ctx.restore(); return; }
    arrow(ctx, s.x, s.y, pearl.x, pearl.y, pulse);
    ctx.fillStyle = '#fff6d0';
    ctx.fillText('PEARL', pearl.x, pearl.y - 30);
  } else if (stage === 'hatch') {
    arrow(ctx, s.x, s.y, RULES.hatch.x, RULES.hatch.y, pulse);
    ctx.fillStyle = '#7ff5e6';
    ctx.fillText('GO DEEPER', RULES.hatch.x, RULES.hatch.y - RULES.hatch.r - 30);
  }
  ctx.restore();
}

function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, pulse: number): void {
  const dx = x2 - x1, dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  if (d < 60) return;
  const ux = dx / d, uy = dy / d;
  const sx = x1 + ux * 40, sy = y1 + uy * 40;
  const ex = x2 - ux * 36, ey = y2 - uy * 36;
  ctx.strokeStyle = `rgba(255,246,208,${0.5 + 0.4 * pulse})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = -pulse * 16;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = `rgba(255,246,208,${0.6 + 0.4 * pulse})`;
  ctx.beginPath();
  ctx.moveTo(ex + ux * 12, ey + uy * 12);
  ctx.lineTo(ex - uy * 7, ey + ux * 7);
  ctx.lineTo(ex + uy * 7, ey - ux * 7);
  ctx.closePath(); ctx.fill();
}
