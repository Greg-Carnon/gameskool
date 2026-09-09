# Phase 1: Research

Stand: 9. September 2026. Deadline der Competition: 30. September 2026.

Kennzeichnung: Aussagen mit Quelle sind verlinkt. Alles, was mit **Einschätzung** markiert ist, stammt aus meiner Erfahrung und ist nicht belegt.

---

## 0. Octalysis in eigenen Worten

Quelle: [Yu-kai Chou, Octalysis Framework](https://yukaichou.com/gamification-examples/octalysis-gamification-framework/)

Octalysis beschreibt acht Motivationsquellen ("Core Drives"). Alles, was Menschen freiwillig tun, lässt sich auf mindestens einen dieser Drives zurückführen. Ein Spiel ohne einen dieser Drives im Kern wird nicht gespielt.

| Nr. | Core Drive | In einem Satz | Was das für ein 2-Minuten-Spiel heißt |
|---|---|---|---|
| 1 | Epic Meaning & Calling | Ich bin Teil von etwas Größerem | Kaum relevant für uns. Höchstens: alle spielen heute dieselbe Daily-Challenge |
| 2 | Development & Accomplishment | Ich werde besser und sehe es | Highscore, Rang, spürbare Skill-Kurve. Wirkt nur, wenn es echten Widerstand gibt |
| 3 | Empowerment of Creativity & Feedback | Ich probiere Dinge aus und sehe sofort, was passiert | Kombinationen, Builds, Strategien mit sofortigem Feedback. Der stärkste Langzeit-Drive |
| 4 | Ownership & Possession | Das gehört mir und ich will es pflegen | Persönlicher Rekord, Streak, freigeschaltete Skins, ein Garten oder Sammlung |
| 5 | Social Influence & Relatedness | Ich will mich vergleichen oder dazugehören | Shareable Ergebnis (Wordle-Grid), Freunde schlagen |
| 6 | Scarcity & Impatience | Ich kann es jetzt nicht haben, also will ich es | Ein Versuch pro Tag, limitierte Ressource pro Run |
| 7 | Unpredictability & Curiosity | Was passiert als Nächstes? | Variable Rewards, Zufall mit fairem Rahmen, Physik-Chaos |
| 8 | Loss & Avoidance | Ich will nicht verlieren, was ich habe | Streak brechen, Combo verlieren, Container läuft voll |

**White Hat vs. Black Hat.** Die oberen Drives (1, 2, 3) fühlen sich gut an und halten langfristig, erzeugen aber keine Dringlichkeit. Die unteren Drives (6, 7, 8) erzeugen sofortigen Zug ("nur noch ein Versuch"), hinterlassen aber bei Übertreibung ein schlechtes Gefühl. Chou sagt selbst: Black Hat ist nicht böse, gute Systeme kombinieren beides bewusst.

**Left Brain vs. Right Brain.** Links (2, 4, 6) sind extrinsische Ziele, rechts (3, 5, 7) sind aus sich heraus belohnend. Chou warnt: Wer nur auf extrinsische Belohnungen setzt, verliert die Spieler, sobald die Belohnung wegfällt.

**Was daraus für "One More Go" folgt (Einschätzung):** Der Effekt entsteht, wenn ein Black-Hat-Drive den Spieler direkt nach dem Verlieren zurückzieht (8: "die Combo war so hoch", 7: "beim nächsten Mal kommt vielleicht das seltene Item") und ein White-Hat-Drive ihm das Gefühl gibt, dass er beim nächsten Mal besser sein kann (2: "ich hab jetzt verstanden, wie das geht", 3: "ich probiere eine andere Strategie"). Fehlt der White-Hat-Teil, fühlt sich Wiederholen nach Zwang an. Fehlt der Black-Hat-Teil, fehlt der Zug.

---

## 1. Was kleine Games süchtig macht: konkrete Mechaniken

### Near Miss
Der Spieler verliert knapp und sieht, wie knapp. Suika Game lebt davon: das fast fertige Wassermelonen-Merge, der Container, der um einen Millimeter überläuft ([Kokutech Analyse](https://www.kokutech.com/blog/gamedev/design-patterns/unique-mechanics/suika-game)). Hyper-Casual-Games verstärken das bewusst, indem sie Near Misses zeigen und teilweise sogar belohnen ([Adjust](https://www.adjust.com/blog/how-to-make-a-hyper-casual-game-successful/)).
**Übertragbar:** Am Game Over immer zeigen, was gefehlt hat: "3 Punkte unter deinem Rekord", "die nächste Fusion wäre die große gewesen". Einschätzung: Das ist die billigste Retention-Mechanik überhaupt, ein Text und eine Animation.

### Variable Rewards
Belohnungen unregelmäßig, aber häufig. Das Prinzip aus der Verhaltenspsychologie (Variable Ratio Schedule), das Slot Machines nutzen ([DEV Community](https://dev.to/krishanvijay/what-makes-hyper-casual-games-so-addictive-24me)). Balatro ist die Reinform: 150 Joker, jeder Run zieht andere, und man weiß nie, ob der nächste Shop den Build komplett macht ([Screen Rant](https://screenrant.com/balatro-simple-games-best-op-ed/)).
**Übertragbar:** Nicht der Zufall selbst macht süchtig, sondern Zufall, mit dem man arbeiten muss. Ein zufälliges Upgrade, das man dann geschickt einsetzen muss, ist besser als ein zufälliger Bonus, der nur Punkte gibt.

### Streaks und Loss Aversion
Wordle-Streaks funktionieren, weil der Verlust der Streak schlimmer wiegt als der Gewinn eines weiteren Tages ([Puzzlit](https://www.puzzlitapp.com/blog/5-fun-puzzles-like-wordle)). Innerhalb eines Runs wirkt dasselbe Prinzip über Combo-Zähler: je höher, desto mehr Angst, ihn zu verlieren.
**Übertragbar:** Zwei Ebenen: In-Run-Combo (Drive 8, sofort) und Daily-Streak (Drive 4 und 8, langfristig). Beides ist mit localStorage machbar.

### Daily Seed (Wordle-Prinzip)
Genau eine Aufgabe pro Tag, für alle dieselbe, danach ist Schluss. Das macht aus Flow ein Ritual und aus dem Ergebnis ein soziales Objekt: das Emoji-Grid lässt einen angeben, ohne zu spoilern ([Dinogame Review](https://dinogame.gg/blog/wordle-review/)).
**Übertragbar:** Ein Seed aus dem Datum, deterministischer Zufall (z. B. Mulberry32), fertig. Zusätzlich ein "Endless"-Modus, damit die Jury nicht nach einem Versuch ausgesperrt ist. **Wichtig für die Competition (Einschätzung):** Die Jury spielt an einem Tag. Ein reines Daily-Game hat dann genau einen Versuch und verliert "One More Go". Daily muss Zusatz sein, nicht Kern.

### Combo-Systeme und Kettenreaktionen
Suika: eine Fusion löst die nächste aus. Ballionaire: Pegs triggern Pegs, Payouts werden exponentiell ([Ballionaire Steam](https://store.steampowered.com/app/2667120/Ballionaire/)). Der Spieler plant eine Kette, die Physik entscheidet den Rest.
**Übertragbar:** Kettenreaktionen sind der beste Ort für Juice: jede Stufe lauter, größer, heller. Das ist Eye Candy und Suchtpotenzial in einer Mechanik.

### Easy to learn, hard to master
Alle erfolgreichen Hyper-Casual-Titel sind in 5 Sekunden verstanden und in 5 Stunden nicht gemeistert ([Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/addictive-mobile-games)). Suika hat genau eine Aktion (loslassen) und trotzdem endlose Tiefe durch Physik.
**Übertragbar:** Eine Eingabe. Wenn wir zwei brauchen, ist die Idee wahrscheinlich zu komplex.

### Sofortiges Feedback unter 100 ms
Über 100 ms Verzögerung fühlt sich Steuerung träge an ([BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)). Auf Mobile heißt das: `touchstart` statt `click` (300 ms Delay auf alten Browsern), `pointerdown` als moderne Alternative.

---

## 2. Virale Web- und Indie-Games der letzten Jahre

| Spiel | Warum viral | Was wir übernehmen können |
|---|---|---|
| **Wordle** (2021/22) | Ein Rätsel pro Tag, Emoji-Share, kein Login, läuft im Browser. 4,8 Mrd. Plays 2023 ([Wikipedia](https://en.wikipedia.org/wiki/Wordle)) | Daily-Seed als Zusatzmodus, Share-Text mit Emojis |
| **Suika Game** (2023/24) | Physik-Merge, Streamer-Effekt, niedliche Optik, Near-Miss am laufenden Band ([Wikipedia](https://en.wikipedia.org/wiki/Suika_Game)) | Eine Eingabe, Physik als Zufallsquelle, Kettenreaktionen |
| **Balatro** (2024) | Poker als Roguelite-Deckbuilder, 150 Joker, jede Runde neue Synergien ([Screen Rant](https://screenrant.com/balatro-simple-games-best-op-ed/)) | "Bekannte Regeln plus Modifikatoren, die sie brechen". Das ist ein Muster, kein Genre |
| **Ballionaire** (Dez 2024) | Pachinko-Roguelite, Trigger-Synergien, exponentielle Payouts durch Physik ([Wikipedia](https://en.wikipedia.org/wiki/Ballionaire)) | Physik plus Build-Entscheidung. Warnung: 125 Trigger sind für uns nicht machbar, 8 bis 12 wären es |
| **io-Games** (agar.io, slither.io) | Sofort im Match, Multiplayer ohne Login | Nicht übertragbar ohne Server. Aber: Ghost-Replays des eigenen letzten Runs simulieren das Gefühl |
| **Wort-Roguelites 2025** | PC Gamer hat ein Jahr lang Balatro-Klone mit Wörtern getestet: die meisten scheitern, weil sie nur kopieren ([PC Gamer](https://www.pcgamer.com/games/roguelike/i-spent-2025-digging-through-all-the-word-game-roguelikes-flooding-steam-to-see-if-any-could-capture-balatros-magic-here-are-the-highly-scientific-results/)) | Warnung: "Balatro mit X" ist 2026 schon ein Klischee. Die Jury kennt das Muster |

**Gemeinsamer Nenner (Einschätzung):** Alle vier großen Hits haben genau eine Kernaktion, produzieren im Spiel selbst Momente, die man weitererzählen will (der riesige Combo, die fast geschaffte Melone), und brauchen keinen Account. Keins davon hat ein Tutorial.

---

## 3. Game Feel und Juice: Best Practices

Quellen: [Resprawn](https://resprawn.medium.com/when-you-play-a-great-game-it-feels-good-d23761b6eccf), [BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/), [Egmatic](https://egmatic.com/blog/how-to-make-your-game-feel-good), [GameJuice Haptics](https://gamejuice.co.uk/articles/haptic-feedback-rumble-dualsense)

| Technik | Konkrete Werte | Aufwand |
|---|---|---|
| **Screen Shake** | 0,1 bis 0,3 s, zufällige Richtung, Amplitude mit Easing ausklingen lassen. Skaliert mit der Wichtigkeit des Events | 20 Zeilen Code |
| **Hit Stop / Freeze Frame** | 30 bis 80 ms Pause bei großen Treffern. Macht Wucht spürbar | 10 Zeilen |
| **Partikel** | Object Pool mit 200 bis 500 Partikeln, Lebensdauer 0,3 bis 1 s, Gravitation und Fade | 60 Zeilen, ein Mal schreiben |
| **Easing** | Nichts bewegt sich linear. `easeOutBack` für Popups, `easeOutExpo` für Punkte, `easeInOutQuad` für Kamera | Eine Datei mit 6 Funktionen |
| **Squash and Stretch** | Objekte beim Aufprall kurz platt (scaleY 0,8, scaleX 1,2), dann zurückfedern | 15 Zeilen |
| **Floating Text** | Punkte steigen aus dem Event heraus auf, größer bei Combos | 30 Zeilen |
| **Flash** | 50 bis 100 ms weißes Overlay bei großen Events. Sparsam einsetzen | 5 Zeilen |
| **Sound** | Pitch und Lautstärke pro Abspielen um 5 bis 10 Prozent randomisieren, sonst nervt Wiederholung. Combo-Sounds in der Tonhöhe steigen lassen | Kleine Wrapper-Funktion |
| **Haptik** | 20 bis 70 ms Pulse, nur bei bedeutsamen Events, nie bei jedem Tap | Siehe Abschnitt 5 |

**Timing-Regel:** Feedback innerhalb von 100 ms nach der Eingabe. Haptik 80 bis 120 ms, Flash 50 bis 100 ms, Partikel 0,5 bis 1 s ([BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)).

**Accessibility:** `prefers-reduced-motion` respektieren, Shake und Flash abschaltbar machen. Kostet 10 Minuten, wirkt professionell.

**Einschätzung zur Priorisierung:** Die Reihenfolge nach Wirkung pro Stunde: 1. Sound, 2. Easing auf alles, 3. Partikel, 4. Screen Shake, 5. Squash and Stretch. Sound zuerst, weil ein stummes Spiel auf keiner Jury-Liste unter "Eye Candy" landet.

---

## 4. Technischer Stack für Vercel

Quellen: [Generalist Programmer Phaser vs PixiJS](https://generalistprogrammer.com/comparisons/phaser-vs-pixijs), [HTML5 Framework Vergleich](https://generalistprogrammer.com/tutorials/best-html5-game-frameworks-2025), [FG Factory](https://fgfactory.com/webgl-libraries-for-2d-games)

| Kriterium | Canvas 2D (Vanilla) | PixiJS v8 | Phaser 3 | Three.js |
|---|---|---|---|---|
| Bundle | 0 KB | ca. 150 KB gzipped (Core) | ca. 670 KB minified, ca. 1,2 MB ungezippt | ca. 600 KB+ |
| Lernaufwand | Keiner, reines JS | Niedrig (Renderer, kein Framework) | Mittel (Szenen, Physics, Input, Tweens, alles eingebaut) | Hoch für 2D-Spiele, unnötig |
| Mobile-Performance | Sehr gut bis ca. 500 bewegte Objekte, danach WebGL nötig | Exzellent, 1000+ Sprites bei 60 fps | Gut, WebGL-Renderer eingebaut | Gut, aber Overkill |
| Physik | Selbst schreiben oder Matter.js (ca. 80 KB) | Matter.js dazu | Arcade (einfach, schnell) und Matter (eingebaut) | Cannon/Rapier, 3D |
| KI-gestütztes Bauen | **Am besten**: kein API-Wissen nötig, alles im Code sichtbar, keine Versionskonflikte | Gut, API ist klein und stabil | Gut, viel Trainingsdaten, aber Phaser-3-vs-4-Verwirrung möglich | Mittel |
| Debugging | Trivial | Einfach | Framework-Magie kann verwirren | Komplex |

**Empfehlung: Vite plus Vanilla TypeScript plus Canvas 2D.** Kein Next.js: wir haben keine Routen, kein SSR, keine API. Ein Next.js-Setup bringt nur Bundle-Gewicht und Hydration-Fragen für ein Spiel, das eine einzige Canvas ist. Vercel deployt Vite-Projekte ohne Konfiguration.

Begründung:
1. Bundle unter 50 KB. Auf Mittelklasse-Android lädt das in unter einer Sekunde, auch über Mobilfunk. Das erste Bild zählt bei einer Jury.
2. Bugrisiko ist am niedrigsten, wenn jede Zeile im eigenen Repo steht. Kein "warum macht Phaser das?".
3. KI-gestützt ist Canvas 2D am produktivsten, weil das Modell keinen Framework-Zustand raten muss.
4. Alles, was wir aus Abschnitt 3 brauchen (Partikel, Easing, Shake), sind zusammen unter 300 Zeilen.

**Ausnahme:** Wenn die gewählte Idee Rigid-Body-Physik mit vielen Kollisionen braucht (Suika-Stil), dann Matter.js als einzige Dependency (ca. 80 KB). Wenn die Idee 3D braucht, wird sie in dieser Zeit nicht bugfrei und sollte gestrichen werden (Einschätzung).

**Wann Phaser trotzdem Sinn hätte:** Wenn die Idee Tilemaps, viele Animationen, Kamera-Scrolling und Sprite-Sheets braucht. Das wären Spiele mit mehr Umfang, als wir uns leisten können.

---

## 5. Audio im Browser auf Mobile

Quellen: [Matt Montag](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos), [TimvanScherpenzeel Gist](https://gist.github.com/TimvanScherpenzeel/c870b35358fb96fa643d9ed1ea606efd), [Apple Developer Forums](https://developer.apple.com/forums/thread/763919)

**Autoplay-Regeln:**
- Kein Browser spielt Audio ohne User-Geste. Der `AudioContext` startet im Zustand `suspended` und muss per `resume()` in einem Touch- oder Click-Handler gestartet werden.
- iOS-Falle: die Geste zählt erst, wenn der Finger den Bildschirm verlässt (`touchend`), nicht bei `touchstart`.
- Ein einziger `AudioContext` für das ganze Spiel, einmal entsperren, wiederverwenden. Mehrere Contexts sind auf iOS ein Bugherd.
- iOS 18 hatte Regressionen mit dekodierten MP3s im AudioContext. Synthetisierte Sounds (siehe unten) umgehen das komplett.

**Praktische Lösung:** Ein "Tap to Play"-Startscreen. Der erste Tap entsperrt Audio und startet das Spiel. Das ist ohnehin gutes Design, weil der Spieler sich orientieren kann.

**Sound-Tools:**
- [ZzFX](https://github.com/KilledByAPixel/ZzFX): unter 1 KB, 20 Parameter, jeder Sound ist eine Zeile mit Zahlen. Web-Designer zum Ausprobieren. Dazu ZzFXM für kleine Musik-Loops. **Empfehlung für uns.**
- [jsfxr](https://sfxr.me/): Port des Klassikers sfxr, Presets (pickupCoin, explosion, powerUp, hitHurt). Etwas retro im Klang.
- Für Musik (Einschätzung): Entweder ZzFXM (Tracker-Style, chiptune) oder ein einziger kurzer Loop als OGG/MP3, unter 200 KB. Musik ist für "Eye Candy" wichtiger als man denkt, aber Sound-Effekte haben Vorrang.

**Haptik:**
- `navigator.vibrate()` funktioniert auf Android Chrome, wird von iOS Safari ignoriert ([Interop Issue](https://github.com/web-platform-tests/interop/issues/718)).
- Auf iOS gibt es seit 17.4 den Trick über `<input type="checkbox" switch>`, der ein Haptik-Feedback auslöst. Laut [vibrator.dev](https://vibrator.dev/) soll Apple das ab iOS 26.5 wieder geschlossen haben. **Nicht verifiziert**, muss auf einem echten Gerät getestet werden.
- Konsequenz: Haptik als optionales Extra für Android einbauen (5 Zeilen), auf iOS nicht darauf verlassen. Der Jury-Eindruck kommt aus Sound und Visuals, nicht aus Vibration.

---

## 6. Was Gewinner von Competitions unterscheidet

Quellen: [StraySpark Survival Guide](https://www.strayspark.studio/blog/game-jam-survival-guide-tools-templates), [Jellytempo](https://jellytempo.com/how-i-won-a-game-jam/), [WPI Judging](https://wp.wpi.edu/gamejam/judging-and-awards/), [GDevelop Jam Winners](https://gdevelop.io/blog/winners-gdevelop-game-jam-9)

1. **Die ersten 30 Sekunden entscheiden.** Juroren spielen viele Einreichungen. Wer nicht sofort hookt, wird weggeklickt. Kein Menü-Labyrinth, kein Tutorial-Text: der erste Tap ist schon Spiel.
2. **Fertig schlägt groß.** Scope-Disziplin korreliert mit besseren Bewertungen. Gewinner-Spiele fühlen sich komplett an, auch wenn sie klein sind. Ein Level, eine Mechanik, ein Gegnertyp, dann Polish.
3. **Bugfrei ist Pflicht, nicht Bonus.** Juroren nennen "bug-free" explizit als Kriterium. Ein Crash beim Judging ist ein Ausschluss, egal wie gut die Idee ist.
4. **Juice ist der beste Return pro Stunde.** Screen Shake, Partikel, Sound, Easing machen ein Spiel für wenig Aufwand deutlich wertiger.
5. **Die Präsentation zählt mit.** Ein klarer Loom, ein sauberer Repo-README, ein Titelbild. Jack fordert explizit einen 60-Sekunden-Loom. Der Loom muss die besten 60 Sekunden zeigen, nicht die ersten.

**Einschätzung speziell für Jacks Competition:**
- Die Jury besteht aus Leuten aus einem KI-Kurs, nicht aus Game-Designern. Sie bewerten, was sie fühlen, nicht was sie analysieren. Das spricht für Eye Candy und sofortiges Verständnis, gegen tiefe Systeme.
- "Best Game: the one the judges kept playing after judging" und "One More Go" überlappen fast vollständig. Wer eins gewinnt, hat gute Chancen auf das andere. Die Kategorien sind aber wahrscheinlich exklusiv vergeben (ein Spiel, ein Preis), also sollten wir eine zweite, unabhängige Stärke haben: Most Creative oder Eye Candy.
- Viele Einreichungen werden Tetris, Snake, Flappy-Klone sein, weil Jack sie als Beispiele nennt. Alles, was sichtbar anders aussieht, hebt sich ab. Ein eigener visueller Stil ist billiger als eine eigene Mechanik und wirkt sofort.
- Eine Idee mit Physik als Zufallsquelle (Suika, Ballionaire) erzeugt "erzählbare Momente" ohne Content-Produktion. Das ist für 30 Stunden ein enormer Hebel.

---

## Konsequenzen für Phase 3 (Brainstorming)

Aus dem Research ergeben sich Filter, die jede Idee bestehen muss:

1. Genau eine Eingabe (Tap, Hold, Swipe, Drag). Zwei Eingaben nur mit sehr gutem Grund.
2. Mindestens eine Mechanik, die Near Misses und Kettenreaktionen von selbst erzeugt.
3. Ein Endless- oder Score-Modus für die Jury, Daily-Seed höchstens als Zusatz.
4. Bekanntes Muster plus ein Twist, der im ersten Screenshot sichtbar ist. Nicht nur in den Regeln.
5. Sound und Juice müssen mit maximal 6 Stunden Aufwand einbaubar sein, sonst frisst die Kernmechanik das Polish-Budget.
6. Kein Content-Grind: keine 50 Level, keine 100 Items. Systeme, die Vielfalt erzeugen, statt Inhalte, die produziert werden müssen.
