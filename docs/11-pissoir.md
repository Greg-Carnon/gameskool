# Pissoir: Prototyp

Stand: 19. September 2026. Gregs Wunsch: ein Spiel wie "The Urinal Code" (Sly Studios, itch.io), aber deutlich besser: Animationen, mehr Level, Meilensteine, Power-ups. Kern: immer das richtige Pissoir wählen, damit es nicht komisch wirkt.

Live: https://gameskool.vercel.app/pissoir/

## Der Kern: ein Peinlichkeits-Wert pro Platz

`src/pissoir/rules.ts`, Funktion `judge`. Jeder freie Platz bekommt Punkte, weniger ist besser:

| Regel | Punkte |
|---|---|
| Direkt neben einem normalen Typen | +10 |
| Ein Platz Abstand zu ihm | +3 |
| Neben dem Quatscher / Spritzer / Chef / Kind / Handy-Typ | +18 / +16 / +20 / +18 / +13 |
| Neben dem Freund im grünen Shirt | −6 (er will das) |
| Randplatz | −2 |
| Nasser Boden | +6 |
| Defekt oder besetzt | unmöglich |

Richtig sind alle Plätze mit dem Minimalwert (der Generator lässt höchstens zwei zu). Ab Level 5 gibt es den Warten-Knopf: Richtig, wenn der beste Platz 12 oder mehr Punkte hat, sonst falsch ("Nothing wrong with that spot, mate").

## Druck statt Timer

Eine Blasenanzeige läuft pro Runde ab (7 s in Level 1, 4,2 s in Rush Hour, danach bis 2,6 s). Leer heißt Strike. Drei Strikes, Spiel vorbei. Punkte: 10 mal Multiplikator (steigt alle drei Treffer) plus Restblase.

## Acht Levels, die die Regeln einzeln einführen

Basics (Abstand), Two Guys, Out of Order (defekt, nass), The Talker, Wait For It (Warten-Knopf), The Friend (Ausnahme), The Boss (Chef, Kind, Handy), Rush Hour (alles, 7 Pissoirs, 3 bis 4 Leute). Danach Rush Hour endlos, immer schneller.

## Perks, Meilensteine

Vor jedem Level ab dem zweiten: zwei Perks zur Wahl, einer wird genommen, per Tap im HUD einsetzbar. Bladder of steel (doppelte Zeit für das Level), Fake phone call (Runde überspringen), Nobody saw that (Strike weg). Meilensteine bei 5, 10, 20, 35, 50, 75, 100 Runden.

## Was zu sehen ist

Gekachelter Waschraum mit flackernder Neonröhre, Tür links, Pissoirs aus Verläufen, Figuren aus Primitiven (Hemd, Krawatte beim Chef, Handy, "BRO"-Shirt beim Freund, Cap und Schnurrbart beim Spieler, weil es Jack ist). Spieler läuft mit Schrittgeräusch zum Platz. Richtig: grüner Rahmen, "SMOOTH"-Stempel, Freund winkt. Falsch: Umstehende drehen den Kopf, Spieler wird rot, Sprechblase mit Charakterspruch, "AWKWARD"-Stempel, Shake.

## Offen nach Gregs Test

Fühlt sich der Wert fair an, oder sind einzelne Regeln unklar? Ist die Blase in Level 1 zu langsam? Braucht Rush Hour mehr Varianz (Spiegel, Waschbecken, Leute kommen nach)? Ideen, die ich zurückgehalten habe: Blickkontakt über den Spiegel, jemand kommt nach dir rein und stellt sich falsch, Handtrockner-Timing als Bonusrunde.

## Runde zwei, 19. September

Gregs Feedback: Sounds katastrophal, keine Arme, eigene Figur komisch und nicht Jack, Räume pro Level unterschiedlich, Gesichter der anderen wirken umgedreht.

