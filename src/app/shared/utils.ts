import { Spell } from 'src/app/shared/models/spell';

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

const CHAIN_HEAL: Spell[] = [
  new Spell(1, 40, 2.5, 260, 320, 368),
  new Spell(2, 46, 2.5, 315, 405, 465),
  new Spell(3, 54, 2.5, 405, 551, 629),
];

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
    spellName: string,
    rank: number,
    healBonus: number,
    critChance: number
  ): number {
    let spell: Spell;
    if (spellName === 'healing-wave') {
      spell = HEALING_WAVE[rank - 1];
    } else if (spellName === 'chain-heal') {
      spell = CHAIN_HEAL[rank - 1];
    }

    if (spell) {
      const averageHeal = ((spell.minHeal + spell.maxHeal) / 2) * PURIFICATION;

      const healBonusAfterModifiers =
        healBonus *
        this.levelPenalty(spell.level) *
        this.durationPenalty(spell.duration);

      const healWithoutCrit = averageHeal + healBonusAfterModifiers;
      let healWithCrit =
        healWithoutCrit +
        healWithoutCrit *
          CRITICAL_STRIKE_BONUS *
          Math.max(critChance + TIDAL_MASTERY_CRIT, 1);

      if (spellName === 'chain-heal') {
        // Taking into account T2 bonuses
        healWithCrit *= 2.0725;
      }

      return healWithCrit;
    }

    return 0;
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
    } else if (spell === 'chain-heal') {
      const chainHeal = CHAIN_HEAL[rank - 1];
      return (
        (time / chainHeal.duration) *
        (chainHeal.manaCost - chainHeal.manaCost * TIDAL_FOCUS_MANA_REDUCTION)
      );
    }
    return 0;
  }

  // Look at which is the first rank that doesn't allow to cast the spell non-stop
  static firstTooHighRank(
    time: number,
    availableMana: number,
    spell: string
  ): number {
    let highestRank;
    if (spell === 'healing-wave') {
      highestRank = HEALING_WAVE.length;
    } else if (spell === 'chain-heal') {
      highestRank = CHAIN_HEAL.length;
    }

    let firstTooHighRank = highestRank;

    for (let rank = 1; rank <= highestRank; rank++) {
      if (this.manaDrain(time, spell, rank) > availableMana) {
        firstTooHighRank = rank;
        break;
      }
    }

    // To avoid using healing wave spell of rank 1 and 2 that are absolute garbage
    if (spell === 'healing-wave' && firstTooHighRank < 4) {
      firstTooHighRank = 4;
    }

    if (firstTooHighRank === 1) {
      firstTooHighRank = 2;
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

    let firstTooHighRank = this.firstTooHighRank(time, availableMana, spell);

    let highRankSpell: Spell;
    let lowRankSpell: Spell;

    // Brute force since I'm not smart enough
    // Determine maximum number of iteration to consider
    let maxIteration: number;

    let lowRankDuration: number;
    let highRankDuration: number;

    if (spell === 'healing-wave') {
      highRankSpell = HEALING_WAVE[firstTooHighRank - 1];
      lowRankSpell = HEALING_WAVE[firstTooHighRank - 2];

      maxIteration = Math.max(
        time / (highRankSpell.duration - IMPROVED_HEALING_WAVE_TIME_GAIN),
        time / (lowRankSpell.duration - IMPROVED_HEALING_WAVE_TIME_GAIN)
      );

      lowRankDuration = lowRankSpell.duration - IMPROVED_HEALING_WAVE_TIME_GAIN;
      highRankDuration =
        highRankSpell.duration - IMPROVED_HEALING_WAVE_TIME_GAIN;
    } else if (spell === 'chain-heal') {
      highRankSpell = CHAIN_HEAL[firstTooHighRank - 1];
      lowRankSpell = CHAIN_HEAL[firstTooHighRank - 2];

      maxIteration = Math.max(
        time / (highRankSpell.duration - IMPROVED_HEALING_WAVE_TIME_GAIN),
        time / (lowRankSpell.duration - IMPROVED_HEALING_WAVE_TIME_GAIN)
      );

      lowRankDuration = lowRankSpell.duration;
      highRankDuration = highRankSpell.duration;
    }

    let maxHeal = 0;
    let highIterationSelected;
    let lowIterationSelected;

    for (let highIteration = 0; highIteration < maxIteration; highIteration++) {
      for (let lowIteration = 0; lowIteration < maxIteration; lowIteration++) {
        // Compute only if it's not taking too much time and not takes too much mana
        if (
          lowIteration * lowRankDuration + highIteration * highRankDuration <=
            time &&
          lowIteration *
            (lowRankSpell.manaCost -
              lowRankSpell.manaCost * TIDAL_FOCUS_MANA_REDUCTION) +
            highIteration *
              (highRankSpell.manaCost -
                highRankSpell.manaCost * TIDAL_FOCUS_MANA_REDUCTION) <=
            availableMana
        ) {
          const healOutput =
            highIteration *
              this.averageHeal(
                spell,
                highRankSpell.rank,
                healBonus,
                critChance
              ) +
            lowIteration *
              this.averageHeal(spell, lowRankSpell.rank, healBonus, critChance);
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
      lowIterationSelected: lowIterationSelected,
    };
  }
}
