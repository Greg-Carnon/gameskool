import { beginFrame, createView } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, isMuted, setMuted, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { createState, nearestMine, pointerDown, pointerUp, RULES, score, startLevel, update, type Events, type State } from './logic';
import { ACHIEVEMENTS, buy, loadMeta, modsFrom, saveMeta, unlock, UPGRADES, upgradeCost, type Meta } from './meta';
import { render, type SceneFx } from './render';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('c');
const view = createView(canvas);
const particles = new Particles(400);
const floats = new FloatText(16);
const shake = new Shake(10, 3);
const sfx = createSfx({
  ping: [0.6, 0.01, 1200, 0.01, 0.1, 0.5, 0, 1, 0, 0, -600, 0.3, 0, 0, 0, 0, 0, 0.5, 0.05],
  bigping: [0.9, 0.01, 800, 0.02, 0.2, 0.8, 0, 1, 0, 0, -500, 0.5, 0, 0, 0, 0, 0, 0.5, 0.08],
  pearl: [0.5, 0.02, 900, 0.01, 0.05, 0.15, 0, 1.4, 0, 0, 300, 0.06, 0, 0, 0, 0, 0, 0.8, 0.02],
  tank: [0.6, 0.02, 400, 0.02, 0.15, 0.25, 0, 1.2, 0, 0, 150, 0.1, 0, 0, 0, 0, 0, 0.8, 0.03],
  tick: [0.4, 0, 1800, 0.005, 0.01, 0.04, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01],
  hatch: [0.7, 0.02, 500, 0.02, 0.2, 0.4, 0, 1.3, 0, 0, 250, 0.2, 0, 0, 0, 0, 0, 0.7, 0.05],
  descend: [0.8, 0.05, 220, 0.1, 0.5, 0.8, 1, 0.8, -2, 0, 0, 0, 0, 0.2, 0, 0.2, 0, 0.6, 0.1],
  boom: [1.5, 0.1, 50, 0.05, 0.3, 0.8, 4, 1, 0, 0, 0, 0, 0, 2.5, 0, 0.5, 0, 0.5, 0.15],
  sting: [0.8, 0.05, 400, 0.02, 0.1, 0.3, 3, 1.5, -10, 0, 0, 0, 0, 0.5, 0, 0.2, 0, 0.7, 0.05],
  drown: [1, 0.1, 120, 0.1, 0.4, 0.8, 1, 0.7, -3, 0, 0, 0, 0, 0.3, 0, 0.3, 0, 0.6, 0.1],
  roar: [1.4, 0.1, 70, 0.1, 0.4, 0.6, 2, 0.6, 3, 0, 0, 0, 0, 1.2, 0, 0.3, 0, 0.6, 0.1],
  bosshit: [1.2, 0.05, 160, 0.02, 0.2, 0.5, 4, 1, -5, 0, 0, 0, 0, 1.5, 0, 0.4, 0, 0.6, 0.1],
  bossdown: [1.5, 0.05, 300, 0.05, 0.5, 1.2, 0, 1.2, 0, 0, 200, 0.4, 0, 0, 0, 0, 0, 0.6, 0.1],
  award: [0.6, 0.02, 1100, 0.01, 0.1, 0.3, 0, 1.4, 0, 0, 400, 0.1, 0, 0, 0, 0, 0, 0.7, 0.03],
});

let meta: Meta = loadMeta();
let state: State = createState(modsFrom(meta));
let rng = mulberry32(1);
let playing = false;
let tickAcc = 0;
const fx: SceneFx = { t: 0, fade: 0, bossFlash: 0 };

const startEl = $('start');
const overEl = $('over');
const o2El = $('o2');
const depthEl = $('depth');
const pearlsEl = $('pearls');
const bossHud = $('bossHud');
const bossHp = $('bossHp');
const banner = $('banner');
const bannerTitle = $('bannerTitle');
const bannerSub = $('bannerSub');
const award = $('award');
const shop = $('shop');
const achEl = $('achievements');
const bankEl = $('bank');
const bestDepthEl = $('bestDepth');
const soundBtn = $('soundBtn');

