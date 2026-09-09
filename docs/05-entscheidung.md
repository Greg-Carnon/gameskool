# Phase 5: Entscheidung und angepasster Plan

Stand: 9. September 2026.

## Freigabe

Greg hat zwei Ideen freigegeben:

1. **Blitzableiter** (Nr. 1 der Shortlist)
2. **Jack vs Slop** (Nr. 31, vorher Arbeitstitel "No Slop")

## Jack als Figur: visuelle Merkmale

Aus Gregs Beschreibung und den Kanal-Thumbnails (Stand September 2026):

- Blonde, leicht wellige Haare, die unter der Cap hervorschauen
- **Immer eine Cap.** Zwei Varianten gesehen: weiß mit kleinem Logo, gelb-khaki. Die Cap ist das Erkennungsmerkmal Nummer eins
- Schnurrbart, das Erkennungsmerkmal Nummer zwei
- Muskulös, breite Schultern. Im Spiel: kräftiger Oberkörper, kein Strichmännchen
- Kleidung: schwarzer Hoodie oder Sweater mit weißem Schriftzug-Print, silberne Kette. Alternativ Tanktop
- Studio-Setting: grünes LED-Licht im Hintergrund, Pflanzen, Mikrofon im Bild. Das grüne Licht ist eine Palette-Idee für das Spiel
- Gestik: zeigt mit dem Finger, spricht ins Mikro, offene Handflächen

**Avatar-Regel:** Vektor, stilisiert, drei Merkmale reichen: Cap, Schnurrbart, blonde Haare unterm Rand. Kein Foto, keine Fotoähnlichkeit. Vier Posen: neutral, Wisch-Geste, zufriedenes Nicken, Entsetzen.

## Das Problem mit zwei Spielen

Budget: 25 bis 35 Stunden. Einschätzung für zwei Spiele mit vollem Polish nach den Definitions of Done:

| Posten | Stunden |
|---|---|
| Gemeinsamer Unterbau (Loop, Input, Partikel, Tween, Shake, SFX, Storage, Overlays) | 4 bis 5 |
| Blitzableiter: Prototyp, Feel, Polish, QA | 12 bis 15 |
| Jack vs Slop: Prototyp, Design-System, Generator, Website-Aufbau, Avatar, Polish, QA | 20 bis 25 |
| Zwei Looms, zwei READMEs, zwei Posts | 3 bis 4 |
| **Summe** | **39 bis 49** |

Das sind 10 bis 15 Stunden über Budget. Ohne Gegenmaßnahme sind das zwei Spiele mit 70 Prozent Polish, und 70 Prozent gewinnt bei "Eye Candy" nicht.

## Der Weg, der beides ermöglicht

**Prinzip: Beide Prototypen früh, Polish nur dort, wo es sich lohnt.**

1. **Gemeinsamer Unterbau zuerst.** Alles aus der Projektstruktur in Phase 2, was nicht spielspezifisch ist, wird einmal gebaut und in beiden Spielen benutzt. Ein Repo mit zwei Vite-Einstiegen oder zwei Repos mit kopiertem `fx/`-Ordner. Empfehlung: **ein Repo, zwei Apps**, damit ein Bugfix im Partikel-System beiden zugutekommt. Vercel kann zwei Projekte aus einem Repo mit unterschiedlichem Root Directory deployen.

2. **Beide grauen Prototypen bis 14. September.** Blitzableiter braucht dafür etwa 3 Stunden, Jack vs Slop etwa 5. Am 14. September der Go/No-Go für beide, mit je einer Frage:
   - Blitzableiter: Will ich weiterspielen, um eine längere Kette zu bauen?
   - Jack vs Slop: Erkennen Fremd-Tester auf dem Handy jede Stufe-2-Verletzung in unter einer Sekunde?

3. **Priorität nach dem Go/No-Go.** Das Spiel, das sich im Prototyp besser anfühlt, bekommt den vollen Polish-Block (19. bis 23. September). Das zweite bekommt, was übrig bleibt. Wenn nichts übrig bleibt, wird es nicht eingereicht. Ein fertiges Spiel und ein Prototyp im Repo sind besser als zwei halbfertige Einreichungen.

4. **Scope-Kürzungen, die von Anfang an gelten:**
   - Jack vs Slop: 6 Templates, 12 Verletzungstypen, Stufe 3 nur wenn Stufe 2 sitzt. Avatar nach dem Feature Freeze.
   - Blitzableiter: kein Daily-Modus, kein Push-your-Luck-System, nur Endless mit Rekord.
   - Beide: keine Musik-Loops, nur SFX. Musik kommt nur, wenn am 24. September Zeit ist.

5. **Feature Freeze bleibt der 23. September.** Für beide.

## Zwei Fragen zur Ausschreibung

- **Zwei Einreichungen von einer Person:** Die Ausschreibung sagt nichts dagegen. Einschätzung: Zwei Posts sind erlaubt, könnten aber die Aufmerksamkeit der Jury teilen. Alternative: ein Post mit zwei Links. Das sollte Greg in der Community kurz klären, bevor wir posten.
- **First Timer:** Gilt nur für das erste Spiel. Wenn beide eingereicht werden, ist das zweite kein First-Timer-Spiel mehr. Einschätzung: Jack vs Slop sollte das First-Timer-Spiel sein, weil seine Story ("mein erstes Spiel, über Jacks Mission") am stärksten ist.

## Angepasster Zeitplan

| Zeitraum | Blitzableiter | Jack vs Slop | Stunden |
|---|---|---|---|
| 10. Sept | Repo, Vercel, Unterbau, Palette, Font | | 4 bis 5 |
| 11. bis 12. Sept | Grauer Prototyp | | 3 |
| 12. bis 14. Sept | | Design-System festlegen, grauer Prototyp | 5 bis 6 |
| 14. Sept | **Go/No-Go beide.** Priorität festlegen | | 1 |
| 15. bis 18. Sept | Feel und Balancing (Priorität 1 zuerst) | | 6 bis 7 |
| 19. bis 23. Sept | Eye Candy für Priorität 1, dann Priorität 2 | | 8 bis 10 |
| 23. Sept | **Feature Freeze** | | |
| 24. bis 26. Sept | QA beide Geräte, beide Spiele | | 4 |
| 27. bis 28. Sept | Looms, READMEs, Posts | | 3 |
| 29. bis 30. Sept | Puffer | | 0 bis 3 |
| **Summe** | | | **34 bis 42** |

Das ist immer noch über dem oberen Rand von 35. Realistisch heißt das: Entweder Greg legt 5 bis 7 Stunden drauf, oder das zweite Spiel wird am 23. September mit reduziertem Polish eingefroren. Beides ist okay, aber es muss vorher klar sein.

## Nächste Schritte nach Freigabe dieses Plans

1. Projektnamen festlegen: `blitzableiter` und `jack-vs-slop` als Vercel-Slugs, ein Repo `gameskool` oder zwei Repos.
2. GitHub-Repo und Vercel-Projekte anlegen.
3. Palette und Font pro Spiel wählen. Vorschlag: Blitzableiter dunkelblau-schwarz mit Elektroblau und Weiß, Jack vs Slop schwarz mit dem Studio-Grün als Akzent und einem sauberen Sans-Serif, das selbst wie ein Design-System aussieht.
4. Design-System-Regeln für Jack vs Slop in `rules.ts` schreiben, bevor irgendein Sprite gezeichnet wird.
5. Unterbau bauen, dann Blitzableiter-Prototyp.
