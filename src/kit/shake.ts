/** Trauma-basierter Screen Shake: Stärke klingt quadratisch ab. */
export class Shake {
  private trauma = 0;
  private t = 0;
  constructor(private maxOffset = 12, private decay = 2.5) {}

  add(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(dt: number): void {
    this.t += dt;
    this.trauma = Math.max(0, this.trauma - this.decay * dt);
  }

  offset(): { x: number; y: number } {
    const s = this.trauma * this.trauma;
    if (s <= 0) return { x: 0, y: 0 };
    return {
      x: this.maxOffset * s * Math.sin(this.t * 71.3),
      y: this.maxOffset * s * Math.cos(this.t * 53.7),
    };
  }
}
