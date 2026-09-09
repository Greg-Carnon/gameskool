# Phase 4: Bewertung, Shortlist, Empfehlung

Stand: 9. September 2026.

Alle Bewertungen sind Einschätzungen auf Basis des Research aus Phase 1 und der Rahmenbedingungen aus Phase 2. Skala 1 bis 5, höher ist besser. "Bugrisiko" ist umgekehrt: 5 bedeutet geringes Risiko.

---

## 1. Bewertungstabelle

| Nr. | Idee | Sucht | Originalität | Eye Candy | Umsetzbar | Bugrisiko (inv.) | Summe |
|---|---|---|---|---|---|---|---|
| 1 | Blitzableiter | 4 | 4 | 5 | 4 | 4 | **21** |
| 2 | Sonar | 4 | 5 | 5 | 3 | 3 | **20** |
| 3 | Echo | 4 | 5 | 3 | 5 | 4 | **21** |
| 4 | Farbfang | 3 | 4 | 4 | 5 | 4 | 20 |
| 5 | Schwarm | 3 | 3 | 5 | 3 | 3 | 17 |
| 6 | Tinte | 2 | 4 | 4 | 3 | 3 | 16 |
| 7 | Umkehr | 4 | 4 | 3 | 2 | 2 | 15 |
| 8 | Feuerwerk | 4 | 3 | 5 | 4 | 3 | 19 |
| 9 | Schleuder | 2 | 3 | 4 | 4 | 4 | 17 |
| 10 | Magnet | 3 | 2 | 3 | 5 | 4 | 17 |
| 11 | Wurzel | 3 | 4 | 4 | 3 | 3 | 17 |
| 12 | Leuchtturm | 4 | 4 | 5 | 3 | 3 | 19 |
| 13 | Herzschlag | 3 | 3 | 3 | 5 | 5 | 19 |
| 14 | Dirigent | 3 | 5 | 3 | 2 | 1 | 14 |
| 15 | Blasen | 4 | 3 | 4 | 2 | 2 | 15 |
| 16 | Spiegel | 3 | 4 | 5 | 3 | 3 | 18 |
| 17 | Wabe | 4 | 4 | 3 | 3 | 2 | 16 |
| 18 | Konstellation | 2 | 4 | 4 | 3 | 3 | 16 |
| 19 | Buchstabenregen | 3 | 2 | 2 | 5 | 4 | 16 |
| 20 | Zielsumme | 4 | 3 | 2 | 5 | 5 | 19 |
| 21 | Primzahl | 3 | 4 | 2 | 5 | 5 | 19 |
| 22 | Dungeon Deal | 5 | 3 | 3 | 5 | 4 | **20** |
| 23 | Aufzug | 4 | 4 | 3 | 3 | 3 | 17 |
| 24 | Kreisel | 3 | 3 | 4 | 5 | 4 | 19 |
| 25 | Kristall | 2 | 4 | 5 | 3 | 3 | 17 |
| 26 | Regentropfen | 3 | 4 | 4 | 2 | 2 | 15 |
| 27 | Zeitfinger | 4 | 5 | 3 | 5 | 4 | **21** |
| 28 | Schatten | 3 | 4 | 5 | 3 | 2 | 17 |
| 29 | Orbit | 4 | 2 | 4 | 3 | 3 | 16 |
| 30 | Puls | 4 | 3 | 4 | 5 | 5 | **21** |
| 31 | No Slop (Nachtrag) | 4 | 5 | 4 | 3 | 3 | **19** |

**Hinweis zur Summe:** Die Summe ist nur ein Filter. Nach deiner Regel gewinnt ein Spiel, das in zwei Kategorien stark ist, gegen eines, das überall mittel ist. Deshalb ist Puls (21) nicht in der Top 5, obwohl die Summe stimmt: es ist nirgends eine 5 außer bei Umsetzbarkeit und Bugrisiko, und die gewinnen keinen Preis. Farbfang (20) fällt aus demselben Grund und wegen des Farbenblindheits-Risikos raus.

---

## 2. Top 5

### Platz 1: Blitzableiter (Nr. 1)

