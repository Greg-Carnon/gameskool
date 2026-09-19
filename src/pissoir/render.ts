import { H, W } from '../kit/canvas';
import { easeOutBack, easeOutCubic } from '../kit/tween';
import type { Person, Slot } from './rules';

export const FLOOR_Y = 560;
export const URINAL_Y = 330;
export const DOOR_X = 0;

export interface Scene {
  slots: Slot[];
  playerX: number;
  playerTarget: number | null;   // Slot-Index oder null (an der Tür)
  playerT: number;               // Fortschritt der Bewegung 0..1
  playerState: 'door' | 'walking' | 'standing' | 'waiting' | 'shame';
  reactT: number;                // Reaktions-Timer
  reactKind: 'none' | 'good' | 'bad' | 'wait';
  reactSlot: number;
  bubble: { x: number; y: number; text: string } | null;
  hover: number;                 // -1 oder Slot-Index der letzten Auswahl
  t: number;
}

const LEFT = 96, RIGHT = 14;
export function slotX(n: number, i: number): number {
  const span = W - LEFT - RIGHT;
  return LEFT + (span / n) * (i + 0.5);
}

export function slotW(n: number): number {
  return Math.min(52, ((W - LEFT - RIGHT) / n) * 0.74);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function drawRoom(ctx: CanvasRenderingContext2D, t: number): void {
  // Wand: Kacheln
  ctx.fillStyle = '#dfe9ec';
  ctx.fillRect(0, 0, W, FLOOR_Y);
  ctx.strokeStyle = 'rgba(80,110,120,0.18)';
  ctx.lineWidth = 1;
  for (let y = 0; y < FLOOR_Y; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, FLOOR_Y); ctx.stroke(); }
  // Farbband
  ctx.fillStyle = '#7fb3bf';
  ctx.fillRect(0, 96, W, 14);
  // Neonröhre
  ctx.fillStyle = `rgba(255,255,255,${0.8 + 0.2 * Math.sin(t * 40) * (Math.sin(t * 0.7) > 0.95 ? 1 : 0)})`;
  roundRect(ctx, 60, 40, W - 120, 8, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,240,0.25)';
  ctx.beginPath(); ctx.moveTo(60, 48); ctx.lineTo(W - 60, 48); ctx.lineTo(W - 20, 200); ctx.lineTo(20, 200); ctx.closePath(); ctx.fill();
  // Boden
  ctx.fillStyle = '#b8c4c8';
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  ctx.strokeStyle = 'rgba(60,80,90,0.2)';
  for (let y = FLOOR_Y; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 14; x < W; x += 56) { ctx.beginPath(); ctx.moveTo(x, FLOOR_Y); ctx.lineTo(x, H); ctx.stroke(); }
  // Sockelleiste
  ctx.fillStyle = '#93a3a8';
  ctx.fillRect(0, FLOOR_Y - 6, W, 6);
  // Tür links
  ctx.fillStyle = '#8a6a4a';
  roundRect(ctx, 4, 200, 62, 360, 4); ctx.fill();
  ctx.fillStyle = '#6f5238';
  roundRect(ctx, 11, 212, 48, 336, 3); ctx.fill();
  ctx.fillStyle = '#d9c9a6';
  ctx.beginPath(); ctx.arc(52, 390, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a3a2a';
  ctx.font = '800 9px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', 35, 232);
}

