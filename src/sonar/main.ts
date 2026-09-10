import { beginFrame, createView } from '../kit/canvas';
import { FloatText } from '../kit/floattext';
import { vibrate } from '../kit/haptics';
import { bindPointer } from '../kit/input';
import { startLoop } from '../kit/loop';
import { Particles } from '../kit/particles';
import { mulberry32 } from '../kit/rng';
import { createSfx, isMuted, setMuted, unlockAudio } from '../kit/sfx';
import { Shake } from '../kit/shake';
import { startAmbient, updateAmbient } from './ambient';
import { createState, nearestMine, pointerDown, pointerUp, RULES, score, startLevel, update, type Events, type State } from './logic';
import { ACHIEVEMENTS, buy, loadMeta, logDive, modsFrom, saveMeta, unlock, UPGRADES, upgradeCost, type Meta } from './meta';
import { render, type SceneFx } from './render';
import { drawIntroFrame, INTRO_LINES } from './intro';
import { drawTutorial, type TutStage } from './tutorial';
import { drawJack } from '../jack-vs-slop/jack';

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
  chain: [0.5, 0.02, 1300, 0.01, 0.05, 0.2, 0, 1.5, 0, 0, 500, 0.08, 0, 0, 0, 0, 0, 0.7, 0.02],
});

let meta: Meta = loadMeta();
let state: State = createState(modsFrom(meta));
let rng = mulberry32(1);
let playing = false;
let tickAcc = 0;
let bubbleAcc = 0;
let freeze = 0;
let tut: TutStage = 'done';
let introFrame = 0;
let introT = 0;
let sayTimer: number | undefined;
const fx: SceneFx = { t: 0, fade: 0, bossFlash: 0, shownDepth: 20 };

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
const logEl = $('divelog');
const bankEl = $('bank');
const bestDepthEl = $('bestDepth');
const soundBtn = $('soundBtn');
const introEl = $('intro');
const introCanvas = $<HTMLCanvasElement>('introCanvas');
const introLine = $('introLine');
const introDots = $('introDots');
const introTap = $('introTap');
const introDive = $<HTMLButtonElement>('introDive');
const sayEl = $('say');
const sayText = $('sayText');
const jackFace = $<HTMLCanvasElement>('jackFace');
const panel = $('panel');

