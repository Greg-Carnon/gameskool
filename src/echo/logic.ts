import { W } from '../kit/canvas';

export const GROUND = 560;
export const PX = 90;
export const R = 16;
const JUMP = -640;
const GRAVITY = 1900;

export interface Obstacle { x: number; w: number; h: number }
export interface Marker { x: number; y: number; run: number }
export interface Replay { frames: number[]; run: number }

export interface State {
  t: number;
  worldX: number;
  y: number;
  vy: number;
  speed: number;
  alive: boolean;
  frames: number[];
  obstacles: Obstacle[];
  nextObsX: number;
  markers: Marker[];
  replays: Replay[];
  frame: number;
  deathBy: 'obstacle' | 'echo' | null;
  deathRun: number;
  runNumber: number;
}

export function createState(markers: Marker[], replays: Replay[], runNumber: number): State {
  return {
    t: 0, worldX: 0, y: GROUND, vy: 0, speed: 220, alive: true, frames: [],
    obstacles: [], nextObsX: 420, markers, replays, frame: 0, deathBy: null, deathRun: 0, runNumber,
  };
}

export function speedAt(t: number): number {
  return Math.min(430, 220 + 5 * t);
}

export function jump(s: State): void {
  if (!s.alive || s.y < GROUND) return;
  s.vy = JUMP;
}

export function jumpCut(s: State): void {
  if (s.vy < -200) s.vy = -200;
}

function spawn(s: State, rng: () => number): void {
  while (s.nextObsX < s.worldX + W + 80) {
    const w = 22 + Math.floor(rng() * 22);
    const h = 28 + Math.floor(rng() * 46);
    s.obstacles.push({ x: s.nextObsX, w, h });
    s.nextObsX += 150 + rng() * 200 + Math.min(120, s.t * 3);
  }
  s.obstacles = s.obstacles.filter((o) => o.x + o.w > s.worldX - 60);
}

function hitsRect(cx: number, cy: number, rx: number, ry: number, rw: number, rh: number): boolean {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < (R - 3) ** 2;
}

export function update(s: State, dt: number, rng: () => number): void {
  if (!s.alive) return;
  s.t += dt;
  s.speed = speedAt(s.t);
  s.worldX += s.speed * dt;
  s.frame++;
  s.vy += GRAVITY * dt;
  s.y += s.vy * dt;
  if (s.y >= GROUND) { s.y = GROUND; s.vy = 0; }
  s.frames.push(s.y);
  spawn(s, rng);

  const cy = s.y - R;
  for (const o of s.obstacles) {
    if (hitsRect(PX, cy, o.x - s.worldX, GROUND - o.h, o.w, o.h)) {
      s.alive = false; s.deathBy = 'obstacle';
      return;
    }
  }
  for (const m of s.markers) {
    const sx = m.x - s.worldX;
    if ((sx - PX) ** 2 + (m.y - cy) ** 2 < (R * 1.5) ** 2) {
      s.alive = false; s.deathBy = 'echo'; s.deathRun = m.run;
      return;
    }
  }
}

export function distanceM(s: State): number {
  return Math.floor(s.worldX / 10);
}
