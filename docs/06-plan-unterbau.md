# Plan: Unterbau und Blitzableiter-Prototyp

Stand: 9. September 2026. Ziel dieser Session: Repo, Deploy, gemeinsamer Unterbau, grauer Blitzableiter-Prototyp auf dem Handy spielbar.

## Architektur-Entscheidung: ein Vite-Projekt, zwei Seiten

Statt Monorepo mit Workspaces: **ein Vite-Projekt mit zwei HTML-Einstiegen.**

```
/                       Repo-Root, ein package.json
  index.html            Landing: Links zu beiden Spielen
  blitzableiter/index.html
  jack-vs-slop/index.html
  src/
    kit/                gemeinsamer Unterbau
      loop.ts           fester Timestep 60 Hz, rAF-Render, Pause bei visibilitychange
      canvas.ts         Canvas-Setup, DPR, Resize, Hochformat-Koordinaten
      input.ts          Pointer-Events zu Canvas-Koordinaten, Tap und Hold
      tween.ts          Easing-Funktionen
      particles.ts      Pool
      shake.ts          Screen Shake mit Ausklingen
      sfx.ts            ZzFX-Wrapper, Audio-Unlock, Pitch-Randomisierung
      storage.ts        localStorage mit try/catch
      rng.ts            Mulberry32, seedbar
    blitzableiter/
      main.ts, state.ts, update.ts, render.ts, rules.ts
    jack-vs-slop/
      main.ts           (Platzhalter bis Prototyp)
  vite.config.ts        rollupOptions.input mit drei Einstiegen
```

Begründung: Ein Build, ein Deploy, ein Vercel-Projekt, keine Workspace-Tooling-Fehlerquelle. URLs: `<domain>/blitzableiter/` und `<domain>/jack-vs-slop/`. Eigene Domains pro Spiel sind später per Vercel-Rewrite möglich, falls gewünscht.

## Tasks

| # | Task | Verifikation |
|---|---|---|
| 1 | Scaffold: git init, Vite vanilla-ts, Multi-Page-Config, Vitest, .gitignore, README | `npm run build` erzeugt `dist/blitzableiter/index.html` und `dist/jack-vs-slop/index.html` |
| 2 | Kit: rng, storage, tween mit Unit-Tests | `npm test` grün |
| 3 | Kit: canvas, loop, input | Testseite zeigt Canvas in Hochformat, Tap-Koordinaten stimmen auf Handy |
| 4 | Kit: particles, shake, sfx | Testseite: Tap erzeugt Partikel plus Sound auf iOS und Android |
| 5 | Blitzableiter grau: Ladungen wandern, Tap setzt Ableiter, Kette per BFS, Score, Game Over, Neustart | 20 Runs ohne Fehler in der Konsole. Frage: will ich weiterspielen? |
| 6 | Deploy: GitHub-Repo, Vercel-Projekt | Live-URL auf beiden Handys spielbar |

Reihenfolge der Ausführung: 1, 2, 6 (früh deployen), 3, 4, 5, dann erneut 6.

## Regeln für den Blitzableiter-Prototyp (erste Werte, alle in rules.ts)

- Spielfeld: logische Größe 390 x 780, skaliert auf Viewport
- Ladungen: Radius 8, Geschwindigkeit 40 bis 70 px/s, Richtungswechsel per Rauschen, prallen am Rand ab. Spawn alle 1,5 s, ab Sekunde 30 alle 1,0 s, ab Sekunde 60 alle 0,7 s
- Ableiter: max 5, Lebensdauer 6 s, Trefferradius 14, Kettenradius 110
- Kette: Ladung trifft Ableiter, alle Ableiter im Kettenradius zünden (BFS), jede Ladung im Trefferradius eines gezündeten Ableiters entlädt sich. Punkte pro Kette: n² mal 10
- Verlieren: mehr als 12 Ladungen gleichzeitig auf dem Feld
- Radius beim Setzen 0,5 s sichtbar, dann ausgeblendet
