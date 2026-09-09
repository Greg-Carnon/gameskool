# Phase 3: 30 Spielideen

Stand: 9. September 2026.

Jede Idee ist gegen die sechs Filter aus dem Research geprüft: eine Eingabe, Near Miss und Kettenreaktion eingebaut, Endless-Modus für die Jury, Twist im ersten Screenshot sichtbar, Juice in unter 6 Stunden, kein Content-Grind.

Aufwand: S bedeutet unter 20 Stunden bis fertig inklusive Polish, M bedeutet 25 bis 35 Stunden (passt genau), L bedeutet über 35 Stunden (passt nicht ohne Kürzung).

Alle Aufwands- und Risikoangaben sind Einschätzungen.

---

## Arcade und Physik

### 1. Blitzableiter
Pitch: Du setzt Blitzableiter, und jeder Blitz springt von Ableiter zu Ableiter, solange sie nah genug beieinander stehen.
Core Loop: Ladungen wandern über den Bildschirm. Tap setzt einen Ableiter (max. 5 gleichzeitig, der älteste verschwindet). Trifft eine Ladung einen Ableiter, entlädt sie sich und springt auf alle Ableiter im Radius. Je länger die Kette, desto mehr Punkte, exponentiell.
Warum neu: Kein Tower Defense, kein Shooter. Man baut ein Netz, das sich selbst abbaut. Die Kunst ist der Abstand: knapp innerhalb des Radius gibt die Kette, knapp außerhalb bricht sie.
Steuerung: Ein Tap irgendwo auf den Bildschirm.
Octalysis: Empowerment (Netz-Strategien ausprobieren, sofortiges Feedback), Unpredictability (Ladungen wandern zufällig), Loss (Ableiter verfallen nach Zeit, Kette bricht bei einem Meter zu viel).
Preiskategorien: Eye Candy (Blitze mit Glow sind der beste Effekt, den Canvas hergibt), One More Go.
Aufwand: S bis M. Kreise, Distanzen, ein Blitz-Renderer mit zackigen Linien. Keine Physik-Engine.
Risiko: Der Radius ist unsichtbar oder zu sichtbar. Ist er sichtbar, ist es zu leicht. Ist er unsichtbar, fühlt es sich unfair an. Braucht Feintuning.

### 2. Sonar
Pitch: Der Bildschirm ist schwarz, und jeder Tap sendet einen Ping, der für eine Sekunde zeigt, was um dich herum lauert.
Core Loop: Du steuerst ein U-Boot, das sich zum letzten Tap-Punkt bewegt. Der Tap sendet gleichzeitig einen Sonar-Ring, der Felsen, Minen und Perlen aufleuchten lässt. Perlen sammeln, Minen meiden. Pings kosten Sauerstoff, Perlen geben ihn zurück.
Warum neu: Sehen und Bewegen sind dieselbe Aktion. Wer viel sieht, verbraucht viel. Wer blind fährt, spart. Das ist ein Ressourcen-Dilemma in einer Eingabe.
Steuerung: Tap auf Ziel.
Octalysis: Unpredictability (was zeigt der nächste Ping?), Loss (Sauerstoff sinkt sichtbar), Accomplishment (räumliches Gedächtnis wird belohnt).
Preiskategorien: Most Creative, Eye Candy (expandierende Ringe auf Schwarz, Objekte glühen auf und verblassen).
Aufwand: M. Ring-Expansion, Sichtbarkeits-Timer pro Objekt, Bewegung, Spawner.
Risiko: Frustration, wenn man blind in eine Mine fährt. Muss durch Regeln entschärft werden (Minen ticken hörbar, wenn nah).

### 3. Echo
Pitch: Ein Runner, in dem jeder deiner vergangenen Läufe als Geist mitläuft und dir im Weg steht.
Core Loop: Tap springt. Hindernisse kommen. Nach Game Over startet der nächste Run, und der Geist des letzten Runs läuft sichtbar mit. Berührst du einen Geist, bist du raus. Nach 5 Runs sind 5 Geister unterwegs, alle deine eigenen früheren Fehler.
Warum neu: Der Gegner bist du selbst, wortwörtlich. Die Strecke bleibt gleich, aber deine Vergangenheit macht sie schwerer. Nach 10 Runs ist die Strecke voll mit dir.
Steuerung: Tap zum Springen.
Octalysis: Accomplishment (du überholst dein früheres Ich), Social Influence (Vergleich mit dir selbst, sichtbar), Loss (jeder Fehler wird zum permanenten Hindernis).
Preiskategorien: Most Creative, One More Go.
Aufwand: S. Runner-Logik plus Aufzeichnung von Positionen pro Frame in einem Array.
Risiko: Wird nach 8 bis 10 Runs unspielbar, wenn Geister sich häufen. Lösung: nur die letzten 5 Geister, oder Geister verblassen. Die "Reset"-Regel muss sich richtig anfühlen.

### 4. Farbfang
Pitch: Deine Schale wechselt ständig die Farbe, und du fängst nur, was farblich passt, je näher der Ton, desto mehr Punkte.
Core Loop: Farbige Tropfen fallen. Deine Schale unten läuft kontinuierlich durch das Farbrad. Hold friert die Farbe ein, Release lässt sie weiterlaufen. Fängst du einen Tropfen, zählt der Farbabstand: exakt gleich gibt 10x, nah gibt 2x, weit weg bricht die Combo.
Warum neu: Der Near Miss ist ein Farbabstand, kein Pixelabstand. Man lernt, Farbtöne zu fühlen. Das ist ein Skill, den kein anderes Spiel abfragt.
Steuerung: Hold zum Einfrieren der Farbe.
Octalysis: Accomplishment (Farbgefühl wird messbar besser), Empowerment (Timing-Strategien), Loss (Combo bricht).
Preiskategorien: Eye Candy (das ganze Spiel ist ein Farbverlauf), Most Creative.
Aufwand: S. Fallende Kreise, HSL-Abstand, Hold-Erkennung.
Risiko: Farbenblindheit schließt 8 Prozent der Männer aus. Die Jury könnte betroffen sein. Muss mit einem Modus für Deuteranopie oder Form-Zusatz abgefangen werden.