**Warum es gewinnen kann.** Blitze mit Glow auf schwarzem Grund sind das Beste, was Canvas 2D kann, und hier sind sie nicht Dekoration, sondern die Mechanik. Jede Kettenreaktion ist automatisch ein Juice-Moment, der mit der Kettenlänge wächst: lauter, heller, mehr Shake. Das trifft Eye Candy direkt. Gleichzeitig ist der Near Miss eingebaut: ein Ableiter einen Millimeter außerhalb des Radius bricht die Kette, und der Spieler sieht den Funken, der nicht überspringt. Das ist der "One More Go"-Moment, ohne dass wir ihn konstruieren müssen. Die Idee ist in einem Screenshot verständlich und in einem Tap erklärt. Kein Content-Grind: das System erzeugt aus Ladungs-Positionen und Ableiter-Netzen unendlich viele Situationen.

**Was schiefgehen kann.** Das Radius-Tuning. Ist der Radius sichtbar, ist das Spiel eine Messübung. Ist er unsichtbar, fühlt sich jede gebrochene Kette unfair an. Der Prototyp muss das lösen, bevor irgendetwas anderes gebaut wird. Zweites Risiko: Tempo. Wenn Ladungen zu langsam wandern, ist es ein Puzzle. Zu schnell, ein Reflex-Spiel. Der Sweet Spot ist wahrscheinlich: langsam genug zum Planen, schnell genug, dass Zögern kostet.

**Erster Prototyp-Schritt.** Graue Kreise als Ladungen, die zufällig wandern. Tap setzt einen Punkt. Berührt eine Ladung einen Punkt, wird sie gelöscht und alle Punkte im Radius R lösen dasselbe für ihre Ladungen aus. Kettenlänge als Zahl anzeigen. Kein Glow, kein Sound. Frage nach 3 Stunden: Will ich weiterspielen, um eine längere Kette zu bauen? Wenn ja, weiter. Wenn nein, Idee wechseln.

### Platz 2: Echo (Nr. 3)

**Warum es gewinnen kann.** Es ist die kreativste Idee der Liste, die gleichzeitig am billigsten ist. "Deine früheren Runs sind die Gegner" ist ein Satz, den Jack sofort versteht und wahrscheinlich noch nie gehört hat. Most Creative ist damit realistisch. One More Go entsteht von selbst: jeder Run verändert den nächsten, also ist kein Run wie der vorherige, und man will sehen, ob man sich selbst schlägt. Die Umsetzung ist ein Runner plus ein Array mit Positionen pro Frame. Das Bugrisiko ist minimal.

**Was schiefgehen kann.** Eye Candy ist schwächer als bei Blitzableiter: ein Runner mit Geistern ist optisch bekannt. Und die Geister-Regel muss stimmen: Nach wie vielen Runs werden Geister gelöscht? Wenn sich Geister aufstapeln, wird das Spiel nach 10 Runs unspielbar, und die Jury hört genau dann auf. Wenn sie zu schnell verschwinden, ist der Twist wirkungslos.

**Erster Prototyp-Schritt.** Einfacher Runner: Tap springt, Rechtecke kommen. Positionen pro Frame speichern. Beim Neustart die letzten 3 Runs als halbtransparente Rechtecke abspielen, Kollision damit ist Game Over. Frage: Fühlt sich das nach "gegen mich selbst" an oder nur nach "mehr Hindernisse"?

### Platz 3: Zeitfinger (Nr. 27)

**Warum es gewinnen kann.** "Zeit läuft nur, wenn dein Finger auf dem Bildschirm liegt" ist als Mechanik sofort spürbar und in der ersten Sekunde verstanden. Es ist ein Superhot-Prinzip, aber in einem Mobile-Kontext, in dem das noch nicht abgenutzt ist. Der Hold-Bonus schafft eine echte Push-your-Luck-Entscheidung: lange halten ist riskant und lohnt sich. Technisch ist es ein globaler Zeitfaktor, der 0 oder 1 ist. Kaum Bugfläche.

**Was schiefgehen kann.** Die Balance des Hold-Bonus entscheidet über alles. Zu schwach: jeder pausiert ständig, das Spiel ist trivial. Zu stark: niemand pausiert, es ist ein normaler Runner. Und Eye Candy ist ein Problem: Stillstand ist optisch tot. Es braucht eine visuelle Sprache für "eingefroren" (Farbentzug, Vignette, Partikel schweben) und für "laufend" (Farbe kehrt zurück, Motion Blur). Das ist machbar, aber es muss geplant sein.

