# Sonar: Ausbau zum Hauptspiel

Stand: 9. September 2026, spät. Greg hat Sonar als Favorit gewählt. Zeitfinger ist laut Greg kaputt und bleibt liegen.

Live: https://gameskool.vercel.app/sonar/ . Debug: `?level=4` startet direkt im Bosslevel.

## Struktur

**Levels als Tiefenzonen** (`src/sonar/levels.ts`). Pro Level Perlen sammeln, dann öffnet sich unten die Luke. Reinschwimmen, Abstiegs-Blende, nächstes Level mit Banner.

| # | Tiefe | Name | Neu | Perlen |
|---|---|---|---|---|
| 0 | 20 m | The Shallows | Pingen lernen, Minen | 4 |
| 1 | 45 m | Kelp Forest | Quallen, erster Tank | 5 |
| 2 | 80 m | The Wreck | Strömungen schieben das Boot | 6 |
| 3 | 120 m | The Trench | Echo-Fische schwimmen auf jeden Ping zu | 6 |
| 4 | 160 m | The Angler | Boss | 5 |
| 5+ | 200 m+ | The Abyss | Endlos, jede Runde härter, alle drei Runden kehrt der Angler zurück | 7 bis 9 |

**Boss "The Angler":** Köderlicht immer sichtbar, Körper nur per Ping. Jeder Ping macht ihn zum Jäger Richtung Ping-Ursprung, langsamer als das U-Boot (82 zu 95). Er kann nicht bekämpft werden, aber in Minen gelockt: drei Treffer, dann ist er unten. Die Luke öffnet erst nach dem Sieg. Zwei Sekunden Schonfrist am Levelstart.

**Ein-Finger-Steuerung bleibt:** Tap setzt Ziel und sendet Ping. Halten lädt einen großen Ping (Radius x1,6, doppelte Kosten), Ladering am Boot zeigt den Fortschritt.

**Meilensteine:** Tiefenrekord auf dem Startscreen, acht Achievements (erste Perle, Kelp, Wreck, Trench, Angler treffen, Angler besiegen, 15 Perlen in einem Tauchgang, Level mit maximal zwei Pings). Toast beim Freischalten.

**Meta:** Perlen aus jedem Tauchgang wandern in die Bank. Drei Upgrades mit je drei Stufen: Sonar-Reichweite, Lunge, Propeller. Kosten 8, 20, 40.

**Zusatz:** Sauerstofftanks, Sound-Toggle, Share-Text mit Perlen-Emojis, Todes-Reveal (beim Sterben wird alles sichtbar, damit man sieht, was einen erwischt hat).

## Verifikation

53 Tests (Levels, Ping und Sicht, großer Ping, Fisch-Jagd, Luke und Abstieg, Sauerstoff, Boss-Jagd und Minen-Tod, Luke im Bosslevel, Upgrades und Achievements). Playwright: Startscreen mit Shop, Bosslevel gestartet, großer Ping, Game Over mit Dive-Log, keine Konsolenfehler.

## Befund aus dem ersten Boss-Lauf

Der Angler hat das Boot in drei Sekunden erwischt, weil er schneller war als das U-Boot und direkt am Boot startete. Behoben: Jagdtempo 82 statt 125, Start ganz unten, zwei Sekunden Schonfrist.

## Was auf dem Handy zu prüfen ist

1. Fühlt sich das Locken in Minen als Taktik an, oder ist der Boss nur eine Bedrohung?
2. Sind die Strömungen im Wreck lesbar (bewegte Striche)?
3. Ist Level 1 in 30 bis 60 Sekunden schaffbar? Wenn nein, Perlen von 4 auf 3.
4. Halten für den großen Ping: entdeckt man das ohne Text?

## Runde zwei, 10. September

Level 1 braucht jetzt 3 Perlen (alle Levels um eine gesenkt). Dazu:

