import { H, W } from '../kit/canvas';
import { easeOutBack, easeOutCubic } from '../kit/tween';
import type { Person, Slot } from './rules';
import { drawCharacter, type Cosmetics } from './characters';
import type { Theme } from './themes';

export const FLOOR_Y = 560;
export const URINAL_Y = 330;
export const DOOR_X = 0;

export interface Scene {
  slots: Slot[];
  playerX: number;
  playerTarget: number | null;
  playerT: number;
  playerState: 'door' | 'walking' | 'standing' | 'waiting' | 'shame';
  reactT: number;
  reactKind: 'none' | 'good' | 'bad' | 'wait';
  reactSlot: number;
  bubble: { x: number; y: number; text: string } | null;
  hover: number;
  t: number;
  theme: Theme;
  good: number[];   // nach einem Fehler: die Plätze, die richtig gewesen wären
  stallFree: boolean;
  showStall: boolean;
  late: { slot: number; x: number; t: number } | null;   // Nachzügler läuft ein
  mirror: { t: number; slot: number; done: boolean; wantsNod: boolean; answered: 'wall' | 'look' | null } | null; // Spiegel-Moment
  wanderer: { from: number; to: number; t: number; settled: boolean } | null;
  cos: Cosmetics;
  posters: { slot: number; text: string[]; color: string; rot: number }[];
  dryer: { t: number; hit: number | null } | null;      // Handtrockner-Bonus
  moveMode: boolean;
}

const LEFT = 96, RIGHT = 14;
export function slotX(n: number, i: number): number {
  const span = W - LEFT - RIGHT;
  return LEFT + (span / n) * (i + 0.5);
}
export function slotW(n: number): number {
  return Math.min(52, ((W - LEFT - RIGHT) / n) * 0.74);
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function drawProp(ctx: CanvasRenderingContext2D, th: Theme, t: number): void {
  const x = W - 62, y = 150;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  switch (th.prop) {
    case 'sink':
      ctx.fillStyle = '#c9d6da'; rr(ctx, x - 26, y + 60, 52, 8, 3); ctx.fill();
      ctx.fillStyle = '#eef4f6'; rr(ctx, x - 24, y, 48, 60, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(80,100,110,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#9fb0b6'; rr(ctx, x - 3, y + 62, 6, 14, 2); ctx.fill();
      break;
    case 'poster':
      ctx.fillStyle = '#e9d8a6'; rr(ctx, x - 30, y - 10, 60, 80, 2); ctx.fill();
      ctx.fillStyle = '#7a2a1a'; ctx.font = '800 11px Inter, sans-serif'; ctx.fillText('QUIZ', x, y + 14); ctx.fillText('NIGHT', x, y + 28);
      ctx.fillStyle = '#2a1a12'; ctx.font = '600 8px Inter, sans-serif'; ctx.fillText('every tuesday', x, y + 50);
      break;
    case 'graffiti':
      ctx.save(); ctx.translate(x, y + 20); ctx.rotate(-0.12);
      ctx.fillStyle = '#c0392b'; ctx.font = '700 22px Caveat, cursive'; ctx.fillText('WASH', 0, 0); ctx.fillText('YOUR', 0, 22);
      ctx.fillStyle = '#2a5aa8'; ctx.fillText('HANDS', 0, 44);
      ctx.restore();
      break;
    case 'neon': {
      const on = Math.sin(t * 2) > -0.9;
      ctx.strokeStyle = on ? '#ff2d95' : '#5a1a3a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.shadowColor = '#ff2d95'; ctx.shadowBlur = on ? 18 : 0;
      ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x - 30, y + 40); ctx.lineTo(x - 10, y + 40); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 10, y + 20, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 28, y); ctx.lineTo(x + 28, y + 40); ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case 'vending':
      ctx.fillStyle = '#c0392b'; rr(ctx, x - 26, y - 20, 52, 110, 4); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; rr(ctx, x - 20, y - 12, 40, 60, 3); ctx.fill();
      for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#f4a261', '#2a9d8f', '#e9c46a'][i % 3]; rr(ctx, x - 16 + (i % 3) * 13, y - 6 + Math.floor(i / 3) * 26, 9, 18, 2); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.font = '800 8px Inter, sans-serif'; ctx.fillText('SNACKS', x, y + 70);
      break;
    case 'plant':
      ctx.fillStyle = '#8a7a6a'; rr(ctx, x - 16, y + 60, 32, 30, 4); ctx.fill();
      ctx.fillStyle = '#2f7a4a';
      for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(x, y + 62); ctx.rotate(-1.1 + i * 0.36 + Math.sin(t + i) * 0.03); ctx.beginPath(); ctx.ellipse(0, -30, 8, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      break;
    case 'chalk':
      ctx.fillStyle = '#2a3a2a'; rr(ctx, x - 40, y - 10, 80, 70, 2); ctx.fill();
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#e8e8d8'; ctx.font = '700 12px Caveat, cursive'; ctx.fillText('1 urinal gap', x, y + 14); ctx.fillText('= good manners', x, y + 32);
      break;
    case 'portable':
      ctx.fillStyle = '#2a4d78'; rr(ctx, x - 30, y - 40, 60, 140, 6); ctx.fill();
      ctx.fillStyle = '#1d365a'; rr(ctx, x - 22, y - 30, 44, 8, 2); ctx.fill();
      ctx.fillStyle = '#5cf2a0'; rr(ctx, x - 8, y + 20, 16, 16, 3); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '800 8px Inter, sans-serif'; ctx.fillText('VACANT', x, y + 50);
      break;
  }
}

function drawRoom(ctx: CanvasRenderingContext2D, th: Theme, t: number): void {
  ctx.fillStyle = th.wall;
  ctx.fillRect(0, 0, W, FLOOR_Y);
  if (th.prop === 'portable') {
    // Zeltplane statt Kacheln
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
    for (let x = -100; x < W + 100; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 120, FLOOR_Y); ctx.stroke(); }
  } else {
    ctx.strokeStyle = th.grout; ctx.lineWidth = 1;
    for (let y = 0; y < FLOOR_Y; y += th.tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x < W; x += th.tile) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, FLOOR_Y); ctx.stroke(); }
  }
  ctx.fillStyle = th.band;
  ctx.fillRect(0, 96, W, 14);
  // Licht
  const flicker = th.dark ? (Math.sin(t * 40) * (Math.sin(t * 0.7) > 0.92 ? 1 : 0)) : 0;
  ctx.fillStyle = th.light;
  ctx.globalAlpha = 0.85 + 0.15 * flicker;
  rr(ctx, 60, 40, W - 120, 8, 4); ctx.fill();
  ctx.globalAlpha = th.dark ? 0.12 : 0.25;
  ctx.beginPath(); ctx.moveTo(60, 48); ctx.lineTo(W - 60, 48); ctx.lineTo(W - 20, 200); ctx.lineTo(20, 200); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  if (th.dark) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H); }
  // Boden
  ctx.fillStyle = th.floor;
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  ctx.strokeStyle = th.floorLine;
  for (let y = FLOOR_Y; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 14; x < W; x += 56) { ctx.beginPath(); ctx.moveTo(x, FLOOR_Y); ctx.lineTo(x, H); ctx.stroke(); }
  ctx.fillStyle = th.skirting;
  ctx.fillRect(0, FLOOR_Y - 6, W, 6);
  // Tür
  ctx.fillStyle = th.door; rr(ctx, 4, 200, 62, 360, 4); ctx.fill();
  ctx.fillStyle = th.doorDark; rr(ctx, 11, 212, 48, 336, 3); ctx.fill();
  ctx.fillStyle = '#d9c9a6'; ctx.beginPath(); ctx.arc(52, 390, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '800 9px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EXIT', 35, 232);
  drawProp(ctx, th, t);
  // Spiegelstreifen über den Pissoirs
  ctx.fillStyle = th.mirror;
  rr(ctx, 90, 150, W - 104, 62, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.moveTo(100, 154); ctx.lineTo(150, 154); ctx.lineTo(120, 208); ctx.lineTo(96, 208); ctx.closePath(); ctx.fill();
}

