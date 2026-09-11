# SONAR: Jack vs the deep

**Play it on your phone, portrait:** https://gameskool.vercel.app/sonar/

*2026. The surface is drowning in AI slop. Jack can't take it anymore, so he takes the sub. Pearls are the last real things down there, and 160 m down, something guards them.*

Every tap moves the sub and sends a sonar ping. For one second you see what is around you. Pings cost oxygen, pearls give it back. One thumb, no manual.

Built for the Skool "September Comp" 2026. My first game ever, built entirely with Claude Code in about two days. This README is about **how**, because the process was the interesting part.

---

## The process, phase by phase

The single most useful decision: **no code before research and 30 ideas.** The first prompt was long and explicit: role, context, hard constraints, the judging criteria as the design brief, a four-phase plan, and rules for how the AI should behave ("be honest when a requirement is unrealistic", "no generic ideas without a concrete twist", "mark anything you can't source as an estimate"). Everything below is in the `docs/` folder, unedited.

### Phase 1: Research ([docs/01-research.md](docs/01-research.md))

Before a single idea, the AI researched what makes small games addictive (near misses, variable rewards, streaks, daily seeds), why Wordle, Suika, Balatro and Ballionaire worked, game feel and juice with concrete numbers, the tech stack (Canvas 2D vs PixiJS vs Phaser vs Three.js), mobile audio rules, and what separates jam winners from the rest. It also summarised the Octalysis framework in its own words so every idea could be scored against the eight core drives.

**Prompting technique:** ask for research *with sources* and force the model to label unsourced claims as estimates. That kept it honest instead of confident.

### Phase 2: Preparation ([docs/02-vorbereitung.md](docs/02-vorbereitung.md))

Assets, tooling, a mobile QA plan, a Definition of Done for "eye candy" and "bug free", and a timeline with a hard feature freeze. The AI pushed back on its own timeline: 25 to 35 hours was exactly full, with zero slack for a second system.

### Phase 3: 30 ideas ([docs/03-ideen.md](docs/03-ideen.md))

Every idea in the same eight-line format: pitch, core loop, why it's new, one-thumb control, Octalysis drives, which prize it could win, effort, biggest risk. Puzzle, arcade, rhythm, idle, roguelite, physics, word, number, daily.

**Prompting technique:** a rigid template per idea. It makes 30 ideas comparable and stops the model from writing five good ones and 25 fillers.

### Phase 4: Scoring and shortlist ([docs/04-shortlist.md](docs/04-shortlist.md))

All 30 scored 1 to 5 on addictiveness, originality, eye candy, feasibility and bug risk. Top 5 with an honest paragraph each: why it can win, what can go wrong, what the first prototype step is. The AI's recommendation was "Blitzableiter" (a lightning rod chain game). Sonar was fourth: "the idea I'd most likely fall in love with, which is exactly why it's fourth: the fairness problem is a design risk you only find by playing."

### The pivot ([docs/05-entscheidung.md](docs/05-entscheidung.md) to [docs/08-erste-versionen.md](docs/08-erste-versionen.md))

I approved two ideas, then a third one about Jack himself fighting AI slop. The AI built grey prototypes with automated tests for the game logic. They were ugly. I said so ("sieht richtig Kacke aus") and pointed it at a game I had built before. It wrote a comparison of what that game did right (characters, a world, warmth, humour, its own typography) and rebuilt both prototypes with a visual identity.

Still not the hit. So I asked for first versions of the other four shortlist ideas, each with its own look from the start. Six playable games in one day. The question I answered: **which one did you voluntarily play a fourth time?** Sonar.

**Prompting technique:** don't ask the AI which idea is best. Build the top candidates small enough to feel, then decide with your thumb.

### Building Sonar ([docs/09-sonar-ausbau.md](docs/09-sonar-ausbau.md))

Two rounds of "make it 10x better" with concrete direction each time: levels as depth zones, a boss you can't fight but can lure into mines, a big ping on hold, pearl chains, upgrades, achievements, an ambient soundtrack made from Web Audio oscillators, a world per level. Then the feedback that mattered most: "too much text, you don't understand what to do." The answer was a 10 second story in three drawn frames, a tutorial with four words in it (TAP, PEARL, HOLD, GO DEEPER), and Jack talking from the porthole.

**Prompting technique:** short, honest feedback beats long specs. "Level 1 takes too long, drop pearls to 3" is a better prompt than a paragraph. And every round, the AI ran the game headless, took screenshots, found its own balance bugs (the boss killed you in 3 seconds; doing nothing scored 190 points) and fixed them before I saw them.

### Submission ([docs/10-skool-post.md](docs/10-skool-post.md))

The post text, written in the same session.

---

## What's in the repo

```
docs/            The full paper trail, phases 1 to 10, in German
src/kit/         Shared engine: fixed timestep loop, canvas, input, particles, shake, tweens, ZzFX sound, seeded RNG, storage
src/sonar/       The game: levels, logic, boss, meta progression, render, ambient audio, intro, tutorial
src/blitzableiter, src/jack-vs-slop, src/echo, src/zeitfinger, src/dungeon-deal
                 The other five prototypes, still playable at gameskool.vercel.app
```

Vite, TypeScript, Canvas 2D, no framework. 55 automated tests cover the game logic: pings, visibility decay, hatch and descent, boss hunt and mine kills, upgrades, achievements. No audio files: every sound is ZzFX, the soundtrack is oscillators.

```bash
npm install
npm run dev      # then open /sonar/ on your phone via your local IP
npm test
npm run build
```

Debug: `/sonar/?level=4` starts in the boss level.