- **Blickrichtung:** Alle am Pissoir stehen jetzt mit dem Rücken zu uns (Hinterkopf, Ohren, Rückenfalte). Bei einer Reaktion drehen sie nur den Kopf ins Profil zum Spieler: ein Auge, Nase, hochgezogene Braue, Mund je nach Charakter. Der Spieler steht an der Tür und beim Laufen von vorn, am Pissoir von hinten.
- **Arme:** Ärmel in dunklerem Hemdton neben dem Rumpf, Ellbogen als Hautpunkt. Von vorn hängen die Arme mit Händen und schwingen beim Gehen. Winken und Handy bleiben.
- **Spieler:** generischer Typ, braune Haare, blaues Hemd mit hellem Streifen. Kein Jack.
- **Räume** (`src/pissoir/themes.ts`), pro Level: Office (Waschbecken), Pub (Quiz-Poster, warmes Licht), Gas station (Graffiti "WASH YOUR HANDS"), Club (dunkel, pinkes Neon, Flackern), Stadium (Snackautomat), Airport (Pflanze), School (Kreidetafel mit der Regel), Festival (Dixi-Plane statt Kacheln). Kachelgröße, Fugen, Boden, Tür, Licht und Pissoir-Tint pro Thema. Der Level-Screen nennt den Ort.
- **Sounds:** alle neu und leiser. Schritte als weiches Rauschen, richtig als Dreieck-Glöckchen mit Sprung nach oben, falsch als dumpfes Wah mit Vibrato statt Sägezahn, Level als kleiner Zweiklang, Spülung als abfallendes Rauschen über eine Sekunde. **Nicht per Ohr geprüft, Playwright hat keinen Lautsprecher.** Wenn etwas noch stört, bitte den konkreten Sound nennen.

## Runde drei, 19. September: echte Sounds, Lösbarkeit

**Sounds aus Gregs Library** ("FOUR Editors Sound Effects", 1813 Dateien, lokal unter `Development/buckets/beyond100/Soundeffects`). Lizenz erlaubt Nutzung und Veränderung im eigenen Werk und Veröffentlichung in allen Medien, verbietet Weitergabe der Rohdateien als Sammlung. Deshalb: Clips gekürzt, normalisiert (loudnorm −16 LUFS, Effekte) und als Mono-MP3 80 kbit/s nach `public/audio/pissoir/` konvertiert. Der Ordner ist in `.gitignore`, liegt also nicht im öffentlichen Repo, wird aber per `.vercelignore`-Ausnahme mit deployt. Wer das Repo klont, hat das Spiel ohne Sounds, es läuft trotzdem (Sample-Player fängt 404 ab).

| Rolle | Quelle | Schnitt |
|---|---|---|
| Schritt | Fantasy Step | 0,45 s |
| Reißverschluss beim Ankommen | Short foley Zipper | 0,9 s |
| Spülung | Flushing Sink | 1,2 s |
| Richtig | Bells Impact | 1,4 s |
| Falsch | Jolt Error und Mystery Error im Wechsel | 0,7 und 1,2 s |
| Level geschafft | Ambient Notice | 2,2 s |
| Game Over | Error Bang | 2,4 s |
| Perk | Tones Up Quick | 0,67 s |
| Blase fast leer | Tension Builders Clock Short | 0,35 s |
| Tür beim Rundenstart | Opening Door | 1,1 s |
| Streak alle 5 | Crowd Applause | 2,2 s |
| Meilenstein | Mystery Bells | 1,6 s |
| Raum-Ambience pro Thema, 10-s-Loop, leise (−24 LUFS) | At Work Background, Crowd Cafe, Machine Noise Soft, Ambience Pulsory, Crowd Match, Wide Open Space, People Indoor, Crowd Cheering | |

Auswahl nach Namen, Dauer und Pegel, nicht per Ohr. Wenn ein Clip nicht passt, austauschen ist eine Zeile im Konvertierungsskript (steht im Chat-Verlauf, kann in `scripts/` wandern).

**Lösbarkeit.** Gregs Eindruck stimmte: Vorher galt nur der Platz mit dem exakt niedrigsten Wert. Ein Platz mit einem Pissoir Abstand, aber ohne Randbonus, war "falsch", obwohl er sich richtig anfühlt. Und in Level 2 konnte der beste Platz direkt neben jemandem liegen. Jetzt:
- Warten-Schwelle 8 statt 12: neben irgendjemandem stehen (10, am Rand 8) ist nie richtig. Regel in einem Satz: Nie neben jemanden, außer neben deinen Kumpel. Wenn es nicht anders geht, warten.
- Toleranz 5: alles, was höchstens 5 Punkte schlechter ist als der beste Platz, zählt. Ein Pissoir Abstand ohne Rand ist damit richtig.
- Generator garantiert: ohne Warten-Knopf gibt es immer mindestens einen sauberen Platz, mit Warten-Knopf entweder einen sauberen Platz oder Warten ist eindeutig. Test über 60 Runden pro Level.
- Nach einem Fehler blinken die richtigen Plätze grün mit "HERE". Das ist der Lern-Moment.

## Ausbaustufen, sortiert nach Wirkung