### 5. Schwarm
Pitch: Ein Fischschwarm folgt deinem Finger, und du lotst ihn durch Netze, an Haien vorbei, ohne ihn zu verlieren.
Core Loop: Hold irgendwo: der Schwarm (30 bis 60 Boids) zieht dorthin. Release: er schwimmt frei weiter. Tore geben Punkte pro Fisch, der durchkommt. Haie fressen, was zu weit vom Zentrum abweicht.
Warum neu: Du steuerst keine Figur, sondern ein Verhalten. Der Schwarm hat Trägheit, Streuung, Eigenleben. Große Schwärme geben mehr Punkte, sind aber schwerer zu halten.
Steuerung: Hold und Ziehen mit einem Daumen.
Octalysis: Ownership (der Schwarm ist deiner, du fütterst ihn), Empowerment (Boids reagieren organisch), Loss (Fische verlieren tut sichtbar weh).
Preiskategorien: Eye Candy (Boids sind das schönste, was man in 100 Zeilen Code bekommt), Best Game.
Aufwand: M. Boids-Algorithmus, Kollision, Spawner, Zähler.
Risiko: Performance mit 60 Boids und Partikeln auf Mittelklasse-Android. Boids sind O(n²), bei 60 sind das 3600 Checks pro Frame, machbar, aber mit Partikeln testen.

### 6. Tinte
Pitch: Du tropfst Tinte, die sich ausbreitet, und musst mehr Fläche färben als das Papier trocknet.
Core Loop: Tap setzt einen Tintentropfen, der sich radial ausbreitet, bis er trocknet. Trockene Flächen bleiben gefärbt. Ein Fleck, der einen anderen berührt, fusioniert und breitet sich weiter aus. Das Papier schrumpft langsam von außen. Ziel: maximale Fläche, bevor nichts mehr übrig ist.
Warum neu: Ein Territory-Game ohne Gegner, gegen die Zeit, mit einer Fusion-Mechanik, die Kettenreaktionen ergibt.
Steuerung: Tap.
Octalysis: Empowerment (Muster ausprobieren), Unpredictability (Ausbreitung hat leichtes Rauschen), Loss (Papier schrumpft sichtbar).
Preiskategorien: Eye Candy (Aquarell-Look mit Overlaps ist schön), Most Creative.
Aufwand: M. Radiale Ausbreitung mit Noise, Fusion, Flächenmessung (Pixel zählen über Offscreen-Canvas).
Risiko: Flächenmessung per Pixel-Zählung kostet Performance. Muss auf niedriger Auflösung gerechnet werden. Und: es könnte zu ruhig sein für "One More Go".

### 7. Umkehr
Pitch: Du stapelst Blöcke, und alle fünf Blöcke dreht sich die Schwerkraft um, dann muss der Turm auch kopfüber halten.
Core Loop: Ein Block schwingt hin und her, Tap lässt ihn fallen. Nach jedem fünften Block kippt die Welt um 180 Grad. Was oben war, hängt jetzt. Überhänge, die vorher stabil waren, brechen ab.
Warum neu: Stapelspiele belohnen Zentrierung. Hier muss man in beide Richtungen denken. Der Flip ist ein Moment, den jeder erzählt.
Steuerung: Tap.
Octalysis: Accomplishment (Höhe), Unpredictability (was überlebt den Flip?), Loss (der Turm bricht sichtbar auseinander).
Preiskategorien: Most Creative, One More Go.
Aufwand: M mit Matter.js. Ohne Physik-Engine nicht machbar.
Risiko: Physik-Engine. Ein unrealistisches Kippen macht das Spiel unglaubwürdig, und Matter.js-Tuning kann Tage fressen.

### 8. Feuerwerk
Pitch: Du zündest Raketen, und wer mehrere gleichzeitig am Himmel explodieren lässt, kassiert Multiplikatoren.
Core Loop: Raketen steigen von unten auf. Tap auf eine Rakete zündet sie. Explosionen zünden alle Raketen in ihrem Radius mit. Drei gleichzeitige Explosionen geben 3x, fünf 8x. Raketen, die oben ankommen, ohne gezündet zu werden, verpuffen und kosten ein Leben.
Warum neu: Es ist ein Timing-Spiel, das man mit den Augen spielt: die Explosion selbst ist die Mechanik, nicht nur die Belohnung.
Steuerung: Tap.
Octalysis: Empowerment (Ketten planen), Unpredictability (Raketen steigen unterschiedlich schnell), Accomplishment (Combo-Zähler).
Preiskategorien: Eye Candy (das Spiel ist Partikel), Best Game.
Aufwand: S bis M. Partikel-System ist der Kern, muss aber sehr gut sein.
Risiko: Partikel-Explosion bei 5-fach-Combos auf Mittelklasse-Android. Braucht hartes Pooling und ein Limit.

### 9. Schleuder
Pitch: Du schießt Sonden zwischen Planeten hindurch und nutzt ihre Schwerkraft, um weiter zu kommen als je zuvor.
Core Loop: Hold lädt, Release schießt. Die Sonde fliegt an Planeten vorbei, deren Gravitation die Bahn krümmt. Ringe sammeln, Kollision ist Game Over. Nach jedem Schuss verschiebt sich die Planetenkonstellation leicht.
Warum neu: Gravity-Assist als Mechanik für ein Ein-Schuss-Spiel. Die Bahn ist vorhersagbar, aber nie ganz.
Steuerung: Hold und Release.
Octalysis: Empowerment (Bahnen lernen), Unpredictability (Konstellation wechselt), Accomplishment (Distanzrekord).
Preiskategorien: Eye Candy (Bahnspuren, Planeten mit Glow), Most Creative.
Aufwand: S bis M. N-Body mit 3 bis 5 Körpern ist 20 Zeilen.
Risiko: Zu langsam. Ein Schuss, warten, Ergebnis. Dazwischen passiert nichts. Für "One More Go" braucht es Tempo.

