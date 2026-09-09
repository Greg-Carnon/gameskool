import type { Style, TemplateId } from './rules';

export interface Component {
  id: number;
  template: TemplateId;
  violationId: string | null;
  violationLabel: string | null;
  style: Style;
  title: string;
  body: string;
  cta: string;
  y: number;
  h: number;
  speed: number;
  phase: 'falling' | 'rejected';
  anim: number;
}

export interface Built {
  template: TemplateId;
  slop: boolean;
}

export interface State {
  t: number;
  nextId: number;
  components: Component[];
  built: Built[];
  score: number;
  best: number;
  combo: number;
  bestCombo: number;
  strikes: number;
  spawnAcc: number;
  over: boolean;
  lastMistake: string | null;
}

export function createState(best: number): State {
  return {
    t: 0, nextId: 1, components: [], built: [],
    score: 0, best, combo: 0, bestCombo: 0, strikes: 0,
    spawnAcc: 99, over: false, lastMistake: null,
  };
}
