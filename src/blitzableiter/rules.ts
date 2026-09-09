/** Alle Tuning-Zahlen an einer Stelle. */
export const RULES = {
  charge: {
    radius: 8,
    speedMin: 40,
    speedMax: 70,
    turnNoise: 2.2,        // rad/s Richtungsrauschen
    spawnEvery: [1.5, 1.0, 0.7] as const,  // s, gestaffelt nach Zeit
    spawnStageAt: [0, 30, 60] as const,    // s, ab wann welche Stufe gilt
    maxOnField: 12,
  },
  rod: {
    max: 5,
    lifetime: 6,          // s
    hitRadius: 16,        // Ladung trifft Ableiter
    chainRadius: 110,     // Ableiter zündet Ableiter
    zapRadius: 48,        // gezündeter Ableiter entlädt Ladungen in diesem Radius
    radiusShowTime: 0.5,  // s, wie lange der Kettenradius nach dem Setzen sichtbar ist
  },
  bolt: {
    life: 0.35,           // s
  },
  score: {
    perZap: 10,           // Basis pro entladener Ladung, quadratisch mit Anzahl, mal Kettenlänge
  },
};
