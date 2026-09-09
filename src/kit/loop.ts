/**
 * Fester Timestep für die Logik (60 Hz), Rendering per requestAnimationFrame.
 * Pausiert bei verstecktem Tab und verhindert Zeitsprünge beim Zurückkommen.
 */
export interface LoopHooks {
  update: (dt: number) => void;
  render: () => void;
}

const STEP = 1 / 60;
const MAX_FRAME = 0.1;

export function startLoop(hooks: LoopHooks): { stop: () => void } {
  let last = performance.now();
  let acc = 0;
  let running = true;
  let raf = 0;

  const frame = (now: number) => {
    if (!running) return;
    let delta = (now - last) / 1000;
    last = now;
    if (delta > MAX_FRAME) delta = MAX_FRAME;
    acc += delta;
    while (acc >= STEP) {
      hooks.update(STEP);
      acc -= STEP;
    }
    hooks.render();
    raf = requestAnimationFrame(frame);
  };

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  raf = requestAnimationFrame(frame);

  return {
    stop: () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
