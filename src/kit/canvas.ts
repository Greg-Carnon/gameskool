/**
 * Logisches Hochformat 390 x 780. Wird zentriert in den Viewport skaliert (Letterbox).
 * Alle Spielkoordinaten sind logisch, die Umrechnung passiert hier.
 */
export const W = 390;
export const H = 780;

export interface View {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dpr: number;
  scale: number;
  offX: number;
  offY: number;
}

export function createView(canvas: HTMLCanvasElement): View {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D nicht verfügbar');
  const view: View = { canvas, ctx, dpr: 1, scale: 1, offX: 0, offY: 0 };
  const resize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * view.dpr);
    canvas.height = Math.round(vh * view.dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    view.scale = Math.min(vw / W, vh / H);
    view.offX = (vw - W * view.scale) / 2;
    view.offY = (vh - H * view.scale) / 2;
  };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  return view;
}

/** Vor dem Zeichnen aufrufen: löscht den Frame und setzt die logische Transformation. */
export function beginFrame(view: View, background: string): void {
  const { ctx, canvas, dpr, scale, offX, offY } = view;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, offX * dpr, offY * dpr);
}

export function toLogical(view: View, clientX: number, clientY: number): { x: number; y: number } {
  return { x: (clientX - view.offX) / view.scale, y: (clientY - view.offY) / view.scale };
}
