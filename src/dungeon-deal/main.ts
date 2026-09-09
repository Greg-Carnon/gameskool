import { mulberry32 } from '../kit/rng';
import { createSfx, unlockAudio } from '../kit/sfx';
import { load, save } from '../kit/storage';
import { createRun, draw, leave, monstersLeft, type Card, type Run } from './deck';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const sfx = createSfx({
  flip: [0.5, 0.05, 300, 0.01, 0.02, 0.08, 4, 1.5, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0.8, 0.02],
  gold: [0.5, 0.02, 1000, 0.01, 0.05, 0.12, 0, 1.6, 0, 0, 400, 0.05, 0, 0, 0, 0, 0, 0.8, 0.02],
  hurt: [0.9, 0.05, 150, 0.02, 0.15, 0.3, 2, 0.9, -5, 0, 0, 0, 0, 0.5, 0, 0.2, 0, 0.7, 0.05],
  potion: [0.5, 0.02, 500, 0.02, 0.1, 0.2, 0, 1.2, 0, 0, 250, 0.1, 0, 0, 0, 0, 0, 0.8, 0.03],
  trap: [0.8, 0.05, 250, 0.01, 0.1, 0.3, 3, 2, -20, 0, 0, 0, 0, 0.4, 0, 0.2, 0, 0.7, 0.05],
  leave: [0.7, 0.02, 600, 0.02, 0.1, 0.3, 0, 1.3, 0, 0, 200, 0.15, 0, 0, 0, 0, 0, 0.8, 0.03],
  die: [1.2, 0.1, 90, 0.05, 0.4, 0.9, 2, 0.8, -4, 0, 0, 0, 0, 0.5, 0, 0.3, 0, 0.6, 0.1],
});

const BEST_KEY = 'dd-best';
let best = load<number>(BEST_KEY, 0);
let rng = mulberry32((Date.now() >>> 0) || 1);
let run: Run = createRun(rng);
let busy = false;

const ICON: Record<Card['kind'], string> = {
  gold: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#f2c94c" stroke="#8a5a00" stroke-width="4"/><circle cx="32" cy="32" r="16" fill="none" stroke="#8a5a00" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="800" fill="#8a5a00" font-family="Cinzel, serif">G</text></svg>',
  monster: '<svg viewBox="0 0 64 64"><path d="M32 8c-13 0-22 9-22 21 0 8 4 13 8 16v9h28v-9c4-3 8-8 8-16 0-12-9-21-22-21z" fill="#e8e0d0" stroke="#3a2a1a" stroke-width="3"/><circle cx="23" cy="30" r="5" fill="#3a2a1a"/><circle cx="41" cy="30" r="5" fill="#3a2a1a"/><path d="M28 42h8" stroke="#3a2a1a" stroke-width="3"/><path d="M24 54v-6M32 54v-6M40 54v-6" stroke="#3a2a1a" stroke-width="3"/></svg>',
  potion: '<svg viewBox="0 0 64 64"><path d="M26 8h12v12l10 18a12 12 0 0 1-10 18H26a12 12 0 0 1-10-18l10-18z" fill="#c8f0ff" stroke="#1d5a6e" stroke-width="3"/><path d="M20 40h24a10 10 0 0 1-8 14H28a10 10 0 0 1-8-14z" fill="#3fbf8a"/><rect x="24" y="6" width="16" height="5" rx="2" fill="#1d5a6e"/></svg>',
  trap: '<svg viewBox="0 0 64 64"><path d="M8 54 20 22l12 32 12-32 12 32z" fill="#8a8a8a" stroke="#2a2a2a" stroke-width="3" stroke-linejoin="round"/><rect x="6" y="52" width="52" height="6" fill="#2a2a2a"/></svg>',
};
const LABEL: Record<Card['kind'], (c: Card) => string> = {
  gold: (c) => `+${c.value} gold`,
  monster: (c) => `Monster, -${c.value} HP`,
  potion: (c) => `Potion, +${c.value} HP`,
  trap: () => 'Trap, gold halved',
};

const deckEl = $('deck');
const cardEl = $('card');
const cardFace = $('cardFace');
const cardLabel = $('cardLabel');
const hpEl = $('hp');
const carriedEl = $('carried');
const bankedEl = $('banked');
const floorEl = $('floor');
const monstersEl = $('monsters');
const remainEl = $('remain');
const leaveBtn = $<HTMLButtonElement>('leaveBtn');
const overEl = $('over');
const startEl = $('start');
const toast = $('toast');

function hearts(): string {
  return '♥'.repeat(run.hp) + '<span class="dim">' + '♥'.repeat(run.maxHp - run.hp) + '</span>';
}

function sync(): void {
  hpEl.innerHTML = hearts();
  carriedEl.textContent = String(run.carried);
  bankedEl.textContent = String(run.banked);
  floorEl.textContent = `Floor ${run.floor}`;
  monstersEl.textContent = String(monstersLeft(run));
  remainEl.textContent = `${run.deck.length} cards`;
  leaveBtn.disabled = run.dead || run.carried === 0;
  leaveBtn.textContent = run.carried > 0 ? `Leave with ${run.carried} gold` : 'Nothing to take yet';
}

function showToast(text: string, cls = ''): void {
  toast.textContent = text;
  toast.className = `toast show ${cls}`;
  setTimeout(() => toast.classList.remove('show'), 900);
}

function reveal(c: Card): void {
  cardFace.innerHTML = ICON[c.kind];
  cardLabel.textContent = LABEL[c.kind](c);
  cardEl.className = `card kind-${c.kind}`;
  requestAnimationFrame(() => cardEl.classList.add('flipped'));
}

function onDraw(): void {
  if (busy || run.dead) return;
  unlockAudio();
  const c = draw(run);
  if (!c) { showToast('The deck is empty. Leave.'); return; }
  busy = true;
  cardEl.classList.remove('flipped');
  sfx.play('flip');
  setTimeout(() => {
    reveal(c);
    sfx.play(c.kind === 'gold' ? 'gold' : c.kind === 'monster' ? 'hurt' : c.kind === 'potion' ? 'potion' : 'trap');
    if (c.kind === 'monster') document.body.classList.add('hit');
    setTimeout(() => document.body.classList.remove('hit'), 300);
    sync();
    busy = false;
    if (run.dead) setTimeout(gameOver, 700);
    else if (run.deck.length === 0) showToast('Deck empty. Leave now.');
  }, 160);
}

function onLeave(): void {
  if (busy || run.dead || run.carried === 0) return;
  unlockAudio();
  const g = leave(run, rng);
  sfx.play('leave');
  showToast(`+${g} banked. Floor ${run.floor}.`, 'good');
  cardEl.classList.remove('flipped');
  cardLabel.textContent = '';
  sync();
}

function gameOver(): void {
  sfx.play('die');
  if (run.banked > best) { best = run.banked; save(BEST_KEY, best); }
  $('finalBanked').textContent = String(run.banked);
  $('floorLine').textContent = `Died on floor ${run.floor}. The dungeon keeps what you carried.`;
  $('bestLine').textContent = run.banked >= best && run.banked > 0 ? 'New record!' : `Record: ${best}`;
  overEl.hidden = false;
}

function start(): void {
  rng = mulberry32((Date.now() >>> 0) || 1);
  run = createRun(rng);
  cardEl.classList.remove('flipped');
  cardLabel.textContent = '';
  startEl.hidden = true;
  overEl.hidden = true;
  sync();
}

deckEl.addEventListener('click', onDraw);
leaveBtn.addEventListener('click', onLeave);
$('startBtn').addEventListener('click', () => { unlockAudio(); start(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); start(); });
sync();