**Erster Prototyp-Schritt.** Runner mit automatischer Vorwärtsbewegung, die nur bei Hold läuft. Hindernisse ebenfalls. Ein Bonus-Zähler, der bei Hold steigt und bei Release auf null geht. Frage: Halte ich freiwillig länger, als mir lieb ist?

### Platz 4: Sonar (Nr. 2)

**Warum es gewinnen kann.** Es ist die stärkste Kombination aus Most Creative und Eye Candy in der Liste. Sehen kostet Ressourcen, das kennt niemand aus einem Mobile-Game. Und der Look, expandierende Ringe auf Schwarz, Objekte, die aufleuchten und verblassen, ist ein Alleinstellungsmerkmal im ersten Screenshot. Wenn es funktioniert, ist es das Spiel, das die Jury als "anders" erinnert.

**Was schiefgehen kann.** Es ist die riskanteste Idee der Top 5. Blind in eine Mine fahren fühlt sich unfair an, und Unfairness killt "One More Go" schneller als alles andere. Die Gegenmaßnahmen (Minen ticken hörbar, wenn nah, Objekte bleiben schwach sichtbar) kosten Design-Iterationen, die wir uns nur einmal leisten können. Und die Umsetzbarkeit ist eine 3: Sichtbarkeits-Timer pro Objekt, Sauerstoff-Ökonomie, Bewegung mit Trägheit, Spawner, das sind vier Systeme.

**Erster Prototyp-Schritt.** Schwarzer Screen, ein Punkt (du), Tap sendet einen Ring und setzt das Ziel. Objekte im Ring werden für 1 Sekunde sichtbar. Sauerstoff-Balken sinkt pro Ping. Frage: Ist das Dilemma spürbar, oder pinge ich einfach ständig?

### Platz 5: Dungeon Deal (Nr. 22)

**Warum es gewinnen kann.** Push-your-Luck ist das stärkste One-More-Go-Muster, das es gibt. "Noch eine Karte" ist das Spielprinzip und der Suchtmechanismus in einem. Die Umsetzung ist trivial, das Bugrisiko niedrig, und ein kleiner Meta-Fortschritt (gesichertes Gold kauft Perks) gibt Ownership über Runs hinweg. Für einen First Timer ist es die sicherste Wahl auf der Liste.

**Was schiefgehen kann.** Es gewinnt wahrscheinlich nur eine Kategorie. Eye Candy mit Karten ist begrenzt, Most Creative ist bei Push-your-Luck-Kartenspielen schwer (Card Crawl, Deep Sea Adventure und ähnliche existieren). Und ohne sichtbare Stapel-Information ("noch 3 Monster im Stapel") ist es reines Glück, was sich nach zehn Runs leer anfühlt.

**Erster Prototyp-Schritt.** 20 Karten, 4 Typen, Tap deckt auf, Tap auf "Raus" sichert. Leben und Gold als Zahlen. Frage: Spiele ich nach dem Tod sofort noch mal?

---

## 3. Empfehlung: Blitzableiter

**Ich empfehle Blitzableiter, und zwar deutlich vor den anderen.** Die Begründung in fünf Punkten:

1. **Zwei starke Kategorien, nicht vier mittlere.** Eye Candy ist bei dieser Idee kein Aufsatz, sondern die Mechanik selbst. Eine Kette von fünf Blitzen mit Glow, Shake und aufsteigendem Sound ist der Moment, den man in den Loom packt. Und One More Go entsteht aus dem Near Miss, der in der Radius-Regel steckt. Dazu ein realistischer dritter Platz bei Most Creative, weil niemand ein Spiel erwartet, in dem man ein Netz baut, das sich selbst entlädt.

2. **Es bleibt klein.** Ein Objekttyp (Ladung), ein Spielerobjekt (Ableiter), eine Regel (Radius), eine Eingabe (Tap). Keine Physik-Engine, keine Wortliste, kein Kartendeck, kein Meta-System. Alles, was das Spiel interessant macht, kommt aus Position und Timing. Das ist der Grund, warum ich es für 25 bis 35 Stunden inklusive Polish für realistisch halte.

