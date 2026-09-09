/**
 * Das Design System ist die Wahrheit. Slop ist eine gezielte Verletzung davon.
 * Alle Tuning-Zahlen des Spiels stehen ebenfalls hier.
 */
export const DS = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  headingWeight: 700,
  bodyWeight: 400,
  radius: 12,
  pad: 16,
  iconSize: 24,
  colors: {
    surface: '#161a26',
    line: '#262c3b',
    text: '#eef1f6',
    muted: '#9aa3b5',
    accent: '#5cf2a0',
    accentText: '#08110c',
  },
};

export type TemplateId = 'button' | 'card' | 'hero' | 'tile' | 'stat' | 'nav';
export const TEMPLATES: TemplateId[] = ['button', 'card', 'hero', 'tile', 'stat', 'nav'];

export interface Style {
  headingFamily: string;
  bodyFamily: string;
  headingWeight: number;
  bodyWeight: number;
  radius: number;
  pad: number;
  iconSize: number;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  gradient: boolean;
  textOffsetX: number;
  ctaCount: 1 | 2;
  emojiSuffix: string;
  titleOverride: string | null;
  bodyOverride: string | null;
  iconBlob: boolean;
}

export function baseStyle(): Style {
  return {
    headingFamily: DS.fontFamily,
    bodyFamily: DS.fontFamily,
    headingWeight: DS.headingWeight,
    bodyWeight: DS.bodyWeight,
    radius: DS.radius,
    pad: DS.pad,
    iconSize: DS.iconSize,
    surface: DS.colors.surface,
    text: DS.colors.text,
    muted: DS.colors.muted,
    accent: DS.colors.accent,
    accentText: DS.colors.accentText,
    gradient: false,
    textOffsetX: 0,
    ctaCount: 1,
    emojiSuffix: '',
    titleOverride: null,
    bodyOverride: null,
    iconBlob: false,
  };
}

export interface Violation {
  id: string;
  tier: 1 | 2 | 3;
  /** Erklärung im Game-Over-Screen, der Lern-Moment. */
  label: string;
  appliesTo: TemplateId[];
  apply: (s: Style) => void;
}

const ALL: TemplateId[] = TEMPLATES;
const WITH_BUTTON: TemplateId[] = ['button', 'card', 'hero'];
const WITH_ICON: TemplateId[] = ['tile', 'nav'];
const WITH_BODY: TemplateId[] = ['card', 'hero'];
const WITH_TITLE: TemplateId[] = ['card', 'hero', 'tile', 'stat'];

export const VIOLATIONS: Violation[] = [
  { id: 'comicFont', tier: 1, label: 'Comic Sans. Never.', appliesTo: ALL,
    apply: (s) => { s.headingFamily = s.bodyFamily = '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive'; } },
  { id: 'purpleGradient', tier: 1, label: 'The purple AI gradient.', appliesTo: ALL,
    apply: (s) => { s.gradient = true; } },
  { id: 'emojiSpam', tier: 1, label: 'Emoji spam in a headline.', appliesTo: WITH_TITLE,
    apply: (s) => { s.emojiSuffix = ' 🚀✨🔥'; } },
  { id: 'loremIpsum', tier: 1, label: 'Lorem ipsum left in production.', appliesTo: WITH_BODY,
    apply: (s) => { s.bodyOverride = 'Lorem ipsum dolor sit amet, consectetur.'; } },
  { id: 'certainly', tier: 1, label: '"Certainly!" is not a headline.', appliesTo: WITH_TITLE,
    apply: (s) => { s.titleOverride = 'Certainly! Here is your headline'; } },
  { id: 'blobIcon', tier: 1, label: 'The generic AI blob icon.', appliesTo: WITH_ICON,
    apply: (s) => { s.iconBlob = true; } },

  { id: 'mixedFonts', tier: 2, label: 'Serif heading, sans body. Pick one.', appliesTo: WITH_TITLE,
    apply: (s) => { s.headingFamily = 'Georgia, "Times New Roman", serif'; } },
  { id: 'misaligned', tier: 2, label: 'Text off the grid by 9 px.', appliesTo: ALL,
    apply: (s) => { s.textOffsetX = 9; } },
  { id: 'lowContrast', tier: 2, label: 'Button text with no contrast.', appliesTo: WITH_BUTTON,
    apply: (s) => { s.accentText = '#4fd18a'; } },
  { id: 'doubleCTA', tier: 2, label: 'Two primary buttons. Which one?', appliesTo: WITH_BODY,
    apply: (s) => { s.ctaCount = 2; } },
  { id: 'wrongIconSize', tier: 2, label: 'Icon at 40 px instead of 24.', appliesTo: WITH_ICON,
    apply: (s) => { s.iconSize = 40; } },

  { id: 'wrongRadius', tier: 3, label: 'Radius 22 instead of 12.', appliesTo: ALL,
    apply: (s) => { s.radius = 22; } },
  { id: 'offPalette', tier: 3, label: 'Accent slightly off palette.', appliesTo: WITH_BUTTON,
    apply: (s) => { s.accent = '#9df25c'; } },
  { id: 'wrongWeight', tier: 3, label: 'Heading in regular weight.', appliesTo: WITH_TITLE,
    apply: (s) => { s.headingWeight = 400; } },
];

export const RULES = {
  field: { x: 45, w: 300, acceptY: 600, stripY: 640 },
  fall: { timeStart: 3.2, timeEnd: 1.3, rampSeconds: 120, spawnGap: 0.62 },
  slopProbability: 0.42,
  tierAt: [0, 30, 75] as const,
  strikes: 3,
  score: { perCorrect: 10, comboStep: 5 },
  levels: [
    { min: 0, name: 'Intern' },
    { min: 150, name: 'Junior Designer' },
    { min: 450, name: 'Senior Designer' },
    { min: 900, name: 'Jack' },
  ],
};