### 10. Magnet
Pitch: Du bist ein Magnet mit zwei Polen, und Metallteile fallen: anziehen oder abstoßen, um sie in die richtigen Behälter zu lenken.
Core Loop: Hold macht dich positiv, Release negativ. Rote Teile werden von Plus angezogen, blaue abgestoßen. Behälter links und rechts. Fallende Teile in Serie richtig sortieren.
Warum neu: Der Twist ist, dass Loslassen auch eine Aktion ist. Man steuert durch Nichtstun.
Steuerung: Hold.
Octalysis: Accomplishment (Sortier-Streak), Loss (falscher Behälter bricht Streak), Empowerment (Feldlinien als Feedback).
Preiskategorien: One More Go.
Aufwand: S. Kräfte, fallende Objekte, zwei Zonen.
Risiko: Zu ähnlich zu bekannten Sortierspielen. Der Twist ist klein.

### 11. Wurzel
Pitch: Du bist eine Wurzel, die in die Tiefe wächst, und jede Verzweigung kostet Kraft, aber nur Verzweigungen finden Wasser.
Core Loop: Die Wurzelspitze wächst automatisch nach unten. Tap links oder rechts lenkt sie. Hold verzweigt: es entstehen zwei Spitzen. Wasseradern geben Kraft, Steine stoppen die Spitze. Kraft sinkt kontinuierlich. Kein Wasser mehr, Ende.
Warum neu: Es ist ein Runner, der nach unten wächst und sich verzweigt. Das Bild am Ende, das ganze Wurzelwerk, ist der Share-Moment.
Steuerung: Tap links oder rechts, Hold zum Verzweigen. Das sind streng genommen zwei Eingaben.
Octalysis: Ownership (das Wurzelwerk ist ein Kunstwerk, das du gebaut hast), Accomplishment (Tiefe), Loss (Kraft sinkt).
Preiskategorien: Eye Candy (organische Linien, Share-Bild), Most Creative.
Aufwand: M. Pfad-Rendering, Multi-Spitzen, Spawner.
Risiko: Mehrere Spitzen gleichzeitig steuern überfordert. Muss auf max. 2 Spitzen begrenzt werden.

### 12. Leuchtturm
Pitch: Du drehst den Lichtkegel eines Leuchtturms, und Schiffe finden nur den Hafen, wenn dein Licht sie rechtzeitig trifft.
Core Loop: Schiffe tauchen am dunklen Rand auf und fahren auf Felsen zu. Hold dreht den Kegel im Uhrzeigersinn, Release stoppt. Ein Schiff im Licht dreht Richtung Hafen. Ein Schiff im Dunkeln fährt auf die Felsen. Mit der Zeit mehr Schiffe, schneller.
Warum neu: Du bewegst nichts außer Licht. Die Spannung liegt im Dunkeln: du hörst das Schiff, bevor du es siehst.
Steuerung: Hold zum Drehen.
Octalysis: Loss (jedes Schiff, das zerschellt, tut weh), Accomplishment (gerettete Schiffe), Unpredictability (woher kommt das nächste?).
Preiskategorien: Eye Candy (Lichtkegel auf Schwarz, Nebel, Reflexion auf Wasser), Best Game.
Aufwand: M. Kegel-Rendering mit Gradient, Sichtbarkeitsprüfung per Winkel, Schiffs-KI (trivial).
Risiko: Nur eine Drehrichtung könnte frustrieren. Zwei Richtungen brauchen zwei Eingaben (links halten, rechts halten). Das ist tolerierbar, aber es ist ein Kompromiss.

---

## Rhythmus

### 13. Herzschlag
Pitch: Tippe im Takt eines Herzschlags, der schneller wird, und jeder verpasste Schlag ist ein Stolpern des Herzens.
Core Loop: Ein Herz pulsiert, mit Ton. Tap im Takt hält es am Leben und gibt Punkte. Das Toleranzfenster schrumpft mit der Combo, der Takt beschleunigt. Ein Miss macht das Fenster wieder groß, aber die Combo ist weg.
Warum neu: Kein Song, keine Noten-Bahn. Das Rhythmus-Spiel ist auf seinen Kern reduziert. Der Screen ist nur das Herz.
Steuerung: Tap.
Octalysis: Accomplishment (Combo), Loss (das Herz stolpert hörbar), Scarcity (das Fenster wird knapper).
Preiskategorien: Eye Candy (ein pulsierendes Herz mit Glow, Farbwechsel nach Tempo), One More Go.
Aufwand: S. Timer, Fenster, Combo.
Risiko: Zu monoton. Braucht Variation (Rhythmuswechsel, Doppelschläge), sonst ist es nach 2 Minuten durch.

### 14. Dirigent
Pitch: Vier Instrumente spielen Loops, und du hältst sie im Takt, indem du das antippst, das gerade aus dem Tritt gerät.
Core Loop: Vier Kreise pulsieren, jeder ein Instrument. Zufällig driftet einer aus dem Takt (sichtbar wackelnd, hörbar schief). Tap darauf synchronisiert ihn wieder. Je länger alle synchron sind, desto mehr Punkte und desto voller der Sound.
Warum neu: Der Sound ist die Belohnung und das Feedback zugleich. Wer gut spielt, hört ein besseres Stück.
Steuerung: Tap auf einen der vier Kreise.
Octalysis: Empowerment (du erschaffst Musik), Loss (Musik zerfällt hörbar), Accomplishment.
Preiskategorien: Most Creative, Eye Candy (Sound zählt zu Polish).
Aufwand: M bis L. Vier synchronisierte Audio-Loops mit Pitch-Manipulation im Web Audio. Auf iOS riskant.
Risiko: Web Audio Timing auf Mobile. Latenz zwischen Tap und Sound-Korrektur. Wenn das nicht sauber läuft, ist das Spiel kaputt.

