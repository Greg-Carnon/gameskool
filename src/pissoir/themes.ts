export interface Theme {
  name: string;
  wall: string; grout: string; band: string; floor: string; floorLine: string;
  door: string; doorDark: string; light: string; urinalTint: string; skirting: string;
  tile: number; mirror: string; stall: string; prop: 'sink' | 'poster' | 'graffiti' | 'neon' | 'vending' | 'plant' | 'chalk' | 'portable';
  dark: boolean;
}

export const THEMES: Theme[] = [
  { name: 'Office', wall: '#dfe9ec', grout: 'rgba(80,110,120,0.18)', band: '#7fb3bf', floor: '#b8c4c8', floorLine: 'rgba(60,80,90,0.2)', door: '#8a6a4a', doorDark: '#6f5238', light: '#ffffff', urinalTint: '#dde7ea', skirting: '#93a3a8', tile: 36, mirror: '#cfe0e6', stall: '#9aa8ae', prop: 'sink', dark: false },
  { name: 'Pub', wall: '#3a2a22', grout: 'rgba(0,0,0,0.25)', band: '#7a4a2a', floor: '#5a4232', floorLine: 'rgba(0,0,0,0.3)', door: '#2a1a12', doorDark: '#1a100a', light: '#ffd9a0', urinalTint: '#cfc4b4', skirting: '#2a1a12', tile: 44, mirror: '#5a4a3a', stall: '#3a2418', prop: 'poster', dark: true },
  { name: 'Gas station', wall: '#e8dcb8', grout: 'rgba(120,100,60,0.25)', band: '#c9a227', floor: '#a89f86', floorLine: 'rgba(60,50,30,0.25)', door: '#8a8a8a', doorDark: '#6a6a6a', light: '#f0f0d0', urinalTint: '#d9d2c0', skirting: '#7a7050', tile: 30, mirror: '#d8d0b0', stall: '#8a8a8a', prop: 'graffiti', dark: false },
  { name: 'Club', wall: '#14101c', grout: 'rgba(255,255,255,0.05)', band: '#ff2d95', floor: '#1e1828', floorLine: 'rgba(255,45,149,0.15)', door: '#0a0810', doorDark: '#050408', light: '#ff2d95', urinalTint: '#3a3050', skirting: '#0a0810', tile: 48, mirror: '#2a2238', stall: '#1a1424', prop: 'neon', dark: true },
  { name: 'Stadium', wall: '#c8ccd0', grout: 'rgba(0,0,0,0.15)', band: '#1f7a3a', floor: '#8c9296', floorLine: 'rgba(0,0,0,0.2)', door: '#4a5258', doorDark: '#363c40', light: '#ffffff', urinalTint: '#cfd6da', skirting: '#5a6266', tile: 60, mirror: '#b8bfc4', stall: '#4a5258', prop: 'vending', dark: false },
  { name: 'Airport', wall: '#f3f5f7', grout: 'rgba(120,130,140,0.15)', band: '#2c5ea8', floor: '#d7dbe0', floorLine: 'rgba(60,70,90,0.12)', door: '#9aa4ae', doorDark: '#7c868f', light: '#ffffff', urinalTint: '#e6ebef', skirting: '#b9c1c8', tile: 40, mirror: '#e8eef2', stall: '#aeb8c0', prop: 'plant', dark: false },
  { name: 'School', wall: '#d8e4c8', grout: 'rgba(60,90,40,0.2)', band: '#5a8a3a', floor: '#9aa68a', floorLine: 'rgba(40,60,30,0.2)', door: '#6a8a5a', doorDark: '#4f6b44', light: '#f8f8e8', urinalTint: '#d4ddd0', skirting: '#6a7a5a', tile: 32, mirror: '#c8d8b8', stall: '#6a8a5a', prop: 'chalk', dark: false },
  { name: 'Festival', wall: '#3b6ea5', grout: 'rgba(0,0,0,0.15)', band: '#2a4d78', floor: '#6a5a3a', floorLine: 'rgba(0,0,0,0.25)', door: '#2a4d78', doorDark: '#1d365a', light: '#ffe9b0', urinalTint: '#b9c6d2', skirting: '#2a4d78', tile: 200, mirror: '#7a9cc0', stall: '#2a4d78', prop: 'portable', dark: false },
];

export function themeAt(level: number): Theme {
  return THEMES[level % THEMES.length];
}
