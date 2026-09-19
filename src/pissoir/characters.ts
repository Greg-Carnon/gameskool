import type { Person } from './rules';

/**
 * Figuren aus Primitiven mit Kontur, Schattierung und Details pro Charakter.
 * Ursprung: Fußsohle, y wächst nach oben (negativ). Alle Maße für build 'normal'.
 */
export type View = 'back' | 'front';
export interface Anim { walk?: number; look?: number; shame?: number; wave?: boolean; nod?: number; idle?: number }
export interface Cosmetics { hat?: 'fedora' | 'cap' | 'crown'; glasses?: 'shades' | 'round'; shirt?: string }

const OUT = 'rgba(20,20,30,0.55)';
const TAU = Math.PI * 2;

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) * k, g = ((n >> 8) & 255) * k, b = (n & 255) * k;
  return `rgb(${Math.min(255, r) | 0},${Math.min(255, g) | 0},${Math.min(255, b) | 0})`;
}
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void { c.beginPath(); c.roundRect(x, y, w, h, r); }
function fillStroke(c: CanvasRenderingContext2D, fill: string): void { c.fillStyle = fill; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(); }

export function drawCharacter(c: CanvasRenderingContext2D, x: number, y: number, p: Person, view: View, t: number, a: Anim = {}, cos: Cosmetics = {}, isPlayer = false): void {
  const scale = p.trait === 'kid' ? 0.68 : p.trait === 'giant' ? 1.35 : 1;
  const wide = p.build === 'big' ? 1.25 : p.build === 'slim' ? 0.88 : 1;
  const walk = a.walk ?? 0;
  const look = a.look ?? 0;
  const shame = a.shame ?? 0;
  const idle = a.idle ?? 0;
  const bob = walk > 0 ? Math.abs(Math.sin(t * 13)) * 4 : Math.sin(t * 1.6 + idle) * 1.2;
  const sway = walk > 0 ? 0 : Math.sin(t * 0.9 + idle) * (p.trait === 'singer' ? 4 : 1.2);
  const shirt = cos.shirt ?? p.shirt;
  const pants = p.trait === 'boss' ? '#23233a' : p.trait === 'kid' ? '#3b6fb6' : p.trait === 'dog' ? '#8a7a5a' : p.trait === 'giant' ? '#2b2b2b' : '#34456a';
  const shoes = p.trait === 'boss' ? '#1a1410' : p.trait === 'kid' ? '#e63946' : '#1f1f24';
  c.save();
  c.translate(x + sway, y - bob);
  c.scale(scale, scale);
  c.lineJoin = 'round';
  // Schatten
  c.fillStyle = 'rgba(0,0,0,0.2)';
  c.beginPath(); c.ellipse(0, 3 + bob, 24 * wide, 6, 0, 0, TAU); c.fill();
  // Beine
  const swing = walk > 0 ? Math.sin(t * 13) * 11 : 0;
  c.lineCap = 'round';
  for (const side of [-1, 1]) {
    const lx = side * 9 * wide;
    c.strokeStyle = OUT; c.lineWidth = 16; c.beginPath(); c.moveTo(lx, -52); c.lineTo(lx + side * swing * 0.2 - swing * side, -2); c.stroke();
    c.strokeStyle = pants; c.lineWidth = 12; c.beginPath(); c.moveTo(lx, -52); c.lineTo(lx + side * swing * 0.2 - swing * side, -2); c.stroke();
    // Schuh
    c.beginPath(); c.ellipse(lx - swing * side + (view === 'back' ? 0 : side * 2), 0, 11, 5, 0, 0, TAU); fillStroke(c, shoes);
  }
  // Rumpf
  const tw = 46 * wide, th = 70;
  rr(c, -tw / 2, -120, tw, th, 14); fillStroke(c, shirt);
  // Licht von oben links, Schatten rechts
  c.fillStyle = 'rgba(0,0,0,0.12)'; rr(c, tw / 2 - 12, -118, 10, th - 4, 8); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.14)'; rr(c, -tw / 2 + 4, -118, 8, th - 4, 8); c.fill();
  // Kleidung je Charakter
  const sleeve = shade(shirt, 0.82);
  if (view === 'back') {
    c.strokeStyle = shade(shirt, 0.7); c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -114); c.lineTo(0, -60); c.stroke();
    if (p.trait === 'boss' || p.trait === 'ex') { c.fillStyle = shade(shirt, 0.75); rr(c, -tw / 2, -120, tw, 8, 4); c.fill(); }
    if (p.trait === 'splasher' || isPlayer) { c.fillStyle = shade(shirt, 0.85); c.beginPath(); c.ellipse(0, -112, 20 * wide, 12, 0, 0, Math.PI); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(); } // Kapuze
    if (p.trait === 'duo') { c.fillStyle = '#1f4fa3'; rr(c, -tw / 2, -104, tw, 10, 3); c.fill(); c.fillStyle = '#fff'; rr(c, -tw / 2, -96, tw, 4, 2); c.fill(); } // Schal
    if (p.trait === 'friend') { c.fillStyle = '#0a1a10'; c.font = '700 12px Caveat, cursive'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BRO', 0, -84); }
    if (p.trait === 'talker') { c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-14 + (i % 3) * 14, -110 + Math.floor(i / 3) * 22 + (i % 2) * 8, 3, 0, TAU); c.fill(); } } // Hawaiihemd
    if (p.trait === 'singer') { c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(-18 + (i % 4) * 12, -112 + Math.floor(i / 4) * 18, 1.6 + Math.sin(t * 9 + i) * 0.6, 0, TAU); c.fill(); } } // Pailletten
    if (p.trait === 'ex') { c.strokeStyle = '#e63946'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -120); c.lineTo(-6, -96); c.moveTo(8, -120); c.lineTo(6, -96); c.stroke(); } // Lanyard
  }
  // Arme
  c.lineCap = 'round';
  const arm = (sx: number, sy: number, ex: number, ey: number) => {
    c.strokeStyle = OUT; c.lineWidth = 15; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = sleeve; c.lineWidth = 11; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
    c.beginPath(); c.arc(ex, ey + 4, 6.5, 0, TAU); fillStroke(c, p.skin);
  };
  const sx = tw / 2 - 4;
  if (view === 'back') {
    if (a.wave) { arm(-sx, -110, -sx - 6, -76); arm(sx, -110, sx + 16, -152 + Math.sin(t * 10) * 6); }
    else if (p.trait === 'phone') { arm(-sx, -110, -sx - 6, -76); arm(sx, -110, sx + 6, -134); c.fillStyle = '#222'; rr(c, sx + 1, -150, 11, 19, 3); c.fill(); c.fillStyle = 'rgba(120,200,255,0.7)'; rr(c, sx + 3, -147, 7, 13, 2); c.fill(); }
    else if (p.trait === 'friend') { arm(-sx, -110, -sx - 6, -76); arm(sx, -110, sx + 10, -92); c.fillStyle = '#f2c94c'; rr(c, sx + 4, -104, 12, 16, 3); c.fill(); c.fillStyle = '#fff'; rr(c, sx + 4, -104, 12, 4, 2); c.fill(); } // Bierbecher
    else { arm(-sx, -110, -sx - 6, -78); arm(sx, -110, sx + 6, -78); }
  } else {
    const sw = walk > 0 ? Math.sin(t * 13) * 9 : 0;
    arm(-sx, -110, -sx - 8 + sw, -64); arm(sx, -110, sx + 8 - sw, -64);
    if (p.trait === 'boss') { c.fillStyle = '#e63946'; c.beginPath(); c.moveTo(-3, -116); c.lineTo(3, -116); c.lineTo(4, -80); c.lineTo(0, -74); c.lineTo(-4, -80); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-9, -120); c.lineTo(0, -108); c.lineTo(9, -120); c.closePath(); c.fill(); }
    if (p.trait === 'ex') { c.strokeStyle = '#e63946'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -120); c.lineTo(0, -96); c.lineTo(8, -120); c.stroke(); c.fillStyle = '#fff'; rr(c, -7, -98, 14, 10, 2); c.fill(); }
    if (isPlayer) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-tw / 2 + 4, -72, tw - 8, 3); }
  }
  // Hals
  c.fillStyle = shade(p.skin, 0.9); rr(c, -7, -128, 14, 12, 4); c.fill();
  // Kopf
  c.save();
  const nod = a.nod ?? 0;
  c.translate(look * 5, nod * 4);
  c.rotate(look * 0.05);
  const hr = 22;
  c.beginPath(); c.ellipse(0, -142, hr, hr + 2, 0, 0, TAU); fillStroke(c, p.skin);
  const profile = view === 'back' && look !== 0;
  const showFace = view === 'front';
  // Ohren
  for (const side of [-1, 1]) {
    if (profile && side === look) continue;
    c.beginPath(); c.ellipse(side * 21, -140, 5, 6, 0, 0, TAU); fillStroke(c, shade(p.skin, 0.94));
  }
  // Haare
  const hairCol = p.hair;
  const hat = cos.hat ?? (p.hat ? (p.trait === 'boss' ? 'fedora' : 'cap') : undefined);
  if (!hat || p.hairStyle === 'long') {
    c.fillStyle = hairCol;
    switch (p.hairStyle) {
      case 'bald': c.fillStyle = shade(p.skin, 0.96); c.beginPath(); c.arc(-14, -150, 6, 0, TAU); c.arc(14, -150, 6, 0, TAU); c.fill(); c.fillStyle = hairCol; c.beginPath(); c.arc(-19, -146, 6, 0, TAU); c.arc(19, -146, 6, 0, TAU); c.fill(); break;
      case 'buzz': c.beginPath(); c.arc(0, -146, 22.5, Math.PI, TAU); c.fill(); break;
      case 'quiff': c.beginPath(); c.arc(0, -148, 22, Math.PI, TAU); c.fill(); c.beginPath(); c.ellipse(-6, -168, 16, 9, -0.35, 0, TAU); c.fill(); break;
      case 'curly': for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-21 + i * 7, -158 + Math.abs(3 - i) * 2, 7, 0, TAU); c.fill(); } c.beginPath(); c.arc(0, -150, 22, Math.PI, TAU); c.fill(); break;
      case 'long': c.beginPath(); c.arc(0, -148, 23, Math.PI, TAU); c.fill(); rr(c, -23, -150, 46, view === 'back' ? 40 : 26, 8); c.fill(); if (view === 'back') { c.fillStyle = shade(hairCol, 0.8); rr(c, -6, -150, 12, 40, 4); c.fill(); } break;
      default: c.beginPath(); c.arc(0, -148, 22.5, Math.PI, TAU); c.fill(); if (view === 'back' && !profile) { rr(c, -22.5, -150, 45, 16, 6); c.fill(); }
    }
    c.strokeStyle = OUT; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -148, 22.5, Math.PI, TAU); c.stroke();
  }
  if (hat === 'cap') { c.beginPath(); c.arc(0, -150, 23.5, Math.PI, TAU); fillStroke(c, p.trait === 'kid' ? '#e63946' : '#4a5a8a'); rr(c, -24, -152, 48, 6, 3); fillStroke(c, p.trait === 'kid' ? '#e63946' : '#4a5a8a'); if (view === 'front' || profile) { rr(c, look >= 0 ? 6 : -30, -154, 24, 6, 3); fillStroke(c, p.trait === 'kid' ? '#c0392b' : '#3a4a7a'); } }
  if (hat === 'fedora') { rr(c, -28, -156, 56, 7, 3); fillStroke(c, '#23233a'); rr(c, -17, -180, 34, 26, 5); fillStroke(c, '#23233a'); c.fillStyle = '#8a8aa8'; rr(c, -17, -164, 34, 5, 2); c.fill(); }
  if (hat === 'crown') { c.beginPath(); c.moveTo(-20, -156); c.lineTo(-20, -178); c.lineTo(-10, -166); c.lineTo(0, -182); c.lineTo(10, -166); c.lineTo(20, -178); c.lineTo(20, -156); c.closePath(); fillStroke(c, '#f2c94c'); }
  // Gesicht
  if (showFace) {
    // Augenbrauen
    c.strokeStyle = shade(hairCol, 0.8); c.lineWidth = 3; c.lineCap = 'round';
    const raise = shame > 0 ? -3 : 0;
    c.beginPath(); c.moveTo(-14, -152 + raise); c.lineTo(-4, -154 + raise); c.moveTo(4, -154 + raise); c.lineTo(14, -152 + raise); c.stroke();
    if (shame > 0) {
      c.strokeStyle = '#1a1a1a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-12, -146); c.lineTo(-4, -141); c.moveTo(12, -146); c.lineTo(4, -141); c.stroke();
      c.fillStyle = `rgba(230,57,70,${0.55 * shame})`; c.beginPath(); c.arc(-11, -133, 5, 0, TAU); c.arc(11, -133, 5, 0, TAU); c.fill();
    } else {
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-8, -143, 5, 4, 0, 0, TAU); c.ellipse(8, -143, 5, 4, 0, 0, TAU); c.fill();
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(-7 + look * 2, -143, 2.4, 0, TAU); c.arc(9 + look * 2, -143, 2.4, 0, TAU); c.fill();
    }
    c.strokeStyle = shade(p.skin, 0.75); c.lineWidth = 2; c.beginPath(); c.moveTo(1, -140); c.quadraticCurveTo(4, -133, -1, -131); c.stroke();
    c.strokeStyle = '#7a3a30'; c.lineWidth = 2.2; c.beginPath();
    if (shame > 0) c.arc(0, -121, 5, Math.PI + 0.3, -0.3); else if (p.trait === 'friend') c.arc(0, -130, 7, 0.2, Math.PI - 0.2); else { c.moveTo(-5, -126); c.quadraticCurveTo(0, -124, 5, -126); }
    c.stroke();
    if (p.beard) { c.fillStyle = hairCol; c.beginPath(); c.moveTo(-18, -136); c.quadraticCurveTo(-16, -114, 0, -114); c.quadraticCurveTo(16, -114, 18, -136); c.quadraticCurveTo(10, -122, 0, -121); c.quadraticCurveTo(-10, -122, -18, -136); c.fill(); }
  } else if (profile) {
    const sx2 = look * 12;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sx2, -143, 5, 4, 0, 0, TAU); c.fill();
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(sx2 + look * 1.5, -143, 2.4, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(look * 20, -140); c.lineTo(look * 28, -133); c.lineTo(look * 19, -129); c.closePath(); fillStroke(c, p.skin);
    c.strokeStyle = shade(hairCol, 0.8); c.lineWidth = 3; c.beginPath(); c.moveTo(look * 5, -153); c.lineTo(look * 17, -151); c.stroke();
    c.strokeStyle = '#7a3a30'; c.lineWidth = 2.2; c.beginPath();
    if (p.trait === 'friend' || a.wave) c.arc(look * 12, -128, 5, look > 0 ? -0.6 : Math.PI - 2.5, look > 0 ? 1.8 : Math.PI + 0.6);
    else if (p.trait === 'talker' || p.trait === 'singer') c.ellipse(look * 15, -126, 3, 2 + Math.abs(Math.sin(t * 9)) * 3, 0, 0, TAU);
    else { c.moveTo(look * 10, -126); c.lineTo(look * 20, -127); }
    c.stroke();
    if (p.beard) { c.fillStyle = hairCol; c.beginPath(); c.moveTo(look * 4, -134); c.quadraticCurveTo(look * 14, -112, look * 22, -132); c.quadraticCurveTo(look * 14, -120, look * 4, -122); c.fill(); }
  }
  // Brille
  const gl = cos.glasses ?? (p.glasses ? (p.trait === 'singer' ? 'shades' : 'round') : undefined);
  if (gl && (showFace || profile)) {
    const gx = profile ? look * 12 : 0;
    c.strokeStyle = '#1a1a1a'; c.lineWidth = 2;
    if (gl === 'shades') { c.fillStyle = '#1a1a1a'; rr(c, gx - 15, -149, 13, 10, 3); c.fill(); rr(c, gx + 2, -149, 13, 10, 3); c.fill(); c.beginPath(); c.moveTo(gx - 2, -145); c.lineTo(gx + 2, -145); c.stroke(); }
    else { c.beginPath(); c.arc(gx - 8, -143, 6.5, 0, TAU); c.moveTo(gx + 14.5, -143); c.arc(gx + 8, -143, 6.5, 0, TAU); c.moveTo(gx - 1.5, -143); c.lineTo(gx + 1.5, -143); c.stroke(); }
  }
  c.restore();
  // Extras neben der Figur
  if (p.trait === 'dog' && view === 'back') {
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx + 6, -78); c.quadraticCurveTo(40, -40, 46, -12); c.stroke();
    c.beginPath(); c.ellipse(52, -10, 17, 9, 0, 0, TAU); fillStroke(c, '#c9a26b');
    c.beginPath(); c.arc(66, -17, 8, 0, TAU); fillStroke(c, '#c9a26b');
    c.beginPath(); c.ellipse(68, -24, 4, 6, 0.5, 0, TAU); fillStroke(c, '#8a6a4a');
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(69, -18, 1.6, 0, TAU); c.fill();
    c.strokeStyle = '#c9a26b'; c.lineWidth = 4; c.beginPath(); c.moveTo(37, -8 + Math.sin(t * 6) * 3); c.lineTo(29, -16 + Math.sin(t * 6) * 4); c.stroke();
    for (const lx of [44, 58]) { c.beginPath(); c.moveTo(lx, -3); c.lineTo(lx, 1); c.stroke(); }
  }
  if (p.trait === 'singer') {
    c.fillStyle = '#c026d3'; c.font = '800 15px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const k = (t * 0.6) % 1;
    c.globalAlpha = 1 - k; c.fillText('♪', 28 + k * 10, -176 - k * 30); c.fillText('♫', -28 - k * 8, -186 - ((k + 0.5) % 1) * 30); c.globalAlpha = 1;
  }
  if (p.trait === 'boss' && view === 'back') { rr(c, sx + 10, -34, 22, 30, 3); fillStroke(c, '#3a2a1a'); c.fillStyle = '#8a6a4a'; rr(c, sx + 18, -38, 6, 5, 2); c.fill(); } // Aktentasche
  if (p.trait === 'kid') { rr(c, -12, -118, 24, 30, 6); fillStroke(c, '#2a9d8f'); } // Rucksack
  if (p.trait === 'giant') { c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = '800 11px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('XXL', 0, -84); }
  c.restore();
}
