# Phase 2: Was vor der ersten Codezeile stehen muss

Stand: 9. September 2026. Bis zur Deadline bleiben 21 Tage.

Alles hier gilt unabhängig von der konkreten Spielidee. Sobald die Idee steht, wird der Abschnitt "Assets" konkretisiert.

---

## 1. Assets und Tools

### Grafikstil: eine Entscheidung, die alles andere bestimmt

Drei realistische Optionen für 30 Stunden:

| Stil | Wie er entsteht | Eye-Candy-Potenzial | Aufwand | Risiko |
|---|---|---|---|---|
| **A: Vektor-Flat, prozedural gezeichnet** | Alles per Canvas-API: Kreise, Rounded Rects, Gradients, Glow via `shadowBlur`. Keine Bilddateien | Hoch, wenn Farbpalette und Bewegung stimmen. Sieht nach "Design" aus, nicht nach "Pixel Art aus dem Tutorial" | Niedrig, alles im Code | Kann steril wirken, wenn Juice fehlt |
| **B: Pixel Art aus Sprite-Sheets** | Selbst pixeln oder Asset-Packs (Kenney.nl, itch.io) | Mittel, viele Jam-Spiele sehen so aus | Mittel, Sprite-Loading, Animation-Frames | Wirkt generisch, außer man ist sehr gut |
| **C: KI-generierte Illustrationen** | Bilder per Bildmodell erzeugen, freistellen, als Sprites einbinden | Hoch für Hintergründe und Titelbild, schwach für animierte Objekte (Inkonsistenz zwischen Frames) | Mittel bis hoch, Nachbearbeitung frisst Zeit | Inkonsistenter Look, Jury erkennt KI-Optik |

**Empfehlung: A als Basis, C nur für Titelbild und Hintergrund.** Begründung: Prozedurale Grafik skaliert auf jede Bildschirmgröße ohne Unschärfe, hat keine Ladezeit, lässt sich per Code animieren (Farbe, Größe, Glow reagieren auf den Spielzustand) und passt zur KI-gestützten Entwicklung, weil alles Text ist. Ein einziges KI-generiertes Hintergrundbild plus ein Titel-Logo geben dem Ganzen Charakter.

