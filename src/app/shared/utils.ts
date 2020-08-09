import { Spell } from 'src/app/shared/spell';

const CRITICAL_STRIKE_BONUS = 0.5;
const NORMAL_DURATION = 3.5;
const MINIMUM_LEVEL = 20;
const MINIMUM_LEVEL_PENALTY = 0.0375;

// Talents
const IMPROVED_HEALING_WAVE_TIME_GAIN = 0.5;
const TIDAL_FOCUS_MANA_REDUCTION = 0.05;
const TIDAL_MASTERY_CRIT = 0.05;
const PURIFICATION = 1.1;

const HEALING_WAVE: Spell[] = [
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

const CHAIN_HEAL: Spell[] = [];

export class Utils {

  // If the spell is below level 20, there is a penalty
  static levelPenalty(level: number): number {
    if (level < MINIMUM_LEVEL) {
      return 1 - (MINIMUM_LEVEL - level) * MINIMUM_LEVEL_PENALTY;
    } else {
      return 1;
    }
  }

  // If the base cast-time of a spell is faster than 3.5 seconds, there is a penalty
  static durationPenalty(duration: number): number {
    if (duration < NORMAL_DURATION) {
      return duration / NORMAL_DURATION;
    } else {
      return 1;
    }
  }

  // HP healed after applying all modifiers
  static averageHeal(
    spell: string,
    rank: number,
    healBonus: number,
    critChance: number
  ): number {
    if (spell === 'healing-wave') {
      const healingWave = HEALING_WAVE[rank - 1];

      const averageHeal =
        ((healingWave.minHeal + healingWave.maxHeal) / 2) * PURIFICATION;

      const healBonusAfterModifiers =
        healBonus *
        this.levelPenalty(healingWave.level) *
        this.durationPenalty(healingWave.duration);

      const healWithoutCrit = averageHeal + healBonusAfterModifiers;

      return (
        healWithoutCrit +
        healWithoutCrit *
          (CRITICAL_STRIKE_BONUS * (critChance + TIDAL_MASTERY_CRIT))
      );
    }

    return -1;
  }

  // How much mana is spent if we want to cast this spell non-stop
  static manaDrain(time: number, spell: string, rank: number): number {
    if (spell === 'healing-wave') {
      const healingWave = HEALING_WAVE[rank - 1];
      return (
        (time / (healingWave.duration - IMPROVED_HEALING_WAVE_TIME_GAIN)) *
        (healingWave.manaCost -
          healingWave.manaCost * TIDAL_FOCUS_MANA_REDUCTION)
      );
    }
    return -1;
  }

  // Look at which is the first rank that doesn't allow to cast the spell non-stop
  static firstTooHighRank(time: number, availableMana: number): number {
    let firstTooHighRank = HEALING_WAVE.length;

    for (let i = 1; i <= HEALING_WAVE.length; i++) {
      if (this.manaDrain(time, 'healing-wave', i) > availableMana) {
        firstTooHighRank = i;
        break;
      }
    }

    return firstTooHighRank;
  }

  // Expects than downranking is always more mana efficient (which is not true depending on the heal bonus)
  static healOutput(
    time: number,
    manaMax: number,
    mp5: number,
    spell: string,
    healBonus: number,
    critChance: number
  ) {
    const availableMana = manaMax + mp5 * (time / 5);

    let firstTooHighRank = this.firstTooHighRank(time, availableMana);

    // To avoid using spell of rank 1 and 2 that are absolute garbage
    if (firstTooHighRank < 4) {
      firstTooHighRank = 4;
    }

    const healingWaveHighRank = HEALING_WAVE[firstTooHighRank - 1];
    const healingWaveLowRank = HEALING_WAVE[firstTooHighRank - 2];
    // Brute force since I'm not smart enough
    // Determine maximum number of iteration to consider
    const maxIteration = Math.max(
      time / (healingWaveHighRank.duration - IMPROVED_HEALING_WAVE_TIME_GAIN),
      time / (healingWaveLowRank.duration - IMPROVED_HEALING_WAVE_TIME_GAIN)
    );

    let maxHeal = 0;
    let highIterationSelected;
    let lowIterationSelected;

    for (let highIteration = 0; highIteration < maxIteration; highIteration++) {
      for (let lowIteration = 0; lowIteration < maxIteration; lowIteration++) {
        // Compute only if it's not taking too much time and not takes too much mana
        if (
          lowIteration *
            (healingWaveLowRank.duration - IMPROVED_HEALING_WAVE_TIME_GAIN) +
            highIteration *
              (healingWaveHighRank.duration -
                IMPROVED_HEALING_WAVE_TIME_GAIN) <=
            time &&
          lowIteration *
            (healingWaveLowRank.manaCost -
              healingWaveLowRank.manaCost * TIDAL_FOCUS_MANA_REDUCTION) +
            highIteration *
              (healingWaveHighRank.manaCost -
                healingWaveHighRank.manaCost * TIDAL_FOCUS_MANA_REDUCTION) <=
            availableMana
        ) {
          const healOutput =
            highIteration *
              this.averageHeal(
                spell,
                healingWaveHighRank.rank,
                healBonus,
                critChance
              ) +
            lowIteration *
              this.averageHeal(
                spell,
                healingWaveLowRank.rank,
                healBonus,
                critChance
              );
          if (healOutput > maxHeal) {
            maxHeal = healOutput;
            highIterationSelected = highIteration;
            lowIterationSelected = lowIteration;
          }
        }
      }
    }

    return {
      maxHeal: maxHeal,
      highIterationSelected: highIterationSelected,
      firstTooHighRank: firstTooHighRank,
      lowIterationSelected: lowIterationSelected
    } 
  }
}
