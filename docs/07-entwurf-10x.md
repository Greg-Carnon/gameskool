# Entwurf 10x: von grau zu Charakter

Stand: 9. September 2026, nach Gregs Feedback ("sieht richtig Kacke aus") und Blick auf sein Hundespiel.

## Was das Hundespiel richtig macht, und was mir gefehlt hat

| Hunde-Rennen | Meine Prototypen |
|---|---|
| Echte Charaktere mit Namen, Macken, Todesnachrichten | Kreise und Rechtecke |
| Eine Welt: zehn bayerische Orte mit eigenen Props | Schwarzer Hintergrund |
| Warme Palette, Sonnenuntergang, Pastell-Karten mit harten Schatten | Grau auf Dunkelblau |
| Eigene Typografie: Caveat als Handschrift, Fredoka als Körper, Titel gedreht mit Schlagschatten | System-Font |
| Handgezeichnete Figuren aus Canvas-Primitiven, 30 Zeilen pro Hund, mit Animation | Nichts Lebendiges |
| Humor in jedem Text | Funktionale Texte |

Die Lehre: Die Mechanik war nie das Problem. Es fehlte Charakter, Welt und eine Palette mit Haltung.

## Jack vs Slop: die neue Richtung

**Palette aus Jacks Thumbnails:** Schwarz (#0a0b10), Weiß, gelber Marker (#ffd23f, seine Unterstreichung), Studio-Grün (#5cf2a0, seine LED-Wand), Rot (#ff5e5e) für Slop-Fehler, Lila-Pink-Verlauf ausschließlich für Slop.

**Typografie:** Archivo Black für Titel (wie seine Thumbnail-Headlines), Inter für UI und die Komponenten selbst, Caveat für den Hoodie-Print.

**Szene (Hochformat):**
- Oben: der Feed, eine Spalte, in der Komponenten fallen. Leichter Rahmen, Label "FEED".
- Akzeptanzlinie: gestrichelt grün, Label "INTO THE SITE".
- Unten links: Jack als Büste, Cap, blonde Wellen unter dem Rand, Schnurrbart, schwarzer Hoodie mit "NO SLOP"-Print in Handschrift, Kette. Idle-Atmen. Vier Posen: idle, swipe (Arm wischt), nod (Kopf kippt, Lächeln), facepalm.
- Unten rechts: ein Phone-Mockup, in dem die akzeptierten Komponenten als Mini-Render gestapelt werden. Slop landet sichtbar darin, mit Comic Sans und Lila.
- Hintergrund: grüner LED-Schein unten links, Pflanzen-Silhouette, Mikrofon am Arm von rechts.
- Sprechblasen mit seinen Phrasen: "No AI slop.", "Just watch.", "Clean.", "Beautiful.", "Insane.", "Nope."

**Juice:** Rauswerfen: Komponente fliegt nach links, dreht, zerstäubt in lila Partikel, "SLOP!"-Stempel in Gelb, Whoosh. Clean durchlassen: Komponente schrumpft ins Phone, Klick. Slop durchgelassen: rotes Blitzen, Shake, Facepalm, Buzzer. Combo ab x2: der grüne Schein wird stärker, Floating Text "×3".

## Blitzableiter: die neue Richtung

**Thema:** Gewitternacht über einer Stadt. Kein abstraktes Feld mehr.

**Palette:** Nachtblau-Verlauf (#0b1026 nach #05060c), Sterne, Regen als feine Streifen, Stadtsilhouette mit vereinzelten warmen Fenstern (#ffd9a0), Ladungen in Elektroblau (#7cc4ff) mit Halo, Blitze mit weißem Kern und blauem Glow. Gefahr färbt den Himmel von oben her rot-violett.

**Typografie:** Bricolage Grotesque 800 für den Titel mit blauem Glow, Inter für HUD.

**Figuren:** Ladungen sind Glühkugeln mit Flackern und Halo (vorgerenderter Sprite, kein shadowBlur). Ableiter sind Neon-Pins mit leuchtender Spitze und Bodenring, Restlebensdauer als Ring.

**Juice:** Blitz in drei Schichten (breiter Glow, mittlere Linie, weißer Kern) mit Verzweigungen. Bei Ketten ab 2: weißer Flash. Ab 3: Hit-Stop 70 ms, Donner, stärkerer Shake. Floating Text "+240" und "CHAIN ×4". Entladungen als expandierende Ringe plus Funken.

## Was gleich bleibt

Die Logik beider Spiele und alle Tests. Der Entwurf ist Render, Sound, Typografie und Charakter. Die Go/No-Go-Fragen aus `docs/06` gelten weiter, nur macht das Spiel jetzt Lust, sie zu beantworten.

## Was danach kommt (nicht in diesem Entwurf)

- Titelbild als OG-Image, Loom-Skript
- Musik-Loops
- Fonts selbst hosten statt Google Fonts (Offline, Ladezeit)
- Comic Neue als WOFF2 bündeln für Android
