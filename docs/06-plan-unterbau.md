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

## Status 9. September, abends

| # | Task | Status |
|---|---|---|
| 1 | Scaffold | erledigt, Build 5 KB gzipped |
| 2 | Kit rng, storage, tween mit Tests | erledigt, 14 Tests |
| 3 | Kit canvas, loop, input | erledigt, Handy-Test offen |
| 4 | Kit particles, shake, sfx | erledigt, Sound-Test auf iOS und Android offen |
| 5 | Blitzableiter grau | erledigt, 6 Simulationstests für Ketten-Logik grün. Spielgefühl auf dem Handy offen |
| 6 | Deploy | Vercel live: https://gameskool.vercel.app/blitzableiter/ . GitHub-Remote fehlt noch, `gh auth login` nötig |

**Offen für Greg:** Auf Android und iPhone spielen. Fragen: Reagiert der Tap sofort? Kommt Sound nach dem ersten Tap? Ist der Kettenradius (kurz sichtbarer Ring) lernbar? Und die Go/No-Go-Frage: Will ich weiterspielen, um eine längere Kette zu bauen?

**Beobachtung aus dem Playwright-Lauf (Einschätzung):** Eine 5er-Kette brachte nur 80 Punkte, weil nur 1 bis 2 Ladungen im Zap-Radius lagen. Alle 5 Ableiter wurden dabei verbraucht, danach war das Feld schnell voll. Zu prüfen auf dem Handy: Ist der Zap-Radius (48) zu klein, oder sollten gezündete Ableiter nicht komplett verbraucht werden? Beides sind Zahlen in `rules.ts`.

## Status Jack vs Slop, 9. September

Grauer Prototyp live: https://gameskool.vercel.app/jack-vs-slop/ . 6 Templates, 14 Verletzungstypen in 3 Stufen (`src/jack-vs-slop/rules.ts`), 13 Simulationstests.

**Befund aus dem Playwright-Lauf:** Ohne jede Eingabe erreichte das Spiel 190 Punkte und "Junior Designer", weil sauberes Design durchlassen genauso zählte wie Slop erkennen. Behoben: Rauswerfen gibt 10, Durchlassen 2, Combo zählt für beides. Ein Test sichert ab, dass Nichtstun unter "Junior Designer" bleibt.

**Bekanntes Risiko, nur auf dem Gerät prüfbar:** Die Verletzung "comicFont" nutzt Comic Sans MS. Auf Android gibt es die Font nicht, der Fallback `cursive` könnte unauffällig sein. Wenn Greg das auf dem Android nicht erkennt, muss eine freie Comic-Font als WOFF2 gebündelt werden (Comic Neue, SIL OFL).

**Offen für Greg:** Auf beiden Handys spielen. Go/No-Go-Frage: Erkennst du jede Stufe-2-Verletzung (ab Sekunde 30) in unter einer Sekunde? Und: Fühlt es sich nach "ich werde besser" an?
