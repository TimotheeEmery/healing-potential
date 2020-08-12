import { Spell } from 'src/app/shared/models/spell';
import { Result } from 'src/app/shared/models/result';
import * as ShamanConstants from 'src/app/shared/shaman.constants';
import * as HealingConstants from 'src/app/shared/healing.constants';

export class Utils {
  // If the spell is below level 20, there is a penalty
  static levelPenalty(level: number): number {
    if (level < HealingConstants.MINIMUM_LEVEL) {
      return 1 - (HealingConstants.MINIMUM_LEVEL - level) * HealingConstants.MINIMUM_LEVEL_PENALTY;
    } else {
      return 1;
    }
  }

  // If the base cast-time of a spell is faster than 3.5 seconds, there is a penalty
  static durationPenalty(duration: number): number {
    if (duration < HealingConstants.NORMAL_DURATION) {
      return duration / HealingConstants.NORMAL_DURATION;
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
      spell = ShamanConstants.HEALING_WAVE[rank - 1];
    } else if (spellName === 'chain-heal') {
      spell = ShamanConstants.CHAIN_HEAL[rank - 1];
    }

    if (spell) {
      const averageHeal = ((spell.minHeal + spell.maxHeal) / 2) * ShamanConstants.PURIFICATION;

      const healBonusAfterModifiers =
        healBonus *
        this.levelPenalty(spell.level) *
        this.durationPenalty(spell.duration);

      const healWithoutCrit = averageHeal + healBonusAfterModifiers;
      let healWithCrit =
        healWithoutCrit +
        healWithoutCrit *
          HealingConstants.CRITICAL_STRIKE_BONUS *
          Math.min(critChance + ShamanConstants.TIDAL_MASTERY_CRIT, 1);

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
      const healingWave = ShamanConstants.HEALING_WAVE[rank - 1];
      return (
        (time / (healingWave.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN)) *
        (healingWave.manaCost -
          healingWave.manaCost * ShamanConstants.TIDAL_FOCUS_MANA_REDUCTION)
      );
    } else if (spell === 'chain-heal') {
      const chainHeal = ShamanConstants.CHAIN_HEAL[rank - 1];
      return (
        (time / chainHeal.duration) *
        (chainHeal.manaCost - chainHeal.manaCost * ShamanConstants.TIDAL_FOCUS_MANA_REDUCTION)
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
      highestRank = ShamanConstants.HEALING_WAVE.length;
    } else if (spell === 'chain-heal') {
      highestRank = ShamanConstants.CHAIN_HEAL.length;
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

  // Compute how much heal is provided during the entire fight
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
      highRankSpell = ShamanConstants.HEALING_WAVE[firstTooHighRank - 1];
      lowRankSpell = ShamanConstants.HEALING_WAVE[firstTooHighRank - 2];

      maxIteration = Math.max(
        time / (highRankSpell.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN),
        time / (lowRankSpell.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN)
      );

      lowRankDuration = lowRankSpell.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN;
      highRankDuration =
        highRankSpell.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN;
    } else if (spell === 'chain-heal') {
      highRankSpell = ShamanConstants.CHAIN_HEAL[firstTooHighRank - 1];
      lowRankSpell = ShamanConstants.CHAIN_HEAL[firstTooHighRank - 2];

      maxIteration = Math.max(
        time / (highRankSpell.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN),
        time / (lowRankSpell.duration - ShamanConstants.IMPROVED_HEALING_WAVE_TIME_GAIN)
      );

      lowRankDuration = lowRankSpell.duration;
      highRankDuration = highRankSpell.duration;
    }

    // Compute maximum heal candidates
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
              lowRankSpell.manaCost * ShamanConstants.TIDAL_FOCUS_MANA_REDUCTION) +
            highIteration *
              (highRankSpell.manaCost -
                highRankSpell.manaCost * ShamanConstants.TIDAL_FOCUS_MANA_REDUCTION) <=
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

    const result = new Result(
      maxHeal,
      highIterationSelected,
      firstTooHighRank,
      lowIterationSelected
    );

    return result;
  }
}
