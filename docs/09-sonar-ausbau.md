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