1. **Nachzügler.** Nach deiner Wahl kommt jemand rein und stellt sich falsch neben dich. Reaktion: du darfst einmal wechseln. Neues Verhalten, neue Blase, große Comedy.
2. **Blickkontakt im Spiegel.** Ein Spiegel über den Pissoirs, in dem der Quatscher dich sucht. Richtig: geradeaus starren (Tap auf das Pissoir, nicht auf den Spiegel).
3. **Handtrockner-Bonusrunde** nach jedem Level: Timing-Tap, wenn der Trockner-Balken im grünen Bereich ist. Perk-Währung.
4. **Charakter-Ausbau:** der Sänger (summt, alle drehen sich um), der Typ mit dem Hund, der Bauarbeiter mit Ausrüstung, der Ex-Kollege der dich erkennt, zwei Freunde die gemeinsam gehen (dann ist der Platz dazwischen tödlich).
5. **Kabinen-Ebene:** Ab Level 6 zusätzlich Kabinen rechts. Manchmal ist die Kabine die richtige Antwort (alle Pissoirs schlecht, aber du willst nicht warten). Dritter Knopf, bricht die Ein-Tap-Regel leicht.
6. **Story-Rahmen wie bei Sonar:** ein Tag im Leben, jedes Level ein Ort dieses Tages (Büro morgens, Kneipe abends, Festival am Wochenende), mit einem Satz Intro.
7. **Daily Run:** ein Seed pro Tag, gleiche Räume für alle, Share-Text mit Runden und "awkward moments".
8. **Achievements:** "Never next to the boss", "Waited 10 times", "Rush Hour survived", "Friend of the friend".
9. **Wochen-Highscore in Vercel KV**, wenn Backend erlaubt.

## Runde vier, 19. September: alle Ausbaustufen

1. **Nachzügler** (ab Level 3, 25 bis 45 Prozent der richtigen Runden): jemand kommt zur Tür rein und stellt sich neben dich. "MOVE?" Tap auf einen anderen Platz wechselt, Tap auf dich selbst bleibt. Wechseln ist richtig, wenn ein sauberer Platz existiert, sonst ist Bleiben richtig ("Hopping around is weirder than staying"). Logik in `solveMove`, getestet.
2. **Spiegel** (ab Level 4, 35 Prozent, nur wenn ein Quatscher oder Ex-Kollege da ist): Augen erscheinen im Spiegelstreifen und schauen zu dir, rote Sichtlinie, "HE'S LOOKING. DON'T TAP." Wer 1,8 s nicht in den oberen Bereich tippt, ist "ICE COLD". Tap oben ist Blickkontakt, Strike.
3. **Handtrockner** nach jedem Level: Zeiger pendelt, Tap in der grünen Zone gibt einen Dry-Hands-Token, der im nächsten Level-Screen einen zweiten Perk erlaubt. Gelb daneben +20 Punkte.
4. **Neue Charaktere**: Sänger (lila, Noten steigen auf), Hunde-Typ (Hund an der Leine neben ihm), Duo (zwei in Orange, immer nebeneinander, die Plätze daneben sind schlecht), Ex-Kollege ("Wait. Didn't you get fired?").
5. **Kabine** ab Level 6 rechts mit VACANT/IN USE-Schild und eigenem Knopf. Regel: Wenn alle Pissoirs schlecht sind, schlägt die freie Kabine das Warten. Ist sie besetzt, ist Warten richtig.
6. **Story**: jedes Level hat Uhrzeit, Ort und einen Satz ("07:40 · Office. Monday. Coffee number two hits early."). Acht Orte ergeben einen Tag vom Büro bis zum Stadion. Danach "Day 2" und so weiter.
7. **Daily Run**: eigener Knopf, Seed aus dem Datum, gleiche Räume für alle, beste Rundenzahl pro Tag gespeichert, Share-Text mit Runden, Level, "awkward moments" und Emoji-Zeile.
8. **12 Achievements** mit Toast beim Freischalten, Liste auf dem Startscreen.
9. **Wochen-Highscore**: `api/scores.ts` als Edge Function, Redis-Sorted-Set pro Kalenderwoche, Top 10, Name auf 14 Zeichen gefiltert. Der Client zeigt das Board nur, wenn die API antwortet. **Braucht einen Store:** im Vercel-Dashboard unter Storage einen Upstash-Redis (KV) anlegen und mit dem Projekt `gameskool` verbinden, dann sind `KV_REST_API_URL` und `KV_REST_API_TOKEN` gesetzt. Bis dahin antwortet die API 503 und das Board bleibt unsichtbar.

78 Tests. Live geprüft: Level 1 bis Nachzügler, Handtrockner, Kabinen-Level, Daily-Start.
