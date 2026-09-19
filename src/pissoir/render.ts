import { H, W } from '../kit/canvas';
import { easeOutBack, easeOutCubic } from '../kit/tween';
import type { Person, Slot } from './rules';
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

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) * k)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) * k)), b = Math.max(0, Math.min(255, (n & 255) * k));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const PLAYER: Person = { trait: 'normal', shirt: '#3d7bd6', skin: '#f1c7a3', hair: '#5a3a22', hat: false };

/**
 * view 'back': steht am Pissoir, Rücken zu uns. look ≠ 0 dreht den Kopf ins Profil (−1 links, 1 rechts).
 * view 'front': an der Tür, Gesicht zu uns.
 */
export function drawPerson(ctx: CanvasRenderingContext2D, x: number, p: Person | null, t: number, opts: { player?: boolean; walk?: number; look?: number; shame?: number; wave?: boolean; view?: 'back' | 'front' } = {}): void {
  const y = FLOOR_Y - 4;
  const who = p ?? PLAYER;
  const scale = who.trait === 'kid' ? 0.72 : 1;
  const view = opts.view ?? 'back';
  const walk = opts.walk ?? 0;
  const look = opts.look ?? 0;
  const shame = opts.shame ?? 0;
  const bob = walk > 0 ? Math.abs(Math.sin(t * 14)) * 4 : Math.sin(t * 2) * 1;
  const pants = who.trait === 'boss' ? '#2a2a3e' : who.trait === 'kid' ? '#4a6a9a' : '#3a4a6a';
  ctx.save();
  ctx.translate(x, y - bob);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 4 + bob, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Beine
  ctx.strokeStyle = pants; ctx.lineWidth = 12; ctx.lineCap = 'round';
  const swing = walk > 0 ? Math.sin(t * 14) * 10 : 0;
  ctx.beginPath(); ctx.moveTo(-8, -50); ctx.lineTo(-9 - swing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -50); ctx.lineTo(9 + swing, 0); ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.ellipse(-10 - swing, 2, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10 + swing, 2, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Rumpf
  ctx.fillStyle = who.shirt;
  rr(ctx, -22, -118, 44, 72, 12); ctx.fill();
  const sleeve = shade(who.shirt, 0.82);
  if (view === 'back') {
    // Rückenfalte
    ctx.strokeStyle = shade(who.shirt, 0.7); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -112); ctx.lineTo(0, -60); ctx.stroke();
    // Arme: Oberarme seitlich nach unten, Ellbogen nach vorn (verdeckt)
    ctx.strokeStyle = sleeve; ctx.lineWidth = 12;
    if (opts.wave) {
      ctx.beginPath(); ctx.moveTo(-20, -108); ctx.lineTo(-24, -76); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, -108); ctx.lineTo(36, -150 + Math.sin(t * 10) * 6); ctx.stroke();
      ctx.fillStyle = who.skin; ctx.beginPath(); ctx.arc(37, -156 + Math.sin(t * 10) * 6, 7, 0, Math.PI * 2); ctx.fill();
    } else if (who.trait === 'phone') {
      ctx.beginPath(); ctx.moveTo(-20, -108); ctx.lineTo(-24, -76); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, -108); ctx.lineTo(26, -136); ctx.stroke();
      ctx.fillStyle = who.skin; ctx.beginPath(); ctx.arc(26, -140, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#222'; rr(ctx, 21, -152, 10, 18, 3); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(-20, -108); ctx.lineTo(-26, -78); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, -108); ctx.lineTo(26, -78); ctx.stroke();
      // Ellbogen als Hautpunkt sichtbar
      ctx.fillStyle = who.skin;
      ctx.beginPath(); ctx.arc(-27, -76, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(27, -76, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (who.trait === 'boss') { ctx.fillStyle = shade(who.shirt, 0.7); ctx.fillRect(-22, -118, 44, 6); }
    if (who.trait === 'friend') { ctx.fillStyle = '#0a1a10'; ctx.font = '700 11px Caveat, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BRO', 0, -84); }
    if (opts.player) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-22, -70, 44, 3); }
  } else {
    // Von vorn: Arme hängen, Hände sichtbar
    ctx.strokeStyle = sleeve; ctx.lineWidth = 12;
    const sw = walk > 0 ? Math.sin(t * 14) * 8 : 0;
    ctx.beginPath(); ctx.moveTo(-20, -108); ctx.lineTo(-28 + sw, -64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, -108); ctx.lineTo(28 - sw, -64); ctx.stroke();
    ctx.fillStyle = who.skin;
    ctx.beginPath(); ctx.arc(-29 + sw, -58, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(29 - sw, -58, 7, 0, Math.PI * 2); ctx.fill();
    if (who.trait === 'boss') { ctx.fillStyle = '#e63946'; ctx.fillRect(-3, -112, 6, 40); }
    if (opts.player) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-22, -70, 44, 3); }
  }
  // Kopf
  ctx.save();
  ctx.translate(look * 5, 0);
  ctx.fillStyle = who.skin;
  ctx.beginPath(); ctx.arc(0, -140, 22, 0, Math.PI * 2); ctx.fill();
  const showFace = view === 'front';
  const profile = view === 'back' && look !== 0;
  // Haare oder Hut
  if (who.hat) {
    ctx.fillStyle = who.trait === 'boss' ? '#1a1a2e' : '#5a6a8a';
    rr(ctx, -24, -166, 48, 14, 3); ctx.fill();
    rr(ctx, -16, -186, 32, 22, 4); ctx.fill();
  } else if (view === 'back' && !profile) {
    // Hinterkopf: Haare bedecken mehr
    ctx.fillStyle = who.hair;
    ctx.beginPath(); ctx.arc(0, -144, 23, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();
    ctx.fillRect(-23, -146, 46, 14);
  } else {
    ctx.fillStyle = who.hair;
    ctx.beginPath(); ctx.arc(0, -146, 23, Math.PI, Math.PI * 2); ctx.fill();
  }
  // Ohren
  ctx.fillStyle = shade(who.skin, 0.92);
  if (!profile) { ctx.beginPath(); ctx.arc(-22, -140, 5, 0, Math.PI * 2); ctx.arc(22, -140, 5, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(-look * 18, -140, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#1a1a1a';
  if (showFace) {
    if (shame > 0) {
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-12, -144); ctx.lineTo(-4, -140); ctx.moveTo(12, -144); ctx.lineTo(4, -140); ctx.stroke();
      ctx.fillStyle = `rgba(230,57,70,${0.5 * shame})`;
      ctx.beginPath(); ctx.arc(-10, -132, 5, 0, Math.PI * 2); ctx.arc(10, -132, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(-7, -142, 2.5, 0, Math.PI * 2); ctx.arc(7, -142, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#8a4a3c'; ctx.lineWidth = 2; ctx.beginPath();
    if (shame > 0) ctx.arc(0, -124, 5, Math.PI + 0.3, -0.3); else { ctx.moveTo(-4, -130); ctx.lineTo(4, -130); }
    ctx.stroke();
  } else if (profile) {
    // Profil zum Spieler: ein Auge, Nase, Mund auf der zugewandten Seite
    const sx = look * 12;
    ctx.beginPath(); ctx.arc(sx, -142, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = who.skin;
    ctx.beginPath(); ctx.moveTo(look * 20, -138); ctx.lineTo(look * 27, -132); ctx.lineTo(look * 19, -129); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a4a3c'; ctx.lineWidth = 2; ctx.beginPath();
    if (who.trait === 'friend' || opts.wave) ctx.arc(look * 12, -128, 5, look > 0 ? -0.6 : Math.PI - 2.5, look > 0 ? 1.8 : Math.PI + 0.6);
    else if (who.trait === 'talker') ctx.ellipse(look * 16, -126, 3, 2 + Math.abs(Math.sin(t * 9)) * 3, 0, 0, Math.PI * 2);
    else { ctx.moveTo(look * 10, -126); ctx.lineTo(look * 20, -127); }
    ctx.stroke();
    // Augenbraue hochgezogen
    ctx.strokeStyle = who.hair; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(look * 6, -151); ctx.lineTo(look * 17, -149); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
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
  sc.slots.forEach((slot, i) => {
    const hl = sc.reactKind === 'good' && sc.reactSlot === i ? Math.max(0, 1 - sc.reactT / 1.2) : 0;
    drawUrinal(ctx, slotX(n, i), w, slot, hl, sc.t, sc.theme);
  });
  sc.slots.forEach((slot, i) => {
    if (slot.kind !== 'taken') return;
    const x = slotX(n, i);
    let look = 0;
    const d = sc.playerTarget === null ? 99 : Math.abs(sc.playerTarget - i);
    const reacting = sc.playerState === 'shame' || (sc.reactKind === 'good' && slot.who.trait === 'friend' && d === 1);
    if (reacting && d <= 2 && sc.playerTarget !== null) look = sc.playerTarget < i ? -1 : 1;
    const wave = slot.who.trait === 'friend' && sc.reactKind === 'good' && d === 1;
    drawPerson(ctx, x, slot.who, sc.t + i * 1.7, { look, wave, view: 'back' });
  });
  const walking = sc.playerState === 'walking';
  const shame = sc.playerState === 'shame' ? Math.min(1, sc.reactT * 2) : 0;
  if (sc.playerState === 'waiting' || sc.playerState === 'door') drawPerson(ctx, DOOR_X + 40, null, sc.t, { player: true, view: 'front', shame });
  else if (walking) drawPerson(ctx, sc.playerX, null, sc.t, { player: true, walk: 1, view: 'front' });
  else drawPerson(ctx, sc.playerX, null, sc.t, { player: true, view: 'back', shame, look: shame > 0 ? 0 : 0 });
  if (sc.bubble) drawBubble(ctx, sc.bubble.x, sc.bubble.y, sc.bubble.text, easeOutBack(Math.min(1, sc.reactT / 0.25)));
  if (sc.reactKind === 'good' && sc.reactT < 1) stamp(ctx, 'SMOOTH', '#5cf2a0', '#0a1a10', -0.12, sc.reactT, 0.7);
  if (sc.reactKind === 'bad' && sc.reactT < 1.4) stamp(ctx, 'AWKWARD', '#ff5e5e', '#2a0a0a', 0.1, sc.reactT, 1);
}