function showBanner(title: string, sub: string, ms = 2600): void {
  bannerTitle.textContent = title;
  bannerSub.textContent = sub;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), ms);
}
function showAward(text: string): void {
  award.textContent = `Achievement: ${text}`;
  award.classList.add('show');
  sfx.play('award');
  setTimeout(() => award.classList.remove('show'), 2200);
}
function tryUnlock(id: string): void {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (a && unlock(meta, id)) showAward(`${a.icon} ${a.name}`);
}

const events: Events = {
  onPearl(x, y) {
    particles.emit({ x, y, count: 20, speed: 120, life: 0.5, color: '#fff2c4', size: 3 });
    floats.add(`+${RULES.pearlAir} O₂`, x, y - 30, { color: '#7ff5e6', size: 18 });
    sfx.play('pearl', 0.03, 0.8 + Math.min(0.5, state.pearls * 0.08));
    tryUnlock('first');
    if (state.pearlsDive >= 15) tryUnlock('pearls15');
  },
  onTank(x, y) {
    particles.emit({ x, y, count: 16, speed: 90, life: 0.5, color: '#9fb6c4', size: 3 });
    floats.add(`+${RULES.tankAir} O₂`, x, y - 30, { color: '#9fb6c4', size: 20 });
    sfx.play('tank');
  },
  onHatchOpen() {
    sfx.play('hatch');
    floats.add('HATCH OPEN', RULES.hatch.x, RULES.hatch.y - 60, { color: '#7ff5e6', size: 22, life: 1.4 });
    if (state.pingsThisLevel <= 2) tryUnlock('quiet');
  },
  onDescend(level, index) {
    fx.fade = 1;
    showBanner(`${level.depth} m · ${level.name}`, level.intro);
    if (index > 0) sfx.play('descend');
    if (index === 1) tryUnlock('kelp');
    if (index === 2) tryUnlock('wreck');
    if (index === 3) tryUnlock('trench');
    if (level.boss) { tryUnlock('angler'); bossHud.hidden = false; bossHp.textContent = '●●●'; }
    else bossHud.hidden = true;
    if (level.depth > meta.bestDepth) { meta.bestDepth = level.depth; saveMeta(meta); }
  },
  onBossHunt() { sfx.play('roar', 0.1, 0.6); },
  onBossHit(x, y, hpLeft) {
    particles.emit({ x, y, count: 50, speed: 220, life: 0.7, color: '#ff9a5c', size: 4 });
    shake.add(0.7); fx.bossFlash = 1;
    sfx.play('bosshit');
    floats.add('HIT!', x, y - 40, { color: '#ff9a5c', size: 30, life: 1 });
    bossHp.textContent = '●'.repeat(hpLeft) + '○'.repeat(RULES.boss.hp - hpLeft);
  },
  onBossDown(x, y) {
    particles.emit({ x, y, count: 90, speed: 260, life: 1, color: '#fff2c4', size: 4 });
    shake.add(1); fx.bossFlash = 1;
    sfx.play('bossdown');
    floats.add('ANGLER DOWN', x, y - 50, { color: '#fff6d0', size: 30, life: 1.6 });
    bossHud.hidden = true;
    tryUnlock('slayer');
  },
  onDeath(by) {
    playing = false;
    shake.add(by === 'mine' || by === 'boss' ? 1 : 0.5);
    sfx.play(by === 'mine' ? 'boom' : by === 'boss' ? 'roar' : by === 'jelly' || by === 'fish' ? 'sting' : 'drown');
    particles.emit({ x: state.x, y: state.y, count: 50, speed: 200, life: 0.7, color: by === 'mine' || by === 'boss' ? '#ff9a5c' : '#7ff5e6', size: 4 });
    for (const o of state.objects) o.vis = 1;
    if (state.boss) state.boss.vis = 1;
    const sc = score(state);
    meta.pearlBank += state.pearlsDive;
    meta.dives++;
    if (sc > meta.bestScore) meta.bestScore = sc;
    saveMeta(meta);
    const cause = { mine: 'You hit a mine.', boss: 'The Angler got you.', jelly: 'Stung by a jellyfish.', fish: 'The echo fish found you.', oxygen: 'Out of oxygen.', pearl: '', tank: '' }[by];
    $('finalDepth').textContent = `${state.level.depth} m`;
    $('cause').textContent = cause;
    $('diveLog').textContent = `${state.level.name} · ${state.pearlsDive} pearls · ${Math.floor(state.t)} s`;
    $('bankLine').textContent = `+${state.pearlsDive} pearls banked`;
    $('bestLine').textContent = sc >= meta.bestScore && sc > 0 ? 'New record!' : `Record: ${meta.bestScore}`;
    setTimeout(() => { overEl.hidden = false; }, 700);
  },
};