function showBanner(title: string, sub: string, ms = 2600, big = false): void {
  bannerTitle.textContent = title;
  bannerSub.textContent = sub;
  banner.classList.toggle('big', big);
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
function say(text: string, ms = 2600): void {
  sayText.textContent = text;
  sayEl.classList.add('show');
  if (sayTimer) clearTimeout(sayTimer);
  sayTimer = window.setTimeout(() => sayEl.classList.remove('show'), ms);
}
function paintJackFace(): void {
  const c = jackFace.getContext('2d')!;
  c.clearRect(0, 0, 108, 108);
  drawJack(c, 54, 118, 0.62, 'idle', 0, fx.t);
}
function showIntro(): void {
  introFrame = 0; introT = 0;
  startEl.hidden = true;
  introEl.hidden = false;
  syncIntro();
}
function syncIntro(): void {
  introLine.textContent = INTRO_LINES[introFrame];
  [...introDots.children].forEach((d, i) => d.classList.toggle('on', i === introFrame));
  const last = introFrame === INTRO_LINES.length - 1;
  introTap.hidden = last;
  introDive.hidden = !last;
}
function advanceIntro(): void {
  if (introFrame < INTRO_LINES.length - 1) { introFrame++; introT = 0; syncIntro(); sfx.play('ping', 0.05, 0.4); }
}
function endIntro(): void {
  meta.introSeen = true; saveMeta(meta);
  introEl.hidden = true;
  startGame();
}

const events: Events = {
  onPearl(x, y, chain) {
    particles.emit({ x, y, count: 20 + chain * 6, speed: 120, life: 0.5, color: '#fff2c4', size: 3 });
    const air = RULES.pearlAir + (chain - 1) * RULES.chainAir;
    floats.add(`+${air} O₂`, x, y - 30, { color: '#7ff5e6', size: 18 });
    if (chain >= 2) { floats.add(`CHAIN ×${chain}`, x, y - 56, { color: '#fff6d0', size: 22 + Math.min(10, chain * 2), life: 0.9 }); sfx.play('chain', 0.03, 0.6 + chain * 0.1); }
    sfx.play('pearl', 0.03, 0.8 + Math.min(0.5, chain * 0.1));
    vibrate(12);
    tryUnlock('first');
    if (state.pearlsDive >= 15) tryUnlock('pearls15');
    if (tut === 'pearl') { tut = 'hold'; say('A real one. No prompt made this.'); }
  },
  onTank(x, y) {
    particles.emit({ x, y, count: 16, speed: 90, life: 0.5, color: '#9fb6c4', size: 3 });
    floats.add(`+${RULES.tankAir} O₂`, x, y - 30, { color: '#9fb6c4', size: 20 });
    sfx.play('tank');
  },
  onHatchOpen() {
    sfx.play('hatch');
    floats.add('HATCH OPEN', RULES.hatch.x, RULES.hatch.y - 60, { color: '#7ff5e6', size: 22, life: 1.4 });
    if (tut !== 'done') { tut = 'hatch'; say("Deeper. The slop can't follow."); }
    if (state.pingsThisLevel <= 2) tryUnlock('quiet');
  },
  onDescend(level, index) {
    fx.fade = 1;
    if (tut === 'hatch') { tut = 'done'; meta.tutorialDone = true; saveMeta(meta); }
    if (level.boss) {
      showBanner('THE ANGLER', 'Lure it into the mines.', 3600, true);
      say("So that's what guards them.", 3200);
      sfx.play('roar', 0.05, 1.2);
      vibrate([40, 60, 80]);
      tryUnlock('angler');
      bossHud.hidden = false; bossHp.textContent = '●●●';
    } else {
      showBanner(`${level.depth} m · ${level.name}`, level.intro);
      bossHud.hidden = true;
    }
    if (index > 0) sfx.play('descend');
    if (index === 1) tryUnlock('kelp');
    if (index === 2) tryUnlock('wreck');
    if (index === 3) tryUnlock('trench');
    if (level.depth > meta.bestDepth) { meta.bestDepth = level.depth; saveMeta(meta); }
  },
  onBossHunt() { sfx.play('roar', 0.1, 0.6); vibrate(30); },
  onBossHit(x, y, hpLeft) {
    particles.emit({ x, y, count: 50, speed: 220, life: 0.7, color: '#ff9a5c', size: 4 });
    shake.add(0.7); fx.bossFlash = 1; freeze = 0.08;
    sfx.play('bosshit');
    vibrate([30, 40, 30]);
    floats.add('HIT!', x, y - 40, { color: '#ff9a5c', size: 30, life: 1 });
    bossHp.textContent = '●'.repeat(hpLeft) + '○'.repeat(RULES.boss.hp - hpLeft);
  },
  onBossDown(x, y) {
    particles.emit({ x, y, count: 90, speed: 260, life: 1, color: '#fff2c4', size: 4 });
    shake.add(1); fx.bossFlash = 1; freeze = 0.14;
    sfx.play('bossdown');
    vibrate([60, 40, 60, 40, 120]);
    floats.add('ANGLER DOWN', x, y - 50, { color: '#fff6d0', size: 30, life: 1.6 });
    bossHud.hidden = true;
    tryUnlock('slayer');
  },
  onDeath(by) {
    playing = false;
    freeze = 0.12;
    shake.add(by === 'mine' || by === 'boss' ? 1 : 0.5);
    sfx.play(by === 'mine' ? 'boom' : by === 'boss' ? 'roar' : by === 'jelly' || by === 'fish' ? 'sting' : 'drown');
    vibrate(by === 'mine' || by === 'boss' ? [80, 40, 120] : 80);
    particles.emit({ x: state.x, y: state.y, count: 50, speed: 200, life: 0.7, color: by === 'mine' || by === 'boss' ? '#ff9a5c' : '#7ff5e6', size: 4 });
    for (const o of state.objects) o.vis = 1;
    if (state.boss) state.boss.vis = 1;
    say(by === 'oxygen' ? 'Out of air. Not out of spite.' : 'The slop wins this one.', 2400);
    const sc = score(state);
    meta.pearlBank += state.pearlsDive;
    meta.dives++;
    if (sc > meta.bestScore) meta.bestScore = sc;
    logDive(meta, { depth: state.level.depth, pearls: state.pearlsDive, level: state.level.name, score: sc, date: new Date().toISOString().slice(0, 10) });
    saveMeta(meta);
    const cause = { mine: 'You hit a mine.', boss: 'The Angler got you.', jelly: 'Stung by a jellyfish.', fish: 'The echo fish found you.', oxygen: 'Out of oxygen.', pearl: '', tank: '' }[by];
    $('finalDepth').textContent = `${state.level.depth} m`;
    $('cause').textContent = cause;
    $('diveLog').textContent = `${state.level.name} · ${state.pearlsDive} pearls · ${Math.floor(state.t)} s · score ${sc}`;
    $('bankLine').textContent = `+${state.pearlsDive} pearls banked`;
    $('bestLine').textContent = sc >= meta.bestScore && sc > 0 ? 'New record!' : `Record: ${meta.bestScore}`;
    setTimeout(() => { overEl.hidden = false; }, 800);
  },
};

function startGame(): void {
  meta = loadMeta();
  rng = mulberry32((Date.now() >>> 0) || 1);
  const startAt = Math.max(0, Number(new URLSearchParams(location.search).get('level') ?? 0) || 0);
  const tutorial = !meta.tutorialDone && startAt === 0;
  state = createState(modsFrom(meta), tutorial);
  playing = true;
  startEl.hidden = true;
  overEl.hidden = true;
  startLevel(state, startAt, rng, events);
  fx.shownDepth = state.level.depth;
  tut = tutorial ? 'tap' : 'done';
  if (tutorial) setTimeout(() => { if (tut === 'tap') say('Dark. Finally. Ping to see.'); }, 1600);
}

function renderShop(): void {
  bankEl.textContent = String(meta.pearlBank);
  bestDepthEl.textContent = meta.bestDepth > 0 ? `Best depth ${meta.bestDepth} m · ${meta.dives} dives` : 'No dives yet';
  shop.innerHTML = '';
  for (const u of UPGRADES) {
    const tier = meta.upgrades[u.id];
    const cost = upgradeCost(meta, u.id);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div><b>${u.name}</b><small>${u.desc}</small><span class="tiers">${'●'.repeat(tier)}${'○'.repeat(u.costs.length - tier)}</span></div>`;
    const btn = document.createElement('button');
    btn.className = 'buy';
    btn.textContent = cost === null ? 'Max' : `${cost} pearls`;
    btn.disabled = cost === null || meta.pearlBank < cost;
    btn.addEventListener('click', () => { unlockAudio(); if (buy(meta, u.id)) { sfx.play('award'); renderShop(); } });
    row.appendChild(btn);
    shop.appendChild(row);
  }
  achEl.innerHTML = ACHIEVEMENTS.map((a) => `<span class="ach ${meta.achievements.includes(a.id) ? 'on' : ''}" title="${a.name}: ${a.desc}">${a.icon}</span>`).join('');
  logEl.innerHTML = meta.divelog.length
    ? meta.divelog.map((d, i) => `<div class="log"><span>#${i + 1}</span><b>${d.depth} m</b><span>${d.level}</span><span>${d.pearls} pearls</span><span>${d.score}</span></div>`).join('')
    : '';
}

bindPointer(view, {
  down(x, y) { unlockAudio(); startAmbient(); if (playing) pointerDown(state, x, y); },
  up() {
    unlockAudio();
    if (!playing) return;
    const wasHolding = state.holding;
    const big = pointerUp(state, events);
    if (wasHolding) {
      sfx.play(big ? 'bigping' : 'ping', 0.02);
      if (tut === 'tap') tut = 'pearl';
      else if (tut === 'hold' && big) { tut = state.hatchOpen ? 'hatch' : 'pearl'; say('Bigger ping. Twice the air.'); }
    }
  },
});
$('startBtn').addEventListener('click', () => { unlockAudio(); startAmbient(); if (!meta.introSeen) showIntro(); else startGame(); });
$('storyBtn').addEventListener('click', () => { unlockAudio(); startAmbient(); showIntro(); });
$('panelBtn').addEventListener('click', () => { panel.hidden = !panel.hidden; });
introEl.addEventListener('pointerup', (e) => { if ((e.target as HTMLElement).id !== 'introDive') advanceIntro(); });
introDive.addEventListener('click', () => { unlockAudio(); startAmbient(); endIntro(); });
$('againBtn').addEventListener('click', () => { unlockAudio(); startAmbient(); startGame(); });
$('menuBtn').addEventListener('click', () => { overEl.hidden = true; renderShop(); panel.hidden = false; startEl.hidden = false; });
$('shareBtn').addEventListener('click', async () => {
  const text = `SONAR · ${state.level.depth} m · ${state.pearlsDive} pearls · score ${score(state)}${state.bossDefeated ? ' · Angler slain' : ''}\n${'🫧'.repeat(Math.min(10, state.pearlsDive))}\n${location.origin}${location.pathname}`;
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
    if (freeze > 0) { freeze -= dt; return; }
    if (playing) {
      update(state, dt, rng, events);
      if (state.transition > 0) fx.fade = Math.min(1, fx.fade + dt * 1.6);
      fx.shownDepth += (state.level.depth - fx.shownDepth) * Math.min(1, dt * 2.5);
      const nm = nearestMine(state);
      if (nm < 90) { tickAcc += dt; const period = 0.15 + (nm / 90) * 0.5; if (tickAcc > period) { tickAcc = 0; sfx.play('tick', 0.02, 0.5); } }
      if (Math.hypot(state.tx - state.x, state.ty - state.y) > 4) {
        bubbleAcc += dt;
        if (bubbleAcc > 0.12) { bubbleAcc = 0; particles.emit({ x: state.x - 22 * (state.tx < state.x ? -1 : 1), y: state.y, count: 1, speed: 25, life: 1.2, color: 'rgba(200,240,255,0.5)', size: 2, gravity: -40, angle: -Math.PI / 2, spread: 0.6 }); }
      }
    }
    updateAmbient(dt, Math.min(1, state.levelIndex / 6), !!state.boss && playing, state.oxygen < 25 && playing ? 1 : 0, isMuted());
    particles.update(dt); floats.update(dt); shake.update(dt);
  },
  render() {
    beginFrame(view, '#020a12');
    const o = shake.offset();
    view.ctx.translate(o.x, o.y);
    render(view.ctx, state, fx, playing);
    drawTutorial(view.ctx, state, playing ? tut : 'done', fx.t);
    particles.draw(view.ctx);
    floats.draw(view.ctx);
    if (!introEl.hidden) {
      introT += 1 / 60;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = introCanvas.clientWidth, h = introCanvas.clientHeight;
      if (introCanvas.width !== Math.round(w * dpr)) { introCanvas.width = Math.round(w * dpr); introCanvas.height = Math.round(h * dpr); }
      const ic = introCanvas.getContext('2d')!;
      ic.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawIntroFrame(ic, introFrame, introT, w, h);
    }
    if (sayEl.classList.contains('show')) paintJackFace();
    o2El.style.width = `${Math.max(0, state.oxygen)}%`;
    o2El.style.background = state.oxygen < 25 ? '#ff4d4d' : '#7ff5e6';
    depthEl.textContent = `${Math.round(fx.shownDepth)} m`;
    pearlsEl.textContent = `${state.pearls}/${state.level.pearlsNeeded} pearls`;
  },
});
