/**
 * Jack als Büste aus Canvas-Primitiven. Ursprung: Halsansatz, y wächst nach unten.
 * Drei Merkmale tragen die Wiedererkennung: Cap, Schnurrbart, blonde Wellen unter dem Rand.
 */
export type Pose = 'idle' | 'swipe' | 'nod' | 'facepalm';

const SKIN = '#f1c7a3';
const SKIN_SHADE = '#d9a882';
const HAIR = '#e8c25c';
const HAIR_DARK = '#c9a03f';
const HOODIE = '#121419';
const HOODIE_HI = '#1c1f27';
const CAP = '#f5f2ea';
const CAP_SHADE = '#d9d4c8';
const INK = '#2a1e14';
const MOUSTACHE = '#c48f45';

const TAU = Math.PI * 2;

function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, rot = 0): void {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, TAU);
  c.fill();
}

function arm(c: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, mirrorHand = false): void {
  c.strokeStyle = HOODIE;
  c.lineCap = 'round';
  c.lineWidth = 34;
  c.beginPath();
  c.moveTo(sx, sy);
  c.lineTo(ex, ey);
  c.stroke();
  c.strokeStyle = HOODIE_HI;
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(sx, sy - 12);
  c.lineTo(ex - (ex - sx) * 0.1, ey - 12);
  c.stroke();
  // Hand
  ellipse(c, ex, ey, 17, 20, SKIN, mirrorHand ? 0.4 : -0.4);
  c.strokeStyle = SKIN_SHADE;
  c.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    c.beginPath();
    c.moveTo(ex + i * 7, ey - 8);
    c.lineTo(ex + i * 7, ey - 20);
    c.stroke();
  }
}