function drawUrinal(ctx: CanvasRenderingContext2D, x: number, w: number, slot: Slot, highlight: number, t: number): void {
  const y = URINAL_Y;
  const h = 150;
  // Rohr
  ctx.fillStyle = '#9fb0b6';
  ctx.fillRect(x - 5, y - 70, 10, 70);
  ctx.fillStyle = '#c9d6da';
  roundRect(ctx, x - 12, y - 84, 24, 18, 5); ctx.fill();
  // Schüssel
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  roundRect(ctx, x - w / 2 + 3, y + 6, w, h, 14); ctx.fill();
  const g = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
  g.addColorStop(0, '#f7fbfc'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#dde7ea');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h * 0.55);
  ctx.quadraticCurveTo(x + w / 2, y + h, x, y + h);
  ctx.quadraticCurveTo(x - w / 2, y + h, x - w / 2, y + h * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,100,110,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  // Innenschatten
  ctx.fillStyle = 'rgba(120,150,160,0.25)';
  ctx.beginPath(); ctx.ellipse(x, y + h * 0.5, w * 0.3, h * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  if (slot.kind === 'broken') {
    ctx.fillStyle = '#ffd23f';
    roundRect(ctx, x - w / 2 - 4, y + 40, w + 8, 34, 3); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '800 9px Inter, system-ui, sans-serif';
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
    roundRect(ctx, x - w / 2 - 6, y - 6, w + 12, h + 12, 16); ctx.stroke();
  }
}

export function drawPerson(ctx: CanvasRenderingContext2D, x: number, p: Person | null, t: number, opts: { player?: boolean; walk?: number; look?: number; shame?: number; wave?: boolean; back?: boolean } = {}): void {
  const y = FLOOR_Y - 4;
  const scale = p?.trait === 'kid' ? 0.72 : 1;
  const skin = p?.skin ?? '#f1c7a3';
  const shirt = opts.player ? '#121419' : (p?.shirt ?? '#888');
  const hair = p?.hair ?? '#e8c25c';
  const walk = opts.walk ?? 0;
  const bob = walk > 0 ? Math.abs(Math.sin(t * 14)) * 4 : Math.sin(t * 2) * 1;
  ctx.save();
  ctx.translate(x, y - bob);
  ctx.scale(scale, scale);
  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 4 + bob, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Beine
  ctx.strokeStyle = p?.trait === 'boss' ? '#2a2a3e' : '#3a4a6a';
  ctx.lineWidth = 12; ctx.lineCap = 'round';
  const swing = walk > 0 ? Math.sin(t * 14) * 10 : 0;
  ctx.beginPath(); ctx.moveTo(-8, -50); ctx.lineTo(-9 - swing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -50); ctx.lineTo(9 + swing, 0); ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.ellipse(-10 - swing, 2, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10 + swing, 2, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Körper
  ctx.fillStyle = shirt;
  roundRect(ctx, -22, -118, 44, 72, 12); ctx.fill();
  if (p?.trait === 'boss') { ctx.fillStyle = '#e63946'; ctx.fillRect(-3, -112, 6, 40); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-8, -118); ctx.lineTo(0, -100); ctx.lineTo(8, -118); ctx.closePath(); ctx.fill(); }
  if (p?.trait === 'friend') { ctx.fillStyle = '#0a1a10'; ctx.font = '700 10px Caveat, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BRO', 0, -84); }
  if (opts.player) { ctx.fillStyle = '#f4f1ea'; ctx.font = '700 11px Caveat, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NO SLOP', 0, -84); }
  // Arme
  ctx.strokeStyle = shirt; ctx.lineWidth = 11;
  if (opts.wave) {
    ctx.beginPath(); ctx.moveTo(18, -108); ctx.lineTo(34, -150 + Math.sin(t * 10) * 6); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(35, -155 + Math.sin(t * 10) * 6, 7, 0, Math.PI * 2); ctx.fill();
  } else if (p?.trait === 'phone') {
    ctx.beginPath(); ctx.moveTo(18, -108); ctx.lineTo(26, -130); ctx.stroke();
    ctx.fillStyle = '#222'; roundRect(ctx, 20, -146, 12, 20, 3); ctx.fill();
  } else {
    // Arme nach vorn (an der Schüssel)
    ctx.beginPath(); ctx.moveTo(-18, -108); ctx.lineTo(-12, -74); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -108); ctx.lineTo(12, -74); ctx.stroke();
  }
  // Kopf
  const look = opts.look ?? 0;
  ctx.save();
  ctx.translate(look * 6, 0);
  ctx.rotate(look * 0.18);
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, -140, 22, 0, Math.PI * 2); ctx.fill();
  // Haare oder Cap
  if (opts.player) {
    ctx.fillStyle = '#e8c25c';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 14, -150, 9, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#f5f2ea';
    ctx.beginPath(); ctx.arc(0, -150, 23, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-24, -152, 48, 5);
    ctx.fillStyle = '#5cf2a0'; ctx.beginPath(); ctx.arc(3, -160, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c48f45'; ctx.fillRect(-8, -131, 16, 3);
  } else if (p?.hat) {
    ctx.fillStyle = p.trait === 'boss' ? '#1a1a2e' : '#5a6a8a';
    roundRect(ctx, -24, -166, 48, 14, 3); ctx.fill();
    roundRect(ctx, -16, -186, 32, 22, 4); ctx.fill();
  } else {
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(0, -146, 23, Math.PI, Math.PI * 2); ctx.fill();
  }
  // Augen, blicken zur Seite bei look
  const shame = opts.shame ?? 0;
  ctx.fillStyle = '#1a1a1a';
  if (shame > 0) {
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, -144); ctx.lineTo(-4, -140); ctx.moveTo(12, -144); ctx.lineTo(4, -140); ctx.stroke();
    ctx.fillStyle = `rgba(230,57,70,${0.5 * shame})`;
    ctx.beginPath(); ctx.arc(-10, -132, 5, 0, Math.PI * 2); ctx.arc(10, -132, 5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(-7 + look * 3, -142, 2.5, 0, Math.PI * 2); ctx.arc(7 + look * 3, -142, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // Mund
  ctx.strokeStyle = '#8a4a3c'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (p?.trait === 'friend' || opts.wave) ctx.arc(0, -132, 6, 0.2, Math.PI - 0.2);
  else if (p?.trait === 'talker') { ctx.ellipse(0, -130, 4, 3 + Math.abs(Math.sin(t * 9)) * 3, 0, 0, Math.PI * 2); }
  else if (shame > 0) ctx.arc(0, -124, 5, Math.PI + 0.3, -0.3);
  else { ctx.moveTo(-4, -130); ctx.lineTo(4, -130); }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, k: number): void {
  ctx.save();
  ctx.font = '700 13px Inter, system-ui, sans-serif';
  const w = Math.min(230, ctx.measureText(text).width + 24);
  const h = 34;
  const bx = Math.max(8, Math.min(W - w - 8, x - w / 2));
  ctx.translate(bx + w / 2, y);
  ctx.scale(k, k);
  ctx.translate(-(bx + w / 2), -y);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
  roundRect(ctx, bx, y - h, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x, y + 10); ctx.lineTo(x + 6, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 2, 10, 3);
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + w / 2, y - h / 2, w - 16);
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, sc: Scene): void {
  const n = sc.slots.length;
  const w = slotW(n);
  drawRoom(ctx, sc.t);
  // Pissoirs
  sc.slots.forEach((slot, i) => {
    const hl = sc.reactKind === 'good' && sc.reactSlot === i ? Math.max(0, 1 - sc.reactT / 1.2) : 0;
    drawUrinal(ctx, slotX(n, i), w, slot, hl, sc.t);
  });
  // Leute an den Pissoirs
  sc.slots.forEach((slot, i) => {
    if (slot.kind !== 'taken') return;
    const x = slotX(n, i);
    let look = 0;
    const d = sc.playerTarget === null ? 99 : Math.abs(sc.playerTarget - i);
    if (sc.reactKind === 'bad' && sc.playerState === 'shame' && d <= 2) look = sc.playerTarget! < i ? -1 : 1;
    const wave = slot.who.trait === 'friend' && sc.reactKind === 'good' && d === 1;
    drawPerson(ctx, x, slot.who, sc.t + i * 1.7, { look, wave });
  });
  // Spieler
  const px = sc.playerX;
  const walking = sc.playerState === 'walking';
  const shame = sc.playerState === 'shame' ? Math.min(1, sc.reactT * 2) : 0;
  if (sc.playerState !== 'waiting') drawPerson(ctx, px, null, sc.t, { player: true, walk: walking ? 1 : 0, shame });
  else {
    // Wartet an der Tür, verschränkte Arme
    drawPerson(ctx, DOOR_X + 40, null, sc.t, { player: true });
  }
  // Blase
  if (sc.bubble) {
    const k = easeOutBack(Math.min(1, sc.reactT / 0.25));
    drawBubble(ctx, sc.bubble.x, sc.bubble.y, sc.bubble.text, k);
  }
  // Stempel
  if (sc.reactKind === 'good' && sc.reactT < 1) {
    const k = easeOutCubic(Math.min(1, sc.reactT / 0.3));
    ctx.save();
    ctx.translate(W / 2, 250);
    ctx.rotate(-0.12);
    ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    ctx.globalAlpha = sc.reactT > 0.7 ? 1 - (sc.reactT - 0.7) / 0.3 : 1;
    ctx.font = '800 40px "Archivo Black", Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = '#0a1a10'; ctx.strokeText('SMOOTH', 0, 0);
    ctx.fillStyle = '#5cf2a0'; ctx.fillText('SMOOTH', 0, 0);
    ctx.restore();
  }
  if (sc.reactKind === 'bad' && sc.reactT < 1.4) {
    const k = easeOutCubic(Math.min(1, sc.reactT / 0.3));
    ctx.save();
    ctx.translate(W / 2, 250);
    ctx.rotate(0.1);
    ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    ctx.globalAlpha = sc.reactT > 1 ? 1 - (sc.reactT - 1) / 0.4 : 1;
    ctx.font = '800 40px "Archivo Black", Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = '#2a0a0a'; ctx.strokeText('AWKWARD', 0, 0);
    ctx.fillStyle = '#ff5e5e'; ctx.fillText('AWKWARD', 0, 0);
    ctx.restore();
  }
}