---

## Puzzle

### 15. Blasen
Pitch: Blasen steigen auf, und wenn du eine zerplatzt, reißt sie alle gleichfarbigen Nachbarn mit, also wartest du auf die perfekte Traube.
Core Loop: Blasen steigen von unten, verschiedene Farben, kleben aneinander. Tap zerplatzt eine Blase, alle berührenden gleichfarbigen platzen mit, Kettenreaktion über Farbgrenzen bei Mindestgröße 5. Blasen, die oben ankommen, kosten ein Leben.
Warum neu: Warten ist die Strategie. Je länger man wartet, desto größer die Traube, desto höher das Risiko. Push your luck in einem Puzzle.
Steuerung: Tap.
Octalysis: Unpredictability (welche Farbe kommt?), Loss (Blasen erreichen die Decke), Empowerment (Timing).
Preiskategorien: One More Go, Eye Candy (Blasen mit Highlights, Platz-Partikel).
Aufwand: M. Blasen mit einfacher Kollision (Kreise), Cluster-Suche (Flood Fill), Aufstieg.
Risiko: Kreise, die aneinander kleben, ohne Physik-Engine glaubwürdig zu stapeln, ist fummelig. Alternative: Grid-basiert, dann ist es näher an Bubble Shooter.

### 16. Spiegel
Pitch: Ein Laser sucht sich seinen Weg durch drehbare Spiegel, und du drehst immer nur einen, um ihn auf das nächste Ziel zu lenken.
Core Loop: Ein Laser läuft kontinuierlich. Spiegel stehen im Raster. Tap auf einen Spiegel dreht ihn um 45 Grad. Der Laser folgt sofort dem neuen Weg. Kristalle im Raster geben Punkte, wenn der Strahl sie trifft, und verschwinden. Neue Kristalle erscheinen. Trifft der Strahl den Rand, wo kein Spiegel ist, ist er weg.
Warum neu: Der Laser wartet nicht. Es ist ein Echtzeit-Puzzle mit einem einzigen Strahl, den man nie anhalten kann.
Steuerung: Tap auf Spiegel.
Octalysis: Empowerment (Wege planen), Loss (Strahl verlässt das Feld), Accomplishment.
Preiskategorien: Eye Candy (Laser mit Glow auf Schwarz ist Canvas-Kernkompetenz), Most Creative.
Aufwand: M. Raster, Ray-Marching durch Zellen, Spiegel-Logik.
Risiko: Laser-Pfad in Echtzeit ohne Verzögerung könnte hektisch statt strategisch sein. Balance zwischen Tempo und Denken.

### 17. Wabe
Pitch: Ein Sechseck-Feld mit Zahlen, und dein einziger Zug ist, das ganze Feld um 60 Grad zu drehen, dann fällt alles und gleiche Zahlen verschmelzen.
Core Loop: Tap dreht das Hex-Board um 60 Grad. Alle Steine fallen in die neue Richtung. Gleiche Werte, die sich berühren, verschmelzen zur nächsten Stufe. Jeder Zug spawnt einen neuen Stein. Voll ist Game Over.
Warum neu: 2048 hat vier Richtungen per Swipe. Hier gibt es sechs Richtungen, aber nur einen Tap. Man plant zwei Drehungen voraus.
Steuerung: Tap (dreht immer im Uhrzeigersinn).
Octalysis: Accomplishment (höchste Stufe), Empowerment (Ketten-Merges planen), Loss (Board voll).
Preiskategorien: Most Creative, One More Go.
Aufwand: M. Hex-Koordinaten, Gravitation in 6 Richtungen, Merge-Logik, Animation der Drehung.
Risiko: Hex-Mathematik hat viele Edge Cases. Ein Merge-Bug (doppeltes Verschmelzen) ist klassisch und wird von der Jury sofort bemerkt.

### 18. Konstellation
Pitch: Jeden Tag ein neuer Sternenhimmel, und du verbindest die Sterne so, dass die versteckte Figur entsteht, mit so wenig Linien wie möglich.
Core Loop: Sterne am Himmel. Tap auf einen Stern startet eine Linie, Tap auf den nächsten verbindet. Die Figur (Tier, Symbol) ist versteckt. Richtige Verbindungen leuchten auf. Falsche kosten einen Versuch.
Warum neu: Es ist ein Daily-Puzzle, das man sieht statt liest. Share als Emoji-Sternbild.
Steuerung: Tap.
Octalysis: Unpredictability (was ist die Figur?), Social (tägliches Share), Accomplishment (Streak).
Preiskategorien: Most Creative, Eye Candy.
Aufwand: M. Puzzle-Datensatz (30 Figuren als Punktlisten), Seed, Share-Text.
Risiko: Reines Daily-Game. Die Jury spielt es einmal und ist fertig. "One More Go" ist ausgeschlossen, "Best Game" schwer. Braucht zwingend einen Endless-Modus.

---

## Wort- und Zahlenspiele

