import { toLogical, type View } from './canvas';

export interface PointerHooks {
  down?: (x: number, y: number) => void;
  move?: (x: number, y: number) => void;
  up?: (x: number, y: number) => void;
}

/** Pointer-Events auf logische Koordinaten. Nur der erste Finger zählt. */
export function bindPointer(view: View, hooks: PointerHooks): void {
  const el = view.canvas;
  let activeId: number | null = null;
  el.style.touchAction = 'none';

  el.addEventListener('pointerdown', (e) => {
    if (activeId !== null) return;
    activeId = e.pointerId;
    el.setPointerCapture(e.pointerId);
    const p = toLogical(view, e.clientX, e.clientY);
    hooks.down?.(p.x, p.y);
    e.preventDefault();
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activeId) return;
    const p = toLogical(view, e.clientX, e.clientY);
    hooks.move?.(p.x, p.y);
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId !== activeId) return;
    activeId = null;
    const p = toLogical(view, e.clientX, e.clientY);
    hooks.up?.(p.x, p.y);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}