3. **Das Bugrisiko ist beherrschbar.** Die Kettenreaktion ist eine Breitensuche über Abstände. Das ist ein Algorithmus, den man in 20 Zeilen schreibt und in 10 Minuten testet. Die Edge Cases (Ableiter verfällt während der Kette, zwei Ladungen treffen gleichzeitig) sind zählbar und lösbar, bevor der erste Partikel gerendert wird.

4. **Es hat eine natürliche Schwierigkeitskurve ohne Content.** Mehr Ladungen, schnellere Ladungen, kürzere Ableiter-Lebensdauer. Drei Zahlen in `rules.ts`, keine Level.

5. **Daily-Seed passt ohne Umbau.** Ladungs-Spawns aus einem Datums-Seed, fertig. Ein Share-Text mit der längsten Kette des Tages als Blitz-Emojis. Das ist ein Zusatzmodus für 2 Stunden, der Social Influence und Scarcity dazuholt, ohne den Kern zu ändern.

**Octalysis-Check für Blitzableiter:**

| Drive | Eingebaut durch | Stärke |
|---|---|---|
| 2 Accomplishment | Längste Kette als Rekord, Score, sichtbare Skill-Kurve beim Abstand-Schätzen | Stark |
| 3 Empowerment | Netz-Formen ausprobieren: Linie, Dreieck, Cluster. Sofortiges Feedback | Stark |
| 4 Ownership | Rekord, Daily-Streak (Zusatz) | Mittel |
| 5 Social | Share-Text der Tageskette (Zusatz) | Schwach, bewusst |
| 6 Scarcity | Max. 5 Ableiter gleichzeitig, jeder verfällt nach Zeit | Mittel |
| 7 Unpredictability | Ladungen wandern mit Rauschen, man weiß nie genau, wann sie treffen | Stark |
| 8 Loss | Kette bricht bei einem Meter zu viel, Ableiter verfallen ungenutzt | Stark |

White Hat (2, 3) und Black Hat (7, 8) sind beide stark. Genau die Balance, die das Research für One More Go beschreibt.

**Die eine Sache, die den Prototyp entscheidet:** Der Radius. Mein Vorschlag für den ersten Test: Beim Setzen wird der Radius für 0,5 Sekunden als schwacher Ring angezeigt, dann verblasst er. Der Spieler lernt ihn, muss ihn aber erinnern. Bricht eine Kette knapp, springt ein Funke sichtbar Richtung nächstem Ableiter und verpufft kurz davor. Das ist der Near Miss, den der Spieler sieht und der ihn zurückholt.

**Offene Design-Frage für den Prototyp (nicht jetzt entscheiden):** Soll es eine Push-your-Luck-Komponente geben? Etwa: Ladungen, die den Bildschirm verlassen, kosten ein Leben, aber je mehr Ladungen sich sammeln, bevor man das Netz schließt, desto länger die Kette. Das würde One More Go verstärken, aber ein System hinzufügen. Der graue Prototyp zeigt, ob es nötig ist.

**Fallback:** Wenn der Blitzableiter-Prototyp am 14. September keinen Spaß macht, ist Echo der Ersatz. Es ist noch billiger, und der Runner-Teil ist an einem Tag gebaut.

---

## 4. Was ich nicht empfehle, und warum

- **Sonar** ist die Idee, in die ich mich am ehesten verlieben würde. Genau deshalb steht sie auf Platz 4: Das Fairness-Problem ist ein Design-Risiko, das man erst im Spielen erkennt, und wir haben nur einen Versuch zum Umsteuern.
- **Dungeon Deal** ist die sicherste Wahl, aber sicher gewinnt bei Jack keine Preise. Es gewinnt vielleicht One More Go, aber es sieht aus wie zehn andere Einreichungen.
- Alle Physik-Ideen (Umkehr, Blasen, Regentropfen, Orbit) haben mich beim Bewerten gereizt, aber Matter.js-Tuning und Kollisions-Edge-Cases sind genau die Bug-Klasse, die dein Stabilitäts-Kriterium ausschließt.

## 4b. Nachtrag: No Slop gegen Blitzableiter

No Slop (Nr. 31) kam nach der Bewertung dazu. Die Summe (19) liegt unter Blitzableiter (21), aber die Tabelle misst nicht, was diese Idee besonders macht: die Jury sieht sich selbst. Deshalb ein direkter Vergleich.