### 19. Buchstabenregen
Pitch: Ein Wort steht oben, und die Buchstaben regnen durcheinander herunter, du fängst sie in der richtigen Reihenfolge.
Core Loop: Ein Zielwort (5 bis 8 Buchstaben) wird gezeigt. Buchstaben fallen an zufälligen Positionen, darunter Falsche. Tap auf den nächsten richtigen Buchstaben fängt ihn. Falscher Tap kostet Zeit. Wort komplett gibt Punkte und das nächste, längere Wort.
Warum neu: Kein Wörterbuch, keine Eingabe, kein Raten. Es ist ein Reaktionsspiel mit Wörtern statt ein Wortspiel mit Reaktion.
Steuerung: Tap.
Octalysis: Accomplishment (Wörter pro Minute), Loss (Zeit läuft), Scarcity (der richtige Buchstabe fällt gleich aus dem Bild).
Preiskategorien: One More Go.
Aufwand: S. Wortliste (500 Wörter, curated, deutsch oder englisch), fallende Objekte.
Risiko: Sprache. Deutsch schließt Jacks englischsprachige Jury aus, englisch ist für uns schwerer zu kuratieren. Und: Wortspiele sind eine überfüllte Kategorie.

### 20. Zielsumme
Pitch: Zahlen treiben über den Bildschirm, und du sammelst sie ein, bis du exakt die Zielsumme triffst, ein Punkt zu viel und alles ist weg.
Core Loop: Ziel: 21 (später variabel). Zahlen 1 bis 9 treiben langsam. Tap sammelt eine ein, Summe steigt. Exakt getroffen: Punkte mal Anzahl der Zahlen. Drüber: Summe auf null, Combo weg. Man darf jederzeit "kassieren" (Tap auf die Summe), bekommt dann aber nur die Summe, nicht den Multiplikator.
Warum neu: Blackjack ohne Karten, mit Bewegung und mit der Wahl zwischen Sicherheit und Multiplikator.
Steuerung: Tap.
Octalysis: Unpredictability (welche Zahl treibt als Nächstes vorbei?), Loss (Overshoot), Empowerment (kassieren oder weiter?).
Preiskategorien: One More Go.
Aufwand: S. Sehr wenig Logik.
Risiko: Wirkt wie ein Rechen-Lernspiel. Braucht einen starken visuellen Stil, sonst ist es "Edutainment".

### 21. Primzahl
Pitch: Zahlen fallen, und du spaltest sie, aber nur zusammengesetzte Zahlen lassen sich teilen, Primzahlen sind unzerstörbar.
Core Loop: Zahlen fallen. Tap auf eine zusammengesetzte Zahl spaltet sie in zwei Faktoren, die weiterfallen. Primzahlen unten im Auffangbecken geben Punkte. Zusammengesetzte Zahlen, die unten ankommen, kosten ein Leben. Große Zahlen ergeben Kaskaden: 60 wird 6 und 10, 6 wird 2 und 3, 10 wird 2 und 5.
Warum neu: Primfaktorzerlegung als Arcade-Mechanik. Die Kaskade ist die Kettenreaktion. Und man lernt nebenbei, ohne dass es sich wie Lernen anfühlt.
Steuerung: Tap.
Octalysis: Empowerment (Kaskaden auslösen), Accomplishment (Zahlengefühl wächst), Loss.
Preiskategorien: Most Creative, One More Go.
Aufwand: S. Faktorisierung ist trivial, Rest ist ein Fall-Spiel.
Risiko: Wer bei 91 nicht sofort 7 mal 13 sieht, fühlt sich dumm. Die Jury aus einem KI-Kurs könnte das mögen oder hassen. Polarisierend.

---

## Roguelite und Push-your-Luck

### 22. Dungeon Deal
Pitch: Ein Kartenstapel ist der Dungeon, du deckst Karte für Karte auf, und jederzeit kannst du mit dem Schatz rausgehen, oder weiter, oder sterben.
Core Loop: Tap deckt die nächste Karte auf: Gold, Monster, Trank, Falle. Monster ziehen Leben ab, Gold sammelt sich, Tränke heilen. Tap auf "Raus" sichert das Gold. Stirbst du, ist alles weg. Nach jedem erfolgreichen Ausstieg wird der Stapel gefährlicher, aber reicher.
Warum neu: Roguelite auf eine Entscheidung reduziert: weiter oder raus. Kein Inventar, keine Map. Der ganze Dungeon passt auf einen Daumen.
Steuerung: Tap auf Stapel oder auf "Raus".
Octalysis: Unpredictability (jede Karte), Loss (alles verlieren), Scarcity (nur noch 2 Leben), Ownership (gesichertes Gold über Runs, kauft Perks).
Preiskategorien: One More Go (Push-your-Luck ist das stärkste One-More-Go-Muster überhaupt), Best Game.
Aufwand: S bis M. Karten, Stapel, ein Meta-Fortschritt mit 5 Perks.
Risiko: Reine Glückssache, wenn die Kartenverteilung nicht sichtbar ist. Lösung: Zeige, wie viele Monster noch im Stapel sind. Dann wird es Rechnen statt Raten.

### 23. Aufzug
Pitch: Ein Aufzug fährt nach oben, jedes Stockwerk hat eine Tür, und du entscheidest per Tap, ob du sie öffnest oder weiterfährst, mit dem, was du bis jetzt hast.
Core Loop: Aufzug fährt stetig. An jeder Etage öffnet sich ein Fenster für 1,5 Sekunden mit einem Symbol: Schatz, Falle, Upgrade, Boss. Tap öffnet die Tür. Kein Tap: weiter. Upgrades verändern, was hinter Türen ist (Röntgenblick: nächste 3 Etagen sichtbar). Ziel: Etage, so hoch wie möglich, mit Leben.
Warum neu: Roguelite als Reaktions-Spiel. Die Entscheidung hat ein Zeitfenster.
Steuerung: Tap.
Octalysis: Unpredictability, Scarcity (das Fenster schließt sich), Empowerment (Upgrades verändern die Info-Lage).
Preiskategorien: One More Go, Most Creative.
Aufwand: M. Symbole, Upgrades mit Wechselwirkung (8 bis 10 Stück).
Risiko: Upgrade-Wechselwirkungen sind eine Edge-Case-Quelle. Muss bei 8 Upgrades gedeckelt werden.

