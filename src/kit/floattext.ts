import { easeOutCubic } from './tween';

interface FT { alive: boolean; text: string; x: number; y: number; life: number; maxLife: number; color: string; size: number; font: string; rot: number }

/** Aufsteigende Texte: Punkte, Combos, Stempel. */
export class FloatText {
  private pool: FT[];
  private next = 0;
  constructor(capacity = 24, private family = 'Inter, system-ui, sans-serif') {
    this.pool = Array.from({ length: capacity }, () => ({ alive: false, text: '', x: 0, y: 0, life: 0, maxLife: 1, color: '#fff', size: 20, font: '', rot: 0 }));
  }
  add(text: string, x: number, y: number, o: { color?: string; size?: number; life?: number; weight?: number; family?: string; rot?: number } = {}): void {
    const f = this.pool[this.next];
    this.next = (this.next + 1) % this.pool.length;
    f.alive = true; f.text = text; f.x = x; f.y = y;
    f.maxLife = o.life ?? 0.8; f.life = f.maxLife;
    f.color = o.color ?? '#ffffff'; f.size = o.size ?? 22;
    f.font = `${o.weight ?? 800} ${f.size}px ${o.family ?? this.family}`;
    f.rot = o.rot ?? 0;
  }
  update(dt: number): void {
    for (const f of this.pool) if (f.alive && (f.life -= dt) <= 0) f.alive = false;
  }
  draw(ctx: CanvasRenderingContext2D): void {
    for (const f of this.pool) {
      if (!f.alive) continue;
      const p = 1 - f.life / f.maxLife;
      const k = easeOutCubic(Math.min(1, p * 1.6));
      ctx.save();
      ctx.globalAlpha = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
      ctx.translate(f.x, f.y - 26 * k);
      ctx.rotate(f.rot);
      ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
      ctx.font = f.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }
  }
}
