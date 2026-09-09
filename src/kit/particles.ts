export interface EmitOptions {
  x: number;
  y: number;
  count: number;
  speed: number;
  life: number;
  color: string;
  size?: number;
  gravity?: number;
  spread?: number;
  angle?: number;
}

interface P {
  alive: boolean;
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string; gravity: number;
}

/** Fester Pool, keine Allokation im Spiel. */
export class Particles {
  private pool: P[];
  private next = 0;

  constructor(capacity = 400) {
    this.pool = Array.from({ length: capacity }, () => ({
      alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#fff', gravity: 0,
    }));
  }

  emit(o: EmitOptions): void {
    const spread = o.spread ?? Math.PI * 2;
    const base = o.angle ?? 0;
    for (let i = 0; i < o.count; i++) {
      const p = this.pool[this.next];
      this.next = (this.next + 1) % this.pool.length;
      const a = base + (Math.random() - 0.5) * spread;
      const s = o.speed * (0.5 + Math.random());
      p.alive = true;
      p.x = o.x; p.y = o.y;
      p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s;
      p.maxLife = o.life * (0.7 + Math.random() * 0.6);
      p.life = p.maxLife;
      p.size = o.size ?? 3;
      p.color = o.color;
      p.gravity = o.gravity ?? 0;
    }
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; continue; }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98; p.vy *= 0.98;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.pool) {
      if (!p.alive) continue;
      const t = p.life / p.maxLife;
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      const r = p.size * (0.3 + 0.7 * t);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