export const POSTERS: { text: string[]; color: string }[] = [
  { text: ['DIVORCE?', 'CALL NOW', '0800-SPLIT'], color: '#f4e1a1' },
  { text: ['NEW YEAR', 'NEW YOU', '(it is September)'], color: '#cfe8cf' },
  { text: ['MISSING:', 'my dignity', 'last seen here'], color: '#ffffff' },
  { text: ['AI SLOP INC.', 'Certainly!', 'Here is your ad'], color: '#e9d5ff' },
  { text: ['DR. BLADDER', 'Urologist', 'walk-ins welcome'], color: '#cfe3f4' },
  { text: ['QUIZ NIGHT', '2 for 1', 'shame'], color: '#f4d1a1' },
  { text: ['HODL', 'your breath', 'crypto dry cleaner'], color: '#d8f2a1' },
  { text: ['WANTED:', 'guy who talks', 'at urinals'], color: '#f4c1c1' },
  { text: ['LEARN GERMAN', 'in 3 days', '"Pissoir"'], color: '#ffe8a1' },
  { text: ['HAND DRYER', 'repair', 'since 1998'], color: '#e0e0e0' },
];
function drawPosters(ctx: CanvasRenderingContext2D, posters: Scene['posters'], n: number): void {
  for (const po of posters) {
    const x = slotX(n, po.slot);
    ctx.save();
    ctx.translate(x, 232);
    ctx.rotate(po.rot);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; rr(ctx, -20, -20, 40, 46, 2); ctx.fill();
    ctx.fillStyle = po.color; rr(ctx, -21, -22, 40, 46, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-6, -25, 12, 5); // Klebestreifen
    ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 7px Inter, system-ui, sans-serif'; ctx.fillText(po.text[0], -1, -12, 36);
    ctx.font = '600 6px Inter, system-ui, sans-serif'; ctx.fillText(po.text[1], -1, -2, 36);
    ctx.font = '500 5px Inter, system-ui, sans-serif'; ctx.fillStyle = '#4a4a4a'; ctx.fillText(po.text[2], -1, 8, 36);
    ctx.restore();
  }
}

export const STALL = { x: W - 74, y: 236, w: 66, h: 324 };
function drawStall(ctx: CanvasRenderingContext2D, th: Theme, free: boolean, t: number): void {
  const { x, y, w, h } = STALL;
  ctx.fillStyle = th.stall; rr(ctx, x - 4, y - 8, w + 8, h + 8, 4); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x, y + 20, w, h - 60);
  ctx.fillStyle = th.stall; rr(ctx, x + 4, y + 24, w - 8, h - 68, 3); ctx.fill();
  ctx.fillStyle = free ? '#5cf2a0' : '#ff5e5e';
  rr(ctx, x + w / 2 - 16, y + 60, 32, 18, 3); ctx.fill();
  ctx.fillStyle = '#0a1a10'; ctx.font = '800 8px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(free ? 'VACANT' : 'IN USE', x + w / 2, y + 69);
  ctx.fillStyle = '#d9c9a6'; ctx.beginPath(); ctx.arc(x + 12, y + 170, 4, 0, Math.PI * 2); ctx.fill();
  if (!free) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 30, 14 + Math.sin(t * 2) * 1, 5, 0, 0, Math.PI * 2); ctx.fill(); }
}