**Was wir vor dem Code festlegen (30 Minuten, aber entscheidend):**
- Eine Farbpalette mit 5 bis 7 Farben, dunkler Hintergrund (Glow wirkt nur auf dunkel). Tools: [coolors.co](https://coolors.co), [Lospec Palettes](https://lospec.com/palette-list).
- Eine Font. Google Fonts, variable Weight, gut lesbar bei 14 px auf Mobile. Kandidaten (Einschätzung): "Fredoka" für verspielt, "Space Grotesk" für modern, "Press Start 2P" nur bei Retro. Als WOFF2 lokal bundeln, nicht von Google laden (Offline und Ladezeit).
- Ein visuelles Motiv, das im Screenshot sofort erkennbar ist. Das hängt an der Idee.

### Sound

| Was | Tool | Entscheidung |
|---|---|---|
| Sound-Effekte (8 bis 15 Stück) | ZzFX Designer, Parameter als Array in eine `sounds.ts` | Selbst bauen, ca. 1 Stunde für alle |
| Musik-Loop | Option 1: ZzFXM (Chiptune, im Code). Option 2: Ein 30-Sekunden-Loop per KI-Musikgenerator, als OGG plus MP3-Fallback, unter 300 KB | Option 2 klingt moderner. Muss lizenzfrei sein, Generator-Bedingungen prüfen |
| Musik-Intensität | Loop mit steigender Lautstärke oder Filter bei hohem Combo | Nur wenn Zeit bleibt |

### Icons und UI
- Keine Icon-Library. Wir brauchen maximal 5 Icons (Sound an/aus, Neustart, Share, Pause, Info). Als Inline-SVG oder direkt auf Canvas gezeichnet.
- UI-Overlays (Startscreen, Game Over, Highscore) als HTML über der Canvas, nicht auf der Canvas. Grund: Text-Rendering, Buttons und Accessibility sind in HTML trivial, auf Canvas mühsam.

### Was wir nicht kaufen
Nichts. Alle Tools oben sind kostenlos. Ein Asset-Kauf würde nur Sinn ergeben, wenn wir Pixel Art wählen, und das empfehle ich nicht.

---

## 2. Projektstruktur, Tooling, Deployment

### Setup

```
game/
  index.html            Startscreen-Markup, Canvas, Overlays
  public/
    favicon.svg
    og-image.png        1200x630 für Link-Vorschau in Skool
    fonts/
    audio/
  src/
    main.ts             Boot, Loop, Resize, Input-Setup
    game/
      state.ts          Der gesamte Spielzustand als ein Objekt
      update.ts         Logik pro Frame, keine Rendering-Aufrufe
      render.ts         Zeichnen aus dem State, keine Logik
      rules.ts          Zahlen: Geschwindigkeiten, Spawnraten, Punkte
    fx/
      particles.ts      Pool
      shake.ts
      tween.ts          Easing-Funktionen
      sfx.ts            ZzFX-Wrapper mit Pitch-Randomisierung
    ui/
      overlays.ts       Start, Pause, Game Over, Share
      storage.ts        localStorage: Highscore, Streak, Settings
    util/
      rng.ts            Seeded RNG (Mulberry32) für Daily
      input.ts          Pointer-Events, normalisiert auf Canvas-Koordinaten
  vite.config.ts
  package.json
```

**Prinzipien:**
- Trennung Update und Render. Logik läuft mit festem Timestep (z. B. 60 Hz, Akkumulator), Rendering mit `requestAnimationFrame`. Das verhindert die häufigste Bug-Klasse: Spiel läuft auf 120-Hz-Displays doppelt so schnell.
- Ein State-Objekt. Kein Klassenzoo. Alles, was das Spiel weiß, steht an einer Stelle und lässt sich per `console.log` ausgeben.
- Alle Tuning-Zahlen in `rules.ts`. Balancing ohne Suchen.
- Keine Dependency außer Vite und TypeScript. Matter.js nur bei Physik-Idee.

### Tooling
- **Vite** mit TypeScript-Template (`npm create vite@latest`). Strict Mode an.
- **ESLint** minimal, nur um unbenutzte Variablen und `any` zu fangen.
- **Git** von Anfang an, weil Jack ein Repo als Alternative zum Live-Link akzeptiert und weil "Rückgängig" ohne Git nach 25 Stunden schmerzt.
- **Kein Test-Framework für die Spiellogik.** Einschätzung: Bei 30 Stunden ist Playtesting auf dem Gerät produktiver als Unit-Tests. Ausnahme: `rng.ts` und `storage.ts` bekommen je einen kleinen Test, weil Fehler dort still sind.

### Deployment auf Vercel
- Vercel erkennt Vite automatisch: Build `vite build`, Output `dist`. Keine `vercel.json` nötig.
- Ab Tag 1 deployen. Jeder Push auf `main` ist ein Deploy. Preview-Deploys für Branches gibt es kostenlos.
- Domain: `<name>.vercel.app` reicht. Ein kurzer Projektname, der sich merken lässt, weil er im Skool-Post steht.
- `index.html` bekommt: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">`, Theme-Color, OG-Tags, Apple-Touch-Icon. Das macht den Link in Skool zur Vorschaukarte.
- Optional, wenn Zeit: Web-App-Manifest, damit "Zum Home-Bildschirm" ein Icon ohne Browser-Chrome ergibt. Kostet 20 Minuten, wirkt wie eine App.

---

## 3. Test- und QA-Plan für Mobile

### Geräte und Browser

| Priorität | Gerät | Browser | Warum |
|---|---|---|---|
| 1 | Mittelklasse-Android (dein eigenes oder ein geliehenes, z. B. Samsung A-Serie, Pixel a-Serie) | Chrome | Die Anforderung. Hier muss 60 fps laufen |
| 1 | iPhone (beliebig ab iPhone 11) | Safari | Die Jury hat wahrscheinlich iPhones. Audio-Unlock, Haptik, 100vh-Bug, Notch |
| 2 | Desktop | Chrome, Firefox | Jack könnte am PC judgen. Maus statt Touch muss funktionieren |
| 3 | iPad oder Android-Tablet | Safari, Chrome | Layout bei breitem Hochformat |
| 3 | Chrome DevTools Device Mode mit CPU-Throttling 4x | | Für schnelle Performance-Checks zwischen den Gerätetests |

**Frage an dich:** Welche Geräte hast du physisch? Das entscheidet, ob wir ein Android leihen müssen.

### Systematisches Finden von Bugs

**Nach jeder Session mit neuer Funktion (10 Minuten):**
1. Auf dem Android-Gerät über den Vercel-Preview-Link spielen, nicht im Emulator.
2. Drei Runs, mindestens einer bis Game Over.
3. Handy drehen, Browser-Tab wechseln und zurückkommen, Bildschirm sperren und entsperren. Das Spiel muss pausieren und sauber weiterlaufen.

**Vor jedem Meilenstein (30 Minuten), die Checkliste:**

| Kategorie | Prüfung |
|---|---|
| Input | Tap reagiert unter 100 ms. Kein Doppel-Tap-Zoom. Kein Pull-to-Refresh. Kein Text-Select beim Halten. Multi-Touch (zwei Finger) bricht nichts |
| Layout | Hochformat auf 360x640 (klein), 390x844 (iPhone), 412x915 (Android groß). Nichts hinter der Notch oder der Home-Bar. Querformat zeigt Hinweis "Bitte drehen" oder funktioniert |
| Performance | 60 fps bei maximalem Partikel-Aufkommen. DevTools Performance-Tab: keine Frames über 16 ms im Normalfall. Keine wachsende Memory-Kurve über 5 Minuten (Leak-Check) |
| Audio | Erster Tap startet Sound auf iOS. Sound-Toggle wird gespeichert. Kein Sound-Stapel nach Tab-Wechsel |
| Lifecycle | Tab in Hintergrund: Spiel pausiert (`visibilitychange`). Zurück: kein Sprung, kein aufgelaufener Delta-Time |
| Storage | Highscore überlebt Reload. Private-Mode ohne localStorage bricht nichts (try/catch) |
| Game Over | Neustart in unter einer Sekunde. Kein Zustand aus dem alten Run bleibt hängen (das ist der häufigste Bug in Jam-Games) |
| Edge Cases | Was passiert bei 0 Punkten, bei sehr hohem Score (Überlauf der Anzeige), bei 10 Minuten Spielzeit (Geschwindigkeit sinnvoll gedeckelt)? |

**Bug-Log:** Eine `docs/bugs.md` mit Datum, Gerät, Schritte, Status. Kein Ticket-System.

**Fremd-Test:** In der Woche vor der Deadline zwei bis drei Leute ohne Erklärung spielen lassen und nur zuschauen. Wo sie zögern, fehlt Feedback. Was sie fragen, fehlt im Spiel. Das ist der wichtigste Test für "sofort verständlich ohne Tutorial".

---

## 4. Definition of Done

### "Eye Candy" ist erfüllt, wenn alle Punkte zutreffen

1. Der Startscreen ist innerhalb von 2 Sekunden auf 4G da und sieht aus wie ein fertiges Produkt (Titel, Palette, ein animiertes Element).
2. Jede Spieleraktion hat mindestens zwei Feedback-Kanäle (z. B. Sound plus Partikel, Sound plus Squash).
3. Kein Element bewegt sich linear. Alle Übergänge (Spawn, Tod, Popup, Score) sind getweent.
4. Das größte Event des Spiels (Max-Combo, Rekord, Kettenreaktion) hat eine eigene, deutlich größere Inszenierung: Shake, Flash, Hit-Stop, eigener Sound.
5. Score-Änderungen sind sichtbar animiert (Zahl zählt hoch, Floating Text).
6. Es gibt einen Musik-Loop und mindestens 8 unterschiedliche Sound-Effekte.
7. Game-Over-Screen zeigt Score, Rekord, Near-Miss-Info ("nur 12 Punkte unter deinem Rekord") und einen Share-Button.
8. Die OG-Vorschau in Skool zeigt ein Titelbild, nicht einen leeren Link.
9. Ein Außenstehender beschreibt das Spiel nach 10 Sekunden mit einem positiven Adjektiv über die Optik (Test mit Fremd-Testern).

### "Bugfrei" ist erfüllt, wenn alle Punkte zutreffen

1. Die QA-Checkliste aus Abschnitt 3 ist auf Android Chrome und iOS Safari vollständig grün.
2. 20 Runs am Stück auf dem Android ohne Absturz, Freeze, Fehlstart oder sichtbaren Glitch.
3. `docs/bugs.md` hat keinen offenen Eintrag mit Priorität "hoch" oder "mittel".
4. Die Browser-Konsole ist im Produktions-Build leer (keine Errors, keine Warnings).
5. TypeScript kompiliert strict ohne Fehler, ESLint meldet nichts.
6. Ein Fremd-Tester hat 5 Minuten gespielt, ohne dass wir eingreifen mussten.
7. Der Live-Link wurde nach dem letzten Deploy noch einmal auf beiden Geräten getestet (nicht der lokale Build).

---

## 5. Zeitplan bis 30. September

**Budget:** 25 bis 35 Stunden in 21 Tagen. Das sind 1,5 Stunden pro Tag im Schnitt, oder drei Blöcke zu je 3 bis 4 Stunden pro Woche.

**Ehrlicher Hinweis:** Die Research-Phase (heute) kostet bereits Zeit. Wenn die Idee erst am 12. September steht, bleiben 18 Tage. Der Plan unten geht davon aus, dass wir am **11. September** mit dem Prototyp beginnen.

| Phase | Zeitraum | Stunden | Ziel | Verifikation |
|---|---|---|---|---|
| **0. Idee und Vorbereitung** | 9. bis 10. Sept | 2 bis 3 | Idee freigegeben, Palette und Font gewählt, Repo und Vercel stehen | Live-Link zeigt "Hello World"-Canvas auf Handy |
| **1. Prototyp (grau, stumm)** | 11. bis 14. Sept | 6 bis 8 | Kernmechanik spielbar, Score, Game Over, Neustart. Keine Grafik, keine Sounds, Rechtecke reichen | **Go/No-Go am 14. Sept:** Macht der Core Loop in Grau Spaß? Wenn nein, Idee wechseln, noch ist Zeit |
| **2. Feel und Balancing** | 15. bis 18. Sept | 5 bis 7 | Steuerung sitzt, Schwierigkeitskurve stimmt, Runs dauern 30 s bis 3 min, Near Miss sichtbar | Drei Fremd-Tester spielen ohne Erklärung mindestens 3 Runs freiwillig |
| **3. Eye Candy** | 19. bis 23. Sept | 7 bis 9 | Palette, Font, Partikel, Shake, Easing, alle Sounds, Musik, Startscreen, Game-Over-Screen | DoD "Eye Candy" komplett |
| **4. QA und Bugfixing** | 24. bis 26. Sept | 3 bis 4 | Volle Checkliste auf beiden Geräten, Bug-Log abgearbeitet | DoD "Bugfrei" komplett |
| **5. Submission** | 27. bis 28. Sept | 2 | Loom aufnehmen (die besten 60 Sekunden, nicht die ersten), README, OG-Image, Skool-Post schreiben | Post ist veröffentlicht |
| **Puffer** | 29. bis 30. Sept | 0 bis 3 | Nichts Neues. Nur Hotfixes, wenn nach Veröffentlichung jemand einen Bug meldet | |

**Summe: 25 bis 36 Stunden.** Das passt, aber ohne Luft für Scope-Erweiterung. Jede Idee, die "noch ein System" braucht, sprengt das.

**Feature Freeze: 23. September.** Danach kommt nichts Neues rein, egal wie gut die Idee ist. Das ist die Regel, die die meisten Jam-Projekte brechen und dann verlieren.

**Was den Plan kippt:**
- Prototyp macht am 14. keinen Spaß und wir wechseln die Idee: kostet 4 bis 6 Stunden, ist aber der beste Zeitpunkt dafür. Deshalb der harte Go/No-Go.
- Physik-Engine-Probleme (wenn Matter.js im Spiel ist): Kann Tage fressen. Deshalb Physik nur, wenn die Idee ohne sie nicht funktioniert.
- iOS-Audio-Bugs: Reserviert 2 Stunden in Phase 3, weil das erfahrungsgemäß immer Zeit kostet (Einschätzung).

---

## 6. Geklärte Rahmenbedingungen (Stand 9. September)

1. **Testgeräte:** Android und iPhone sind physisch vorhanden. Kein Leihgerät nötig.
2. **Accounts:** GitHub und Vercel vorhanden, Zugänge liegen vor. Repo und Vercel-Projekt werden angelegt, sobald die Idee freigegeben ist und einen Namen hat.
3. **Zeitverteilung:** Flexibel. Der Plan bleibt bei den Meilensteinen aus Abschnitt 5.
4. **First Timer:** Greg hat noch nie ein Spiel veröffentlicht. Das ist die fünfte Zielkategorie und wird mit demselben Spiel automatisch abgedeckt. Konsequenz für den Skool-Post: die Story "erstes Spiel, mit KI gebaut" gehört explizit in den Text und den Loom.
