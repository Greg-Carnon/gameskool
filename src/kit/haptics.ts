/** Vibration nur auf Android verlässlich, iOS ignoriert es still. Nie bei jedem Tap. */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* still */
  }
}
