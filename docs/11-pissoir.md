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