function drawUrinal(ctx: CanvasRenderingContext2D, x: number, w: number, slot: Slot, highlight: number, t: number, th: Theme): void {
  const y = URINAL_Y, h = 150;
  ctx.fillStyle = '#9fb0b6'; ctx.fillRect(x - 5, y - 70, 10, 70);
  ctx.fillStyle = '#c9d6da'; rr(ctx, x - 12, y - 84, 24, 18, 5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; rr(ctx, x - w / 2 + 3, y + 6, w, h, 14); ctx.fill();
  const g = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
  g.addColorStop(0, '#f7fbfc'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, th.urinalTint);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h * 0.55);
  ctx.quadraticCurveTo(x + w / 2, y + h, x, y + h);
  ctx.quadraticCurveTo(x - w / 2, y + h, x - w / 2, y + h * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,100,110,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(120,150,160,0.25)';
  ctx.beginPath(); ctx.ellipse(x, y + h * 0.5, w * 0.3, h * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  if (slot.kind === 'broken') {
    ctx.fillStyle = '#ffd23f'; rr(ctx, x - w / 2 - 4, y + 40, w + 8, 34, 3); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1a1a1a'; ctx.font = '800 9px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('OUT OF', x, y + 52); ctx.fillText('ORDER', x, y + 64);
    ctx.strokeStyle = 'rgba(200,40,40,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y + 10); ctx.lineTo(x + w / 2 - 6, y + h - 14); ctx.moveTo(x + w / 2 - 6, y + 10); ctx.lineTo(x - w / 2 + 6, y + h - 14); ctx.stroke();
  }
  if (slot.kind === 'wet') {
    ctx.fillStyle = 'rgba(120,190,230,0.45)';
    ctx.beginPath(); ctx.ellipse(x + 6, FLOOR_Y + 22, 34, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - 14, FLOOR_Y + 34, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.3 * Math.sin(t * 3)})`;
    ctx.beginPath(); ctx.ellipse(x + 10, FLOOR_Y + 20, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (highlight > 0) {
    ctx.strokeStyle = `rgba(92,242,160,${highlight})`; ctx.lineWidth = 4;
    rr(ctx, x - w / 2 - 6, y - 6, w + 12, h + 12, 16); ctx.stroke();
  }
}

export const PLAYER: Person = { trait: 'normal', shirt: '#3d7bd6', skin: '#f1c7a3', hair: '#5a3a22', hat: false, hairStyle: 'short', beard: false, glasses: false, build: 'normal', id: 0 };

export function drawPerson(ctx: CanvasRenderingContext2D, x: number, p: Person | null, t: number, opts: { player?: boolean; walk?: number; look?: number; shame?: number; wave?: boolean; view?: 'back' | 'front'; nod?: number; cos?: Cosmetics } = {}): void {
  drawCharacter(ctx, x, FLOOR_Y - 4, p ?? PLAYER, opts.view ?? 'back', t, { walk: opts.walk, look: opts.look, shame: opts.shame, wave: opts.wave, nod: opts.nod, idle: p ? p.id * 1.7 : 0 }, opts.cos ?? {}, !!opts.player);
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, k: number): void {
  ctx.save();
  ctx.font = '700 13px Inter, system-ui, sans-serif';
  const w = Math.min(230, ctx.measureText(text).width + 24), h = 34;
  const bx = Math.max(8, Math.min(W - w - 8, x - w / 2));
  ctx.translate(bx + w / 2, y); ctx.scale(k, k); ctx.translate(-(bx + w / 2), -y);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
  rr(ctx, bx, y - h, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x, y + 10); ctx.lineTo(x + 6, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 2, 10, 3);
  ctx.fillStyle = '#1a1a1a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + w / 2, y - h / 2, w - 16);
  ctx.restore();
}

function stamp(ctx: CanvasRenderingContext2D, text: string, color: string, outline: string, rot: number, reactT: number, hold: number): void {
  const k = easeOutCubic(Math.min(1, reactT / 0.3));
  ctx.save();
  ctx.translate(W / 2, 250); ctx.rotate(rot); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
  ctx.globalAlpha = reactT > hold ? Math.max(0, 1 - (reactT - hold) / 0.35) : 1;
  ctx.font = '800 40px "Archivo Black", Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 8; ctx.strokeStyle = outline; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = color; ctx.fillText(text, 0, 0);
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, sc: Scene): void {
  const n = sc.slots.length;
  const w = slotW(n);
  drawRoom(ctx, sc.theme, sc.t);
  if (sc.showStall) drawStall(ctx, sc.theme, sc.stallFree, sc.t);
  drawPosters(ctx, sc.posters, n);
  sc.slots.forEach((slot, i) => {
    let hl = sc.reactKind === 'good' && sc.reactSlot === i ? Math.max(0, 1 - sc.reactT / 1.2) : 0;
    if (sc.reactKind === 'bad' && sc.good.includes(i)) hl = 0.5 + 0.5 * Math.sin(sc.t * 8);
    drawUrinal(ctx, slotX(n, i), w, slot, hl, sc.t, sc.theme);
    if (sc.reactKind === 'bad' && sc.good.includes(i) && sc.reactT > 0.4) {
      ctx.fillStyle = '#5cf2a0'; ctx.font = '800 11px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('HERE', slotX(n, i), URINAL_Y - 100);
      ctx.beginPath(); ctx.moveTo(slotX(n, i) - 6, URINAL_Y - 92); ctx.lineTo(slotX(n, i), URINAL_Y - 84); ctx.lineTo(slotX(n, i) + 6, URINAL_Y - 92); ctx.closePath(); ctx.fill();
    }
  });
  const drawnIds = new Set<number>();
  sc.slots.forEach((slot, i) => {
    if (slot.kind !== 'taken') return;
    if (sc.late && sc.late.slot === i && sc.late.t < 1) return; // läuft noch ein, wird separat gezeichnet
    if (sc.wanderer && !sc.wanderer.settled && i === sc.wanderer.to) return;
    if (drawnIds.has(slot.who.id)) return;
    drawnIds.add(slot.who.id);
    let x = slotX(n, i);
    if (slot.who.trait === 'giant') x = (slotX(n, i) + slotX(n, i + 1)) / 2;
    let look = 0;
    const d = sc.playerTarget === null ? 99 : Math.abs(sc.playerTarget - i);
    const reacting = sc.playerState === 'shame' || (sc.reactKind === 'good' && slot.who.trait === 'friend' && d === 1);
    if (reacting && d <= 2 && sc.playerTarget !== null) look = sc.playerTarget < i ? -1 : 1;
    if (sc.mirror && !sc.mirror.done && sc.mirror.slot === i && sc.playerTarget !== null) look = sc.playerTarget < i ? -1 : 1;
    const wave = slot.who.trait === 'friend' && sc.reactKind === 'good' && d === 1;
    drawPerson(ctx, x, slot.who, sc.t, { look, wave, view: 'back' });
  });
  if (sc.wanderer && !sc.wanderer.settled) {
    const slot = sc.slots[sc.wanderer.to];
    if (slot.kind === 'taken') {
      const k = sc.wanderer.t;
      const endX = W - 30, tx = slotX(n, sc.wanderer.to);
      const x = k < 0.5 ? 96 + (endX - 96) * (k * 2) : endX + (tx - endX) * ((k - 0.5) * 2);
      drawPerson(ctx, x, slot.who, sc.t, { view: 'front', walk: 1 });
      ctx.fillStyle = '#ffd23f'; ctx.font = '800 12px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('WAIT FOR HIM', W / 2, 130);
    }
  }
  // Nachzügler läuft von der Tür zu seinem Platz
  if (sc.late) {
    const slot = sc.slots[sc.late.slot];
    if (slot.kind === 'taken') drawPerson(ctx, sc.late.x, slot.who, sc.t, { view: sc.late.t < 1 ? 'front' : 'back', walk: sc.late.t < 1 ? 1 : 0 });
  }
  // Spiegel-Moment: sein Gesicht erscheint im Spiegel, dreht sich zu dir
  if (sc.mirror && !sc.mirror.done) {
    const slot = sc.slots[sc.mirror.slot];
    const x = slotX(n, sc.mirror.slot);
    const k = Math.min(1, sc.mirror.t / 0.35);
    if (slot.kind === 'taken') {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(90, 150, W - 104, 62, 6); ctx.clip();
      ctx.globalAlpha = 0.9 * k;
      ctx.translate(x, 268 + 120 * (1 - k));
      ctx.scale(0.6, 0.6);
      drawCharacter(ctx, 0, 0, slot.who, 'front', sc.t, { look: sc.playerX < x ? -1 : 1 }, {}, false);
      ctx.restore();
      const px = sc.playerX;
      ctx.strokeStyle = 'rgba(255,94,94,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x, 186); ctx.lineTo(px, 186); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#1a2a30'; ctx.font = '800 13px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(sc.mirror.wantsNod ? 'YOUR MATE IS LOOKING AT YOU' : "HE'S LOOKING AT YOU IN THE MIRROR", W / 2, 130);
      ctx.fillStyle = 'rgba(26,42,48,0.3)'; ctx.fillRect(W / 2 - 60, 222, 120, 4);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(W / 2 - 60, 222, 120 * Math.max(0, 1 - sc.mirror.t / 3), 4);
    }
  }
  const walking = sc.playerState === 'walking';
  const shame = sc.playerState === 'shame' ? Math.min(1, sc.reactT * 2) : 0;
  const nod = sc.mirror && sc.mirror.answered === 'look' ? Math.sin(Math.min(1, sc.reactT * 3) * Math.PI) : 0;
  const plook = sc.mirror && sc.mirror.answered === 'look' ? (sc.playerX < slotX(n, sc.mirror.slot) ? 1 : -1) : 0;
  if (sc.playerState === 'waiting' || sc.playerState === 'door') drawPerson(ctx, sc.playerState === 'waiting' ? sc.playerX : DOOR_X + 40, null, sc.t, { player: true, view: 'front', shame, cos: sc.cos });
  else if (walking) drawPerson(ctx, sc.playerX, null, sc.t, { player: true, walk: 1, view: 'front', cos: sc.cos });
  else drawPerson(ctx, sc.playerX, null, sc.t, { player: true, view: 'back', shame, look: plook, nod, cos: sc.cos });
  if (sc.bubble) drawBubble(ctx, sc.bubble.x, sc.bubble.y, sc.bubble.text, easeOutBack(Math.min(1, sc.reactT / 0.25)));
  if (sc.reactKind === 'good' && sc.reactT < 1) stamp(ctx, 'SMOOTH', '#5cf2a0', '#0a1a10', -0.12, sc.reactT, 0.7);
  if (sc.reactKind === 'bad' && sc.reactT < 1.4) stamp(ctx, 'AWKWARD', '#ff5e5e', '#2a0a0a', 0.1, sc.reactT, 1);
  if (sc.moveMode) {
    ctx.fillStyle = 'rgba(26,42,48,0.85)'; rr(ctx, W / 2 - 120, 118, 240, 34, 17); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 13px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('MOVE? Tap a spot, or tap yourself to stay', W / 2, 135);
  }
  if (sc.dryer) drawDryer(ctx, sc.dryer, sc.t);
}

/** Handtrockner-Bonus: Zeiger pendelt, Tap in der grünen Zone. */
export const DRYER = { x: W / 2, y: 330, w: 260, zone: [0.42, 0.58] as [number, number] };
export function dryerPos(t: number): number { return 0.5 + 0.5 * Math.sin(t * 5.2); }
function drawDryer(ctx: CanvasRenderingContext2D, d: { t: number; hit: number | null }, t: number): void {
  ctx.fillStyle = 'rgba(26,42,48,0.55)'; ctx.fillRect(0, 0, W, H);
  const { x, y, w } = DRYER;
  ctx.fillStyle = '#ffffff'; rr(ctx, x - 150, y - 150, 300, 300, 22); ctx.fill();
  ctx.fillStyle = '#1a2a30'; ctx.font = '800 22px "Archivo Black", Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('HAND DRYER', x, y - 112);
  ctx.font = '600 13px Inter, system-ui, sans-serif'; ctx.fillStyle = '#4a5a60';
  ctx.fillText('Tap when the air is in the green', x, y - 84);
  // Gerät
  ctx.fillStyle = '#c9d6da'; rr(ctx, x - 60, y - 60, 120, 70, 12); ctx.fill();
  ctx.fillStyle = '#9fb0b6'; rr(ctx, x - 30, y + 4, 60, 12, 4); ctx.fill();
  // Luftstoß
  const k = d.hit === null ? dryerPos(d.t) : d.hit;
  const p = 0.5 - Math.abs(k - 0.5);
  ctx.strokeStyle = `rgba(120,190,230,${0.3 + p})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 24 + i * 12, y + 20); ctx.lineTo(x - 24 + i * 12 + Math.sin(t * 20 + i) * 4, y + 60 + p * 60); ctx.stroke(); }
  // Balken
  ctx.fillStyle = '#e6edf0'; rr(ctx, x - w / 2, y + 96, w, 18, 9); ctx.fill();
  const [a, b] = DRYER.zone;
  ctx.fillStyle = '#5cf2a0'; rr(ctx, x - w / 2 + w * a, y + 96, w * (b - a), 18, 6); ctx.fill();
  ctx.fillStyle = '#ffd23f'; rr(ctx, x - w / 2 + w * (a - 0.08), y + 96, w * 0.08, 18, 4); ctx.fill(); rr(ctx, x - w / 2 + w * b, y + 96, w * 0.08, 18, 4); ctx.fill();
  ctx.fillStyle = d.hit === null ? '#1a2a30' : (k >= a && k <= b ? '#1f7a5a' : '#c0392b');
  rr(ctx, x - w / 2 + w * k - 4, y + 88, 8, 34, 4); ctx.fill();
  if (d.hit !== null) {
    const inZone = k >= a && k <= b, near = k >= a - 0.08 && k <= b + 0.08;
    ctx.fillStyle = inZone ? '#1f7a5a' : near ? '#b8860b' : '#c0392b';
    ctx.font = '800 26px "Archivo Black", Inter, sans-serif';
    ctx.fillText(inZone ? 'PERFECT · +1 PERK' : near ? 'DAMP · +20' : 'STILL WET', x, y + 140);
  }
}
