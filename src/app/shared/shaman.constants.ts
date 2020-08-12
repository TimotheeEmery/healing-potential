import { Spell } from '../shared/models/spell';

// Talents
export const IMPROVED_HEALING_WAVE_TIME_GAIN = 0.5;
export const TIDAL_FOCUS_MANA_REDUCTION = 0.05;
export const TIDAL_MASTERY_CRIT = 0.05;
export const PURIFICATION = 1.1;

export const HEALING_WAVE: Spell[] = [
  new Spell(1, 1, 1.5, 25, 34, 44),
  new Spell(2, 6, 2, 45, 64, 78),
  new Spell(3, 12, 2.5, 80, 129, 155),
  new Spell(4, 18, 3, 155, 268, 316),
  new Spell(5, 24, 3, 200, 376, 440),
  new Spell(6, 32, 3, 265, 536, 622),
  new Spell(7, 40, 3, 340, 740, 854),
  new Spell(8, 48, 3, 440, 1017, 1167),
  new Spell(9, 56, 3, 560, 1367, 1561),
  new Spell(10, 60, 3, 620, 1620, 1850),
];

export const CHAIN_HEAL: Spell[] = [
  new Spell(1, 40, 2.5, 260, 320, 368),
  new Spell(2, 46, 2.5, 315, 405, 465),
  new Spell(3, 54, 2.5, 405, 551, 629),
];