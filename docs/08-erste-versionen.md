# Erste Versionen der vier übrigen Top-5-Ideen

Stand: 9. September 2026, abends. Alle sechs Spiele live unter https://gameskool.vercel.app (Landing-Page mit Links).

Nach Gregs Feedback ("schon besser, aber nicht der Hit") wurden Echo, Zeitfinger, Sonar und Dungeon Deal als spielbare erste Versionen gebaut, jeweils mit eigenem Look von Anfang an. Ziel: durch Spielen herausfinden, welche Idee trägt, bevor Polish-Stunden fließen.

| Spiel | URL | Look | Kern | Tests |
|---|---|---|---|---|
| Echo | /echo/ | Abenddämmerung, Hügel-Parallaxe, Sonne, orangener Blob, Fredoka und Caveat, Creme-Karte mit hartem Schatten | Runner, Tap springt, Hold springt höher. Jeder Tod hinterlässt einen tödlichen Echo-Marker auf der Tagesstrecke (localStorage, Daily-Seed). Alte Läufe laufen als Geister mit | 3 |
| Zeitfinger | /zeitfinger/ | Cremepapier, rote Gefahren, schwarzer Punkt, eingefroren wird alles grau, schwarze Karte mit rotem Schatten | Zeit läuft nur bei Hold. Balken, rotierende Strahlen, pulsierende Kreise. Multiplikator bis x3 bei ununterbrochenem Halten | 4 |
| Sonar | /sonar/ | Tiefsee-Schwarz mit Türkis, gelbes U-Boot mit Propeller, Perlen mit Glow, Minen mit rotem Blinken, Quallen | Tap setzt Ziel und sendet Ping. Objekte sichtbar für eine Sekunde. Ping kostet Sauerstoff, Perlen geben ihn zurück. Minen ticken bei Nähe | 3 |
| Dungeon Deal | /dungeon-deal/ | Grüner Filztisch, Pergament-Karten mit Goldrand, Cinzel als Schrift, CSS-Flip, SVG-Icons | Karte für Karte aufdecken. Gold, Monster, Trank, Falle. Jederzeit raus und sichern. Anzeige, wie viele Monster noch im Deck sind. Etagen werden gefährlicher | 4 |

Alle vier per Playwright auf 390x844 gestartet, gespielt, Game Over geprüft, keine Konsolenfehler. 47 Tests grün.

## Design-Entscheidungen, die vom Shortlist-Text abweichen

- **Echo:** Statt "Geister sind tödlich" sind nur die **Todespunkte** tödlich. Exakte Geister-Kollision wäre nach fünf Läufen unspielbar geworden (Einschätzung, in Phase 4 als Risiko genannt). Die Replays laufen kosmetisch mit. Die Strecke ist pro Tag gleich, die Echos bleiben den Tag über, "Clear today's echoes" setzt zurück.
- **Zeitfinger:** Keine Seitensteuerung. Der Spieler steigt in einer Bahn gerade nach oben, die Gefahren bewegen sich quer. Die einzige Entscheidung ist **wann**, nicht wohin. Damit bleibt es eine Eingabe.
- **Sonar:** Keine Felsen, keine Scroll-Welt. Ein Feld, Objekte spawnen nach, Quallen driften. Perlen sind die Sauerstoffquelle, sonst stirbt man nach 30 Sekunden.
- **Dungeon Deal:** DOM statt Canvas, weil Karten mit CSS-Flip in 40 Zeilen fertig sind. Keine Perks, dafür der Monster-Zähler, der aus Raten Rechnen macht.

## Was ich beim Spielen bemerkt habe (Einschätzung)

- **Echo** ist mit Script-Timing sehr hart (58 bis 82 m). Auf dem Handy mit echtem Timing sicher besser, aber die Hindernisdichte am Anfang gehört runter.
- **Zeitfinger** stirbt bei Dauerhalten nach 2 bis 3 Sekunden. Gut: Nichtstun ist keine Option, Dauerhalten auch nicht. Die Strahlen sind das gemeinste Element.
- **Sonar** ist ruhig und atmosphärisch. Die Frage aus der Shortlist bleibt: Fühlt es sich unfair an, blind in eine Mine zu fahren? Das Ticken hilft, muss aber auf dem Handy mit Sound getestet werden.
- **Dungeon Deal** ist sofort verständlich und fühlt sich fertig an, weil DOM-Karten von Natur aus sauber aussehen. Es ist das Spiel mit dem geringsten Risiko und dem geringsten Wow.

## Bitte an Greg

Alle sechs auf dem Handy spielen, jedes mindestens drei Runs, und dann nur eine Frage beantworten: **Welches hast du freiwillig ein viertes Mal gespielt?** Das ist die Go/No-Go-Frage der Jury ("the one the judges kept playing").