### 24. Kreisel
Pitch: Dein Kreisel dreht sich immer langsamer, und jeder Tap gibt ihm Schwung, aber zu viel Schwung wirft ihn aus der Bahn.
Core Loop: Ein Kreisel auf einer Platte. Drehzahl sinkt. Tap gibt Schwung, aber der Kreisel wandert dabei ein Stück in Richtung Rand. Punkte pro Sekunde, multipliziert mit der Drehzahl. Fällt er vom Rand oder bleibt er stehen, Ende. Auf der Platte tauchen Münzen auf, die man durch gezieltes Antippen erreichen kann.
Warum neu: Ein Idle-Balance-Spiel: nichts tun ist die halbe Strategie. Der Rhythmus des Antippens ist der Skill.
Steuerung: Tap (Position des Taps bestimmt die Stoßrichtung).
Octalysis: Loss (der Kreisel taumelt sichtbar), Accomplishment (Zeitrekord), Empowerment (Rhythmus finden).
Preiskategorien: Eye Candy (ein einziger, wunderschön gerenderter Kreisel mit Motion Blur), One More Go.
Aufwand: S. Ein Objekt, zwei Werte, eine Platte.
Risiko: Ein Objekt, zwei Werte: es könnte nach 5 Minuten alles gesehen sein. Braucht Münzen, Platten-Variation, vielleicht Wind.

---

## Idle und Ownership

### 25. Kristall
Pitch: Du züchtest einen Kristall, der in 90 Sekunden wächst, und nur wo du klopfst, verzweigt er, am Ende wird er bewertet und bleibt in deiner Galerie.
Core Loop: Ein Kristall wächst fraktal aus der Mitte. Tap auf eine Spitze lässt sie verzweigen. Zu viele Verzweigungen: der Kristall wird trüb. Zu wenige: er bleibt klein. Nach 90 Sekunden Bewertung: Größe, Symmetrie, Klarheit. Der Kristall wird in der Galerie (localStorage) gespeichert.
Warum neu: Es gibt kein Verlieren. Es gibt nur schön oder weniger schön. Das Ergebnis ist ein Bild, das man behalten will.
Steuerung: Tap.
Octalysis: Ownership (Galerie), Empowerment (jeder Kristall anders), Accomplishment (Bewertung).
Preiskategorien: Eye Candy, Most Creative.
Aufwand: M. Fraktales Wachstum, Symmetrie-Messung, Galerie mit Thumbnails.
Risiko: Kein Loss, kein Black Hat. "One More Go" ist schwach. Für "Best Game" muss die Jury es spielen wollen, nicht nur anschauen.

### 26. Regentropfen
Pitch: Tropfen laufen an einer Fensterscheibe herunter, und du kippst das Fenster, damit sie sich zu einem großen Tropfen vereinen, bevor sie unten ankommen.
Core Loop: Hold links oder rechts kippt die Scheibe. Tropfen laufen entsprechend schräg. Berühren sich zwei, verschmelzen sie und werden schneller. Ein großer Tropfen unten gibt Punkte nach Größe. Viele kleine Tropfen unten geben nichts und trüben die Scheibe, bis man nichts mehr sieht.
Warum neu: Suika, aber die Objekte bewegen sich, und du bewegst die Welt statt des Objekts.
Steuerung: Hold links oder rechts (zwei Zonen).
Octalysis: Empowerment (Verschmelzungen planen), Loss (Scheibe trübt sichtbar), Unpredictability (Tropfen spawnen zufällig).
Preiskategorien: Eye Candy (Tropfen mit Refraktion auf einem verschwommenen Hintergrundbild), Most Creative.
Aufwand: M. Tropfen-Bewegung mit Zittern, Merge, Trübung als Overlay.
Risiko: Tropfen glaubwürdig zu rendern (Refraktion) ist auf Canvas 2D aufwendig. Ohne den Look ist es nur "Kreise laufen runter".

---

## Zeit und Wahrnehmung

### 27. Zeitfinger
Pitch: Die Welt bewegt sich nur, solange dein Finger auf dem Bildschirm liegt, und du musst durch ein Hindernisfeld, das nur läuft, wenn du läufst.
Core Loop: Du läufst automatisch nach oben, aber nur bei Hold. Hindernisse bewegen sich ebenfalls nur bei Hold. Release friert alles ein. Du planst im Stillstand, führst in Bewegung aus. Punkte pro Distanz, Bonus für lange ununterbrochene Holds.
Warum neu: Superhot als Ein-Finger-Spiel. Der Bonus für lange Holds zwingt zum Risiko: wer ständig pausiert, ist sicher, aber arm.
Steuerung: Hold.
Octalysis: Empowerment (Planung), Loss (Bonus bricht), Accomplishment.
Preiskategorien: Most Creative, One More Go.
Aufwand: S. Ein globaler Zeitfaktor, der 0 oder 1 ist. Der Rest ist ein Runner.
Risiko: Wenn der Bonus nicht stark genug ist, pausiert jeder immer, und das Spiel ist trivial. Wenn er zu stark ist, ignoriert jeder das Pausieren. Enge Balance.

### 28. Schatten
Pitch: Eine Lampe wandert, und du bist nur sicher im Schatten der Säulen, also springst du von Schatten zu Schatten, bevor das Licht dich erwischt.
Core Loop: Eine Lichtquelle bewegt sich auf einer Bahn. Säulen werfen Schatten, die mitwandern. Du stehst im Schatten. Tap springt zum nächsten Schatten in Blickrichtung. Steht man im Licht, brennt ein Timer runter. Punkte pro Sekunde im Schatten, Bonus pro Sprung.
Warum neu: Die sichere Zone bewegt sich mit der Lichtquelle, nicht mit dir. Man liest die Geometrie, nicht die Gegner.
Steuerung: Tap.
Octalysis: Loss (Timer im Licht), Empowerment (Lichtbahn vorhersagen), Unpredictability (Lampe ändert Bahn).
Preiskategorien: Eye Candy (2D-Schattenwurf mit weichem Rand ist beeindruckend), Most Creative.
Aufwand: M. Schattenprojektion (Polygone), Sprunglogik, Lichtbahn.
Risiko: Schatten-Geometrie hat Edge Cases (überlappende Schatten, Säule verdeckt Säule). Nicht viele, aber sichtbare.