function startGame(): void {
  meta = loadMeta();
  rng = mulberry32((Date.now() >>> 0) || 1);
  state = createState(modsFrom(meta));
  playing = true;
  startEl.hidden = true;
  overEl.hidden = true;
  const startAt = Math.max(0, Number(new URLSearchParams(location.search).get('level') ?? 0) || 0);
  startLevel(state, startAt, rng, events);
}

function renderShop(): void {
  bankEl.textContent = String(meta.pearlBank);
  bestDepthEl.textContent = meta.bestDepth > 0 ? `Best depth ${meta.bestDepth} m` : 'No dives yet';
  shop.innerHTML = '';
  for (const u of UPGRADES) {
    const tier = meta.upgrades[u.id];
    const cost = upgradeCost(meta, u.id);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div><b>${u.name}</b><small>${u.desc}</small><span class="tiers">${'●'.repeat(tier)}${'○'.repeat(u.costs.length - tier)}</span></div>`;
    const btn = document.createElement('button');
    btn.className = 'buy';
    btn.textContent = cost === null ? 'Max' : `${cost} 🫧`;
    btn.disabled = cost === null || meta.pearlBank < cost;
    btn.addEventListener('click', () => { unlockAudio(); if (buy(meta, u.id)) { sfx.play('award'); renderShop(); } });
    row.appendChild(btn);
    shop.appendChild(row);
  }
  achEl.innerHTML = ACHIEVEMENTS.map((a) => `<span class="ach ${meta.achievements.includes(a.id) ? 'on' : ''}" title="${a.name}: ${a.desc}">${a.icon}</span>`).join('');
}

bindPointer(view, {
  down(x, y) { unlockAudio(); if (playing) pointerDown(state, x, y); },
  up() {
    unlockAudio();
    if (!playing) return;
    const wasHolding = state.holding;
    const big = pointerUp(state, events);
    if (wasHolding) sfx.play(big ? 'bigping' : 'ping', 0.02);
  },
});
$('startBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startGame(); });
$('menuBtn').addEventListener('click', () => { overEl.hidden = true; renderShop(); startEl.hidden = false; });
$('shareBtn').addEventListener('click', async () => {
  const text = `SONAR · ${state.level.depth} m · ${state.pearlsDive} pearls${state.bossDefeated ? ' · Angler slain' : ''}\n${'🫧'.repeat(Math.min(10, state.pearlsDive))}\n${location.href}`;
  try {
    if (navigator.share) await navigator.share({ text });
    else { await navigator.clipboard.writeText(text); floats.add('Copied', state.x, state.y - 40, { color: '#7ff5e6', size: 18 }); }
  } catch { /* abgebrochen */ }
});
function syncSound(): void { soundBtn.textContent = isMuted() ? '🔇' : '🔊'; }
soundBtn.addEventListener('click', () => { unlockAudio(); setMuted(!isMuted()); syncSound(); });
syncSound();
renderShop();

startLoop({
  update(dt) {
    fx.t += dt;
    fx.fade = Math.max(0, fx.fade - dt * 1.4);
    fx.bossFlash = Math.max(0, fx.bossFlash - dt * 3);
    if (playing) {
      update(state, dt, rng, events);
      if (state.transition > 0) fx.fade = Math.min(1, fx.fade + dt * 1.6);
      const nm = nearestMine(state);
      if (nm < 90) { tickAcc += dt; const period = 0.15 + (nm / 90) * 0.5; if (tickAcc > period) { tickAcc = 0; sfx.play('tick', 0.02, 0.5); } }
    }
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, '#020a12');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state, fx, playing);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    o2El.style.width = `${Math.max(0, state.oxygen)}%`;
    o2El.style.background = state.oxygen < 25 ? '#ff4d4d' : '#7ff5e6';
    depthEl.textContent = `${state.level.depth} m`;
    pearlsEl.textContent = `🫧 ${state.pearls}/${state.level.pearlsNeeded}`;
  },
});