- **Umgebungen pro Level:** Lichtstrahlen (Shallows), schwankender Kelp, Schiffsrumpf mit Bullaugen (Wreck), Felswände und Biolumineszenz (Trench), Rippen und Schädel (Lair), Meeresboden überall. Rotes Pulsieren, wenn der Angler jagt.
- **Ambient-Drone** aus Web-Audio-Oszillatoren (`src/sonar/ambient.ts`): zwei verstimmte Sinustöne, atmender Tiefpass, Walrufe alle 14 bis 30 Sekunden, pulsierender Subbass im Bosslevel, Filter öffnet bei knapper Luft. Keine Audiodateien.
- **Perlen-Chain:** Perlen innerhalb von fünf Sekunden erhöhen einen Multiplikator, mehr Luft (+4 pro Stufe), Bonuspunkte, Balken über dem Boot.
- **Scheinwerfer:** Objekte im Radius 46 sind immer schwach sichtbar. Nimmt die Unfairness der blinden Mine. Cone am Boot.
- **Tiefenskala** links mit erreichten Zonen und der nächsten Tiefe, rollende Tiefenzahl beim Abstieg.
- **Onboarding ohne Text-Tutorial:** "Tap anywhere" bis zum ersten Ping, "Hold for a bigger ping" nach sechs Sekunden bis zum ersten großen Ping, "Pearls open the hatch" nach der ersten Perle. Nach drei Tauchgängen kommen keine Hinweise mehr.
- Luke sieht aus wie eine Luke, zeigt "N MORE" und "DESCEND". Echo-Blips beim Anpingen. Blasenspur. Hit-Stop bei Tod und Boss-Treffern. Boss-Intro mit großem Banner und Brüllen. Haptik auf Android. Dive-Log Top 5 auf dem Startscreen.

55 Tests. Skool-Text in `docs/10-skool-post.md`.

## Onboarding und Story, 10. September

Greg: zu viel Text, man versteht nicht, was zu tun ist. Umgebaut:

- **Story in drei Bildern** (`src/sonar/intro.ts`), nur beim ersten Start, per Tap weiter, später über "Story": Jack im Studio mit aufsteigenden Slop-Karten, Jack im Bullauge des großen U-Boots, die Tiefenkarte mit Perle und Angler. Je ein Satz. Jack ist wiederverwendet aus `jack-vs-slop/jack.ts`.
- **Tutorial durch Tun** (`src/sonar/tutorial.ts`): pulsierender Fingerpunkt "TAP", Pfeil "PEARL", Fingerpunkt mit Ladering "HOLD", Pfeil "GO DEEPER". Nur im ersten Tauchgang, dann `tutorialDone`. Im Tutorial hat Level 1 zwei Minen und 40 Prozent langsamere Luft.
- **Jack spricht** aus einer Blase unten links mit Mini-Gesicht, nur an Schlüsselstellen: erster Ping, erste Perle, großer Ping, Luke, Boss, Tod.
- **Jack im Bullauge** des Spiel-U-Boots: Cap, blonde Haare, Schnurrbart in 5 Pixeln Radius.
- **Startscreen reduziert:** Titel, "Jack vs the deep", ein Satz, DIVE. Upgrades und Story dahinter.

Playwright: kompletter Fluss von leerem localStorage bis zum Pfeil auf die erste Perle, keine Fehler. Jacks Zeile kommt nach 1,6 s: "Dark. Finally. Ping to see."

## Leben und Checkpoint, 14. September

Gregs Wunsch nach der Abgabe: zehn Leben, nicht jedes Mal bei Level 1 anfangen.

- **Zehn Leben pro Tauchgang.** Tod durch Mine, Qualle, Fisch, Boss oder Luft kostet ein Leben. Respawn am Levelanfang mit voller Luft, 2,2 Sekunden unverwundbar (Boot blinkt, Ring zeigt die Restzeit). Gesammelte Perlen des Levels bleiben, die Chain bricht. Der Boss wird zurückgesetzt. Banner "N LIVES LEFT" mit Ursache, Jack kommentiert bei 3 und 1.
- **Checkpoint.** Das tiefste erreichte Level wird gespeichert. "DIVE · 80 m" startet dort, "From the top" startet oben. `?level=N` überschreibt beides. Leben sind pro Tauchgang immer zehn.
- Tutorial läuft nur beim Start in Level 0 und solange es nicht abgeschlossen ist.

57 Tests, darunter: Luft-Tod kostet ein Leben und füllt auf, letztes Leben beendet den Tauchgang, Respawn ist unverwundbar und behält Perlen.

## Große Erweiterung, 14. September

