import { baseStyle, RULES, TEMPLATES, VIOLATIONS, type TemplateId, type Violation } from './rules';
import type { Component } from './state';

const TITLES = ['Ship faster', 'Automate everything', 'Meet Glaido', 'Your AI team', 'Design that sells', 'No more slop', 'Build in a weekend', 'Type with your voice'];
const BODIES = ['Battle-tested by real businesses.', 'One project teaches UI, logic and polish.', 'Everything here actually works.', 'From idea to live link in a day.', 'Less noise, more shipping.'];
const CTAS = ['Get started', 'Watch now', 'Book a call', 'Try it free', 'Join the community'];
const STATS = ['60,000+', '7 figures', '184', '$10,000', '99.9%'];

export const HEIGHTS: Record<TemplateId, number> = { button: 64, card: 150, hero: 180, tile: 88, stat: 100, nav: 64 };

export function tierAt(t: number): 1 | 2 | 3 {
  let tier: 1 | 2 | 3 = 1;
  if (t >= RULES.tierAt[1]) tier = 2;
  if (t >= RULES.tierAt[2]) tier = 3;
  return tier;
}

export function fallTime(t: number): number {
  const { timeStart, timeEnd, rampSeconds } = RULES.fall;
  const k = Math.min(1, t / rampSeconds);
  return timeStart + (timeEnd - timeStart) * k;
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function violationsFor(template: TemplateId, tier: 1 | 2 | 3): Violation[] {
  return VIOLATIONS.filter((v) => v.tier <= tier && v.appliesTo.includes(template));
}

export function spawnComponent(t: number, rng: () => number, id: number, forceSlop?: boolean): Component {
  const template = pick(TEMPLATES, rng);
  const h = HEIGHTS[template];
  const slop = forceSlop ?? rng() < RULES.slopProbability;
  const style = baseStyle();
  let violation: Violation | null = null;
  if (slop) {
    const pool = violationsFor(template, tierAt(t));
    violation = pick(pool, rng);
    violation.apply(style);
  }
  const title = style.titleOverride ?? (template === 'stat' ? pick(STATS, rng) : pick(TITLES, rng)) + style.emojiSuffix;
  return {
    id, template,
    violationId: violation?.id ?? null,
    violationLabel: violation?.label ?? null,
    style,
    title,
    body: style.bodyOverride ?? pick(BODIES, rng),
    cta: pick(CTAS, rng),
    y: -h,
    h,
    speed: (RULES.field.acceptY + h) / fallTime(t),
    phase: 'falling',
    anim: 0,
  };
}