| Kriterium | Blitzableiter | No Slop |
|---|---|---|
| Most Creative | Realistisch, Platz 3 | **Sehr wahrscheinlich.** Niemand erwartet, dass der Juror der Held ist. Der Witz ist in einer Sekunde verstanden |
| Best Game | Über One More Go | **Stark.** Die Jury spielt weiter, um zu beweisen, dass sie Slop erkennt. Das ist ein Ego-Haken, kein Mechanik-Haken |
| Eye Candy | Eingebaut, Blitze mit Glow sind die Mechanik | **Bedingt.** Nur wenn die guten Komponenten wirklich gut sind. Dann ist es das schönste Spiel im Feld, sonst das peinlichste |
| One More Go | Stark durch Near Miss im Radius | Mittel bis stark durch Tempo, Combo, Slop-Meter und den Lern-Moment im Game Over |
| First Timer | Neutral | **Plus.** Die Story "mein erstes Spiel, und es ist über Jacks Mission" ist für den Skool-Post ideal |
| Umfang | Ein Objekttyp, eine Regel | Generator mit 8 Templates, 15 Verletzungstypen, wachsende Website, Avatar mit 4 Posen. Deutlich mehr Fläche |
| Bugrisiko | Niedrig, ein Algorithmus | Mittel. Nicht Logik-Bugs, sondern Wahrnehmungs-Bugs: eine Verletzung, die auf dem Handy nicht sichtbar ist, fühlt sich wie ein Bug an |
| Scope-Gefahr | Gering | **Hoch.** Jede neue Slop-Idee ist verlockend. Feature Freeze muss hart sein |
| Abhängigkeit | Keine | Jacks Aussehen und die Frage, ob die Hommage bei ihm ankommt |

**Ehrliche Einschätzung:** No Slop hat die höhere Decke und die höhere Varianz. Wenn es gelingt, gewinnt es wahrscheinlich Most Creative und hat echte Chancen auf Best Game, weil es die einzige Einreichung sein wird, die die Jury persönlich anspricht. Wenn es nur zu 80 Prozent gelingt, richtet sich der Witz gegen uns, weil ein Spiel über Slop selbst kein Slop sein darf. Blitzableiter hat die niedrigere Decke und gewinnt auch bei 80 Prozent noch Eye Candy.

**Was ich empfehle, wenn du No Slop willst:**
1. Die Design-System-Regeln vor dem ersten Code festlegen und in `rules.ts` schreiben. Das Spiel ist so gut wie diese Regeln.
2. Den Go/No-Go am 14. September auf eine konkrete Frage zuspitzen: Erkennen drei Fremd-Tester auf dem Handy jede Stufe-2-Verletzung in unter einer Sekunde? Wenn nein, Stufe 3 streichen und das Spiel schneller machen statt subtiler.
3. Templates auf 6 statt 8 begrenzen, Verletzungstypen auf 12 statt 15. Lieber wenige, die alle sitzen.
4. Jack-Avatar als Letztes bauen, nach dem Feature Freeze. Das Spiel muss ohne ihn funktionieren. Er ist die Pointe, nicht die Mechanik.

**Meine Empfehlung bleibt knapp bei Blitzableiter, wegen des Stabilitäts-Kriteriums aus deiner Vorgabe.** Aber wenn du bereit bist, das höhere Risiko zu tragen, ist No Slop die Idee mit der besten Geschichte für diese spezifische Jury, und ich würde sie ohne Bauchschmerzen bauen. Die Entscheidung hängt an einer Frage: Willst du ein Spiel, das sicher gut aussieht, oder eines, das Jack nie vergisst?

## 5. Wenn du eine andere Wahl triffst

Alle Top-5-Ideen sind mit dem Stack aus Phase 2 baubar. Der Zeitplan bleibt gleich. Nur bei Sonar würde ich den Go/No-Go auf den 13. September vorziehen, weil das Fairness-Risiko früher sichtbar sein muss.

**Nächster Schritt nach deiner Freigabe:** Projektname festlegen, Repo und Vercel-Projekt anlegen, Palette und Font wählen, dann der graue Prototyp. Nichts davon passiert in dieser Session.