export function drawJack(c: CanvasRenderingContext2D, x: number, y: number, scale: number, pose: Pose, poseT: number, t: number): void {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const breathe = Math.sin(t * 2.1) * 2;
  const nodK = pose === 'nod' ? Math.sin(Math.min(1, poseT / 0.5) * Math.PI) : 0;
  const swipeK = pose === 'swipe' ? Math.sin(Math.min(1, poseT / 0.45) * Math.PI) : 0;
  const palmK = pose === 'facepalm' ? Math.min(1, poseT / 0.25) : 0;

  // Schultern und Hoodie
  c.fillStyle = HOODIE;
  c.beginPath();
  c.moveTo(-118, 34 + breathe);
  c.quadraticCurveTo(-60, 14 + breathe, -22, 18 + breathe);
  c.lineTo(22, 18 + breathe);
  c.quadraticCurveTo(60, 14 + breathe, 118, 34 + breathe);
  c.lineTo(126, 200);
  c.lineTo(-126, 200);
  c.closePath();
  c.fill();
  // Kapuze hinten
  c.fillStyle = HOODIE_HI;
  c.beginPath();
  c.ellipse(0, 26 + breathe, 52, 22, 0, Math.PI, TAU);
  c.fill();
  // Hoodie-Print in Handschrift
  c.save();
  c.translate(0, 96 + breathe);
  c.rotate(-0.06);
  c.fillStyle = '#f4f1ea';
  c.font = '700 26px Caveat, "Comic Sans MS", cursive';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('NO SLOP', 0, 0);
  c.restore();
  // Kette
  c.fillStyle = '#d5d9e0';
  for (let i = -5; i <= 5; i++) {
    const kx = i * 7;
    const ky = 30 + breathe + (25 - Math.abs(i) * 4.4);
    c.beginPath();
    c.arc(kx, ky, 2.2, 0, TAU);
    c.fill();
  }

  // Linker Arm bei Facepalm (aus Sicht des Betrachters rechts)
  if (pose === 'facepalm') {
    arm(c, 92, 60, 14 - 10 * palmK, -62 * palmK + 40 * (1 - palmK));
  }

  // Kopf
  c.save();
  c.translate(0, breathe);
  c.rotate(nodK * 0.1);
  // Hals
  c.fillStyle = SKIN_SHADE;
  c.fillRect(-17, -14, 34, 34);
  // Ohren
  ellipse(c, -45, -50, 8, 11, SKIN_SHADE);
  ellipse(c, 45, -50, 8, 11, SKIN_SHADE);
  // Haare hinter dem Kopf (blonde Wellen)
  c.fillStyle = HAIR_DARK;
  for (let i = 0; i < 6; i++) {
    const hx = -46 + i * 18.4;
    ellipse(c, hx, -72 + (i % 2) * 4, 13, 15, i % 2 ? HAIR : HAIR_DARK);
  }
  ellipse(c, -46, -48, 10, 16, HAIR, 0.3);
  ellipse(c, 46, -48, 10, 16, HAIR, -0.3);
  // Gesicht
  ellipse(c, 0, -52, 43, 49, SKIN);
  ellipse(c, 0, -34, 34, 22, SKIN_SHADE);
  ellipse(c, 0, -40, 36, 26, SKIN);
  // Pony unter dem Cap-Rand
  for (let i = -2; i <= 2; i++) ellipse(c, i * 16, -84, 11, 9, HAIR, i * 0.2);
  // Augenbrauen
  c.strokeStyle = HAIR_DARK;
  c.lineWidth = 3.5;
  c.lineCap = 'round';
  const browLift = pose === 'facepalm' ? 0 : nodK * 3;
  c.beginPath(); c.moveTo(-26, -66 - browLift); c.quadraticCurveTo(-17, -71 - browLift, -8, -67 - browLift); c.stroke();
  c.beginPath(); c.moveTo(8, -67 - browLift); c.quadraticCurveTo(17, -71 - browLift, 26, -66 - browLift); c.stroke();
  // Augen
  if (pose === 'nod') {
    c.strokeStyle = INK; c.lineWidth = 3;
    c.beginPath(); c.arc(-17, -57, 6, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    c.beginPath(); c.arc(17, -57, 6, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  } else {
    ellipse(c, -17, -56, 7, 5.5, '#ffffff');
    ellipse(c, 17, -56, 7, 5.5, '#ffffff');
    const look = pose === 'swipe' ? -3 : 0;
    ellipse(c, -17 + look, -56, 3.4, 3.4, '#4a6b8a');
    ellipse(c, 17 + look, -56, 3.4, 3.4, '#4a6b8a');
    ellipse(c, -17 + look, -56, 1.8, 1.8, INK);
    ellipse(c, 17 + look, -56, 1.8, 1.8, INK);
    ellipse(c, -15.5 + look, -57.5, 1, 1, '#fff');
    ellipse(c, 18.5 + look, -57.5, 1, 1, '#fff');
  }
  // Nase
  c.strokeStyle = SKIN_SHADE; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(2, -50); c.quadraticCurveTo(6, -40, -1, -38); c.stroke();
  // Schnurrbart
  c.strokeStyle = MOUSTACHE; c.lineWidth = 6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(-10, -36, -19, -29); c.stroke();
  c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(10, -36, 19, -29); c.stroke();
  // Mund
  c.strokeStyle = '#8a4a3c'; c.lineWidth = 2.5;
  c.beginPath();
  if (pose === 'nod') c.arc(0, -26, 9, 0.15, Math.PI - 0.15);
  else if (pose === 'facepalm') { c.moveTo(-7, -20); c.lineTo(7, -21); }
  else c.arc(0, -25, 7, 0.3, Math.PI - 0.3);
  c.stroke();
  // Cap
  c.fillStyle = CAP;
  c.beginPath();
  c.ellipse(0, -86, 47, 30, 0, Math.PI, TAU);
  c.fill();
  c.fillStyle = CAP_SHADE;
  c.beginPath();
  c.ellipse(-28, -92, 14, 20, 0.5, Math.PI * 0.9, Math.PI * 1.7);
  c.fill();
  // Schirm
  c.fillStyle = CAP;
  c.beginPath();
  c.moveTo(-46, -84);
  c.quadraticCurveTo(0, -78, 62, -82);
  c.quadraticCurveTo(62, -70, 44, -70);
  c.quadraticCurveTo(0, -66, -46, -76);
  c.closePath();
  c.fill();
  c.fillStyle = CAP_SHADE;
  c.beginPath();
  c.moveTo(-46, -84);
  c.quadraticCurveTo(0, -80, 60, -82);
  c.quadraticCurveTo(0, -76, -46, -80);
  c.closePath();
  c.fill();
  // Logo-Punkt auf der Cap
  ellipse(c, 6, -100, 4.5, 4.5, '#5cf2a0');
  c.restore();

  // Rechter Arm beim Wischen (aus Sicht des Betrachters links)
  if (pose === 'swipe') {
    const ex = -110 - 70 * swipeK;
    const ey = 30 - 90 * swipeK;
    arm(c, -92, 60, ex, ey, true);
  }
  c.restore();
}

/** Sprechblase mit Spitze nach unten links. */
export function drawBubble(c: CanvasRenderingContext2D, x: number, y: number, text: string, alpha: number): void {
  c.save();
  c.globalAlpha = alpha;
  c.font = '800 18px Inter, system-ui, sans-serif';
  const w = c.measureText(text).width + 28;
  const h = 40;
  const r = 14;
  c.fillStyle = '#f4f1ea';
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.lineTo(x + 34, y + h);
  c.lineTo(x + 18, y + h + 14);
  c.lineTo(x + 22, y + h);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
  c.fill();
  c.fillStyle = '#0a0b10';
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(text, x + 14, y + h / 2 + 1);
  c.restore();
}