### 29. Orbit
Pitch: Planeten kreisen um eine Sonne, du wirfst neue hinein, und gleiche Planeten verschmelzen, bis die Bahn zu voll wird.
Core Loop: Eine Sonne in der Mitte, Planeten kreisen auf Bahnen. Tap wirft den nächsten Planeten (kleinste Stufe) in die Bahn, wo der Tap war. Gleiche Planeten, die kollidieren, verschmelzen zur nächsten Stufe. Zu viele Planeten: Kollisionen, Trümmer, Game Over. Große Planeten haben mehr Gravitation und ziehen kleine an.
Warum neu: Suika im Kreis, ohne Boden. Die Gravitation zwischen Planeten ist die Physik-Quelle, nicht das Fallen.
Steuerung: Tap.
Octalysis: Unpredictability (Bahnen verschieben sich), Empowerment (Merge-Ketten), Loss (Trümmerfeld).
Preiskategorien: Eye Candy (Planeten mit Ringen, Sonne mit Corona, Bahnspuren), Best Game.
Aufwand: M. Kreisbewegung mit Störung, Kollision, Merge.
Risiko: Zu nah an Suika. Die Jury kennt das Merge-Muster. Der Kreis-Twist muss visuell sofort tragen.

### 30. Puls
Pitch: Ein Ring pulsiert in der Mitte, Ziele erscheinen am Rand, und du tippst genau dann, wenn der Ring ihre Größe hat.
Core Loop: Ein Ring wächst und schrumpft rhythmisch. Ziele erscheinen als Kreise verschiedener Größe. Tap, wenn der Ring gerade den Zielradius hat, trifft. Je exakter, desto mehr Punkte. Mehrere Ziele gleichzeitig: mehrere Fenster. Verpasste Ziele verschwinden nach 3 Pulsen.
Warum neu: Ein Rhythmus-Spiel ohne Musik-Track, in dem das Ziel die Größe des Fensters definiert, nicht die Zeit. Kleine Ziele sind schwer, weil der Ring dort schnell ist.
Steuerung: Tap.
Octalysis: Accomplishment (Präzision wird messbar), Loss (Ziele verschwinden), Unpredictability.
Preiskategorien: Eye Candy (konzentrische Ringe mit Glow, Trefferexplosion), One More Go.
Aufwand: S. Ein Ring, Kreise, Radius-Vergleich.
Risiko: Sehr abstrakt. Ohne Thema könnte es kalt wirken. Braucht eine Metapher (Tropfen im Wasser, Radar, Herz).

---

## Nachtrag: Jack als Spielfigur