Gregs Auftrag: mehr Powerups, geheime Missionen, mehr Bosse, Schießen, Meilensteine, Achievements. "Denke groß, bleib leicht verständlich."

**Schießen bleibt eine Eingabe.** Torpedos sind ein Pickup (Kiste, 3 Stück plus Upgrade-Stufe). Wer Munition hat, feuert beim Loslassen eines großen Pings automatisch einen Torpedo in Tap-Richtung. Torpedos sprengen Minen, töten Fische und Quallen, nehmen Bossen einen Punkt. Kein zweiter Knopf, keine Erklärung nötig: das Pickup-Label sagt "hold to fire".

**Fünf Pickups**, je 1 bis 3 pro Level, alle mit eigenem Icon und Farbe: Torpedos (orange), Fackel (4 s alles sichtbar, sofort), Magnet (Perlen im Radius 140 kommen 8 s lang), Schild (ein Treffer frei, sichtbarer Ring), Boost (8 s Tempo x1,6).

**Drei Bosse, ein Prinzip: Minen sind die Waffe.**
| Boss | Level | HP | Verhalten | So besiegt man ihn |
|---|---|---|---|---|
| Angler | 4 | 3 | jagt den letzten Ping | in Minen locken |
| Kraken | 7 | 4 | sitzt in der Mitte, acht rotierende Arme, schlägt nach 1 s dort zu, wo gepingt wurde | neben einer Mine pingen, dann weg |
| Leviathan | 10 | 5 | folgt dem Boot immer, schneller wenn es fährt, langer Körper ist tödlich | an Minen vorbeischwimmen |
Danach alle drei Levels ein Boss im Zyklus, HP steigt pro Runde. Torpedos sind die Abkürzung.

**Elf feste Levels** (Shallows bis Leviathan bei 400 m) mit zwei neuen Umgebungen: Black Smokers (Schlote, Rauch, Glut) und die Kraken-Höhle (violett).

**Vier geheime Missionen**, in der Liste als "?" bis gefunden, je +10 Perlen: Ghost (Level ohne Ping), Full tank (Luke mit voller Luft), Captain's pearl (im Wrack pingen, dann erscheint eine Goldperle, 5 wert), Whale watcher (8 s still im Kelp, ein Wal zieht vorbei).

**Meilensteine**: 45 bis 520 m, Perlen-Belohnung einmalig, Bootsfarbe wechselt (gelb, orange, rot, türkis, weiß).

**17 Achievements**, zwei neue Upgrades: Torpedo bay (Start-Munition), Reinforced hull (Schild zum Start, Stufe 2 jedes Level, Stufe 3 längere Unverwundbarkeit).

66 Tests, darunter alle drei Boss-Mechaniken, jedes Pickup, Torpedo gegen Mine und Boss, alle vier Geheimnisse, Meilensteine.

## Finale: Megalodon und Grotte, 14. September

- **Level 11, The Megalodon, 480 m, 6 HP.** Kreist am Rand auf einer Ellipse. Alle 3,2 s dreht er sich zum Boot, ein roter gestrichelter Strich zeigt die Bahn (1,15 s), dann rast er mit 420 px/s geradeaus, bis er den Rand verlässt. Minen auf der Bahn explodieren und verletzen ihn, das Boot auf der Bahn verliert ein Leben. Rückenflosse und Kielwasser sind immer schwach sichtbar, Maul offen beim Angriff.
- **Level 12, The Grotto, 520 m.** Keine Gegner, kein Luftverbrauch, keine Perlen nötig. Warme Höhle mit Felswänden, sechs saubere Website-Karten aus dem Jack-vs-Slop-Generator schweben mit Schein. Banner "THE GROTTO", Jack: "No slop. Not one prompt. Look at these." Nach 5,6 s der Finale-Screen mit Auflösung, Score und "Keep diving". Die Luke öffnet nach 6 s von selbst.
- Danach Endlos-Zyklus ab 560 m, alle drei Levels ein Boss, jetzt im Vierer-Zyklus Angler, Kraken, Leviathan, Megalodon.
- Zwei Achievements dazu: Megalodon slayer, The Grotto. 19 insgesamt.

68 Tests, darunter Megalodon-Angriff mit Mine auf der Bahn und Grotte ohne Luftverbrauch.
