# Skool-Post für die September Comp

Stand: 10. September 2026. Englisch, zum Kopieren. Unter "September Comp" posten, Screenshot und Loom anhängen.

---

**SONAR: a one-thumb deep sea dive where seeing costs air**

It is dark down there. Every tap moves your sub and sends out a sonar ping. For one second you see what is around you: pearls, mines, jellyfish, things that hunt you. Then the dark comes back.

Pings cost oxygen. Pearls give it back. So the whole game is one question: how much do you need to see before you move?

**Play it (phone, portrait):** https://gameskool.vercel.app/sonar/

**What is in it**
- 5 depth zones, each with its own world and its own threat: light rays in the Shallows, swaying kelp, a sunken wreck with currents, a trench where echo fish swim towards your pings, and the Angler's lair.
- A boss you cannot fight. The Angler hunts your last ping. Its lure is the only thing you can always see. You have to lead it into the mines.
- Hold for a big ping: wider, twice the cost.
- Pearl chains: grab pearls fast for more air and a multiplier.
- Pearls you collect stay in your bank. Buy sonar range, lungs, propeller.
- 8 achievements, a dive log, a depth gauge, and an endless Abyss after the boss with the Angler coming back for you.
- Ambient soundtrack made entirely from Web Audio oscillators. No audio files. Whale calls included.

**How it was built**
This is my first game ever. Everything is Claude Code: research, 30 ideas, a shortlist, six playable prototypes in one day, then I picked the one I kept playing and we pushed on that. Vite, TypeScript, Canvas 2D, zero frameworks, ZzFX for effects, 55 automated tests for the game logic so the boss and the hatch never break. Deployed on Vercel.

The full research and design docs are in the repo if you want to see how the sausage was made.

**Tips**
- Mines tick when you are close. Listen.
- The hatch opens at the bottom when you have enough pearls.
- Level 5 is called The Angler for a reason. Ping, then move.

Curious what depth you reach. Post your dive log below.

---

## Hinweise zum Posten

- Kategorien, die der Text bedient: Most Creative (Sehen kostet Luft, Boss per Locken), Eye Candy (Welten, Ambient-Sound), One More Go (Chains, Perlenbank, Abyss), First Timer (explizit genannt).
- Wenn der Repo-Link rein soll, muss vorher `gh auth login` laufen und der Push erfolgen. Bis dahin den Satz "The full research and design docs are in the repo" streichen oder den Live-Link allein lassen.
- Loom: 60 Sekunden, Vorschlag für den Schnitt: 0 bis 10 s Titelscreen und erster Ping im Dunkeln, 10 bis 30 s Perlen sammeln und Luke, 30 bis 50 s Bosslevel mit Angler in eine Mine locken, 50 bis 60 s Game Over mit Dive-Log und Achievements. Boss direkt per `?level=4` starten.