Recherche-Basis: Jacks Kanal ([@Itssssss_Jack](https://www.youtube.com/@Itssssss_Jack), Videoindex auf [chooseto.ai](https://chooseto.ai/creator/Itssssss_Jack)). Wiederkehrende Titel: "Claude Fable 5.1 = Beautiful Designs (No AI Slop)", "Claude Just Solved Motion Design (Destroy AI Slop)", "Insane Claude Design Skills You Need for $10,000 Websites", "Claude FINALLY Just Dropped /Design". Seine Marke: AI kann schön sein, wenn jemand mit Geschmack sie führt. Slop ist der Feind, nicht AI. Das Spiel muss genau diese Haltung transportieren, sonst wirkt es wie eine Parodie auf ihn statt wie eine Hommage.

### 31. No Slop (Arbeitstitel)
Pitch: Jack sitzt vor dem Feed, AI-generierte UI-Bausteine rauschen an ihm vorbei, und er hat eine Sekunde, um den Slop rauszuwerfen, bevor er in seiner 10.000-Dollar-Website landet.
Core Loop: UI-Komponenten (Buttons, Cards, Hero-Sections, Icons, Headlines) fallen in einer Spalte herunter. Die meisten sind sauber. Manche sind Slop: Comic Sans, lila AI-Verlauf, drei Fonts in einer Card, "Lorem ipsum" vergessen, "Certainly! Here's your..." als Headline, sechsfingriges Icon, Emoji-Spam, schief ausgerichteter Text. Tap auf eine Komponente wirft sie raus (Jack wischt sie mit einer Geste weg, die Komponente zerfällt in Pixel). Kein Tap: sie wird eingebaut. Unten wächst die Website aus den eingebauten Teilen. Jeder eingebaute Slop verunstaltet sie sichtbar: der Verlauf kriecht rein, die Font kippt. Slop-Meter voll: Game Over, die Website ist "Slop". Mit der Zeit wird es schneller und der Slop subtiler: erst Comic Sans, später ein falscher Eckenradius oder eine Farbe, die nicht im System ist.
Warum neu: Es ist ein Sortierspiel, in dem das Sortierkriterium Geschmack ist. Man wird beim Spielen messbar besser darin, schlechtes Design zu erkennen. Und der Juror ist der Held. Niemand in der Competition wird das erwarten, und jeder in der Community versteht den Witz in einer Sekunde.
Steuerung: Tap auf die Komponente, die weg soll. Nichts tun ist die richtige Aktion für gutes Design. Das ist thematisch stimmig: gutes Design braucht keinen Eingriff.
Octalysis: Epic Meaning (für diese Community ungewöhnlich stark: "Design retten" ist Jacks Mission und die des Kurses), Accomplishment (Design-Auge wird sichtbar besser, Level "Junior", "Senior", "Jack"), Loss (die eigene Website verkommt sichtbar, jeder eingebaute Slop bleibt), Social Influence (In-Joke, Share-Screenshot der gebauten Website mit "Slop-Score"), Unpredictability (welche Komponente kommt, wie subtil ist der Fehler).
Preiskategorien: Most Creative (die Idee, die niemand erwartet, plus Jury-Bias, weil sie sich selbst sieht), Best Game (die Jury spielt weiter, weil sie beweisen will, dass sie Slop erkennt). Eye Candy nur, wenn die "guten" Komponenten wirklich gut sind. Das ist die Bedingung und das Risiko.
Aufwand: M. Ein Komponenten-Generator (8 Templates), ein Regelsatz "Design System" (Fonts, Farben, Radius, Spacing), ein Slop-Generator, der gezielt eine Regel verletzt (ca. 15 Verletzungstypen in drei Schwierigkeitsstufen), die wachsende Website als Canvas-Zusammensetzung, Jack als Vektor-Avatar mit 3 bis 4 Posen (neutral, wischen, zufrieden, entsetzt).
Risiko: Das Spiel muss selbst makellos designt sein, sonst richtet sich der Witz gegen uns. Ein einziges schlecht gesetztes Element im UI, und die Jury lacht in die falsche Richtung.

#### Warum das mehr ist als eine Skin

Jede Top-5-Idee ließe sich mit einem Jack-Avatar versehen. Das wäre Kosmetik: Jack als Blitzableiter-Setzer ergibt keinen Sinn. Hier ist die Mechanik die Botschaft. Der Kern des Spiels ist die Fähigkeit, die Jack in jedem Video predigt. Deshalb trägt es.

#### Wie die Slop-Erkennung fair bleibt

Das Spiel generiert Komponenten aus einem festen Design System: eine Font, sechs Farben, ein Eckenradius, ein Spacing-Raster. Slop ist eine gezielte Verletzung dieser Regeln. Drei Stufen:

| Stufe | Verletzung | Erkennbar in |
|---|---|---|
| 1 (Sekunden 0 bis 40) | Falsche Font (Comic Sans, Papyrus), lila AI-Verlauf, Emoji-Spam, "Lorem ipsum", "Certainly! Here's...", KI-Blob-Icon | unter 0,3 s, jeder sieht es |
| 2 (Sekunden 40 bis 100) | Zwei Fonts gemischt, Text nicht ausgerichtet, Button ohne Kontrast, doppelter Call-to-Action, Icon in falscher Größe | 0,5 s, braucht einen Blick |
| 3 (ab Sekunde 100) | Falscher Eckenradius, Farbe leicht außerhalb der Palette, Spacing um 4 px daneben, Schriftgewicht falsch | 1 s, braucht ein Auge |

Wichtig: Der Slop wird nie zufällig subtil, sondern kontrolliert. Jede Verletzung ist auf einem 390-px-Screen sichtbar, das wird pro Verletzungstyp auf dem Gerät geprüft. Wer bei Stufe 3 scheitert, sieht im Game-Over-Screen, was der Fehler war ("Radius 12 statt 8"). Das ist der Lern-Moment und der Near Miss zugleich.

#### Was am Ende steht

Die gebaute Website wird als Bild gerendert: "Deine Website. Slop-Score 3 %. Level: Senior Designer." Das ist der Share-Screenshot für Skool. Mit Daily-Seed: alle bauen heute dieselbe Website aus demselben Feed, Vergleich im Kommentar-Thread.

#### Jack als Figur

Vektor-Avatar, keine Fotos. Stilisiert, mit den zwei bis drei Merkmalen, die ihn erkennbar machen (Frisur, Brille, Kleidung, muss geklärt werden, siehe unten). Vier Posen reichen: neutral, Wisch-Geste, zufriedenes Nicken bei Combo, Entsetzen bei eingebautem Slop. Reaktionen als Sprechblase mit seinen Titel-Phrasen: "No AI Slop", "Just watch", "Beautiful". Sparsam, sonst nervt es.

**Zu klären, bevor wir bauen:** Jacks Aussehen konnte ich nicht recherchieren, YouTube blockt den Zugriff. Und: Es ist sein Wettbewerb, sein Name, sein Gesicht. Die Hommage funktioniert nur, wenn sie liebevoll ist. Einschätzung: Bei einer Community-Competition ist das üblich und wird als Kompliment gelesen. Trotzdem würde ich im Skool-Post explizit schreiben, dass es eine Hommage ist, und ihm die Möglichkeit geben, es rauszunehmen.

---

## Beobachtungen nach dem Brainstorming

**Was auffällt (Einschätzung):**
- Die stärksten Ideen für "Most Creative" sind die, die eine Wahrnehmung umdrehen: Sonar (Sehen kostet), Echo (Gegner bist du), Zeitfinger (Zeit gehört dir), Schatten (Sicherheit wandert).
- Die stärksten für "Eye Candy" haben Licht auf Schwarz als Kern: Blitzableiter, Sonar, Leuchtturm, Spiegel, Feuerwerk. Canvas 2D mit `shadowBlur` und additivem Blending macht genau das gut.
- Die stärksten für "One More Go" haben eine Push-your-Luck-Entscheidung: Dungeon Deal, Blasen, Zielsumme, Aufzug.
- Ideen, die alle drei verbinden, sind selten. Sonar und Blitzableiter kommen am nächsten.
- Vier Ideen brauchen eine Physik-Engine oder aufwendiges Rendering (Umkehr, Regentropfen, Blasen, Dirigent). Die würde ich streichen, egal wie gut die Idee ist.
- Ein Daily-Puzzle (Konstellation) als Kern ist für diese Jury ein Fehler. Daily gehört als Zusatz in jede Idee, die es verträgt.
