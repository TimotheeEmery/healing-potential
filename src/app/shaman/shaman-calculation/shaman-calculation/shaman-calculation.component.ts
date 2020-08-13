import { Component, OnInit, Input } from '@angular/core';
import { Utils } from 'src/app/shared/utils';
import { Profile } from 'src/app/shared/models/profile';

@Component({
  selector: 'app-shaman-calculation',
  templateUrl: './shaman-calculation.component.html',
  styleUrls: ['./shaman-calculation.component.scss'],
})
export class ShamanCalculationComponent implements OnInit {
  // Variables
  @Input() id: string;
  @Input() time: number;
  @Input() profile = new Profile('8000', '30', '700', '10');

  spell = 'healing-wave';

  addIntelNumber = 1;

  // Profiles
  t0Profile = new Profile('6000', '10', '300', '5');
  t1Profile = new Profile('7000', '20', '500', '7');
  t2Profile = new Profile('8000', '30', '700', '10');

  // Modifiers
  arcaneIntellect: boolean; // 31 intel
  markOfTheWild: boolean; // 12 stats
  improvedMarkOfTheWild: boolean; // 12 stats * 35% = 16 stats (?)
  darkMoonFaire: boolean; // Sombrelune, 9 intel
  // Ony/Nef 10% crit.
  // Rend ?? mp5
  // Zandalar spirit, 15% stats (after other modifiers?)
  // HT spell crit. 3%
  // Using totem
  // Mana wave totem up
  // Potions, major, excellent, superior
  // Demonic/Dark rune
  // Lutjan, 8 mp5
  // Bloodmage potion, 12 mp5
  // Brilliant oil

  // Results
  healingPotential: number;

  highIteration: number;
  firstTooHighRank: number;
  lowIteration: number;

  intelValue: number;
  mp5Value: number;
  healBonusValue: number;
  criticalStrikeValue: number;
  manaValue: number;

  intelValueStep = 20;
  mp5ValueStep = 10;
  healBonusValueStep = 50;
  criticalStrikeValueStep = 5;
  manaValueStep = 400;

  baseSelect: number;
  compareToSelect: number;
  compared: string;

  // Tooltips
  criticalRateVariableTooltip = `Chance to get a critical strike with spell.
Value above 100 will resolve to 100`;
  t0Tooltip = `Dungeons and BoE`;
  t1Tooltip = `Molten Core`;
  t2Tooltip = `Black Wing Lair`;
  applyIntelTooltip = `Click on the button to apply the informed intel value.
It will affect maximum mana and critical chance`;
  profileTooltip = `Click on a profile to set those stats above`;
  modifierTooltip = `Check what modifiers should apply during calculation`;
  intelValueTooltip = `Average healing potential increase per intel over the next ${this.intelValueStep} intel`;
  mp5ValueTooltip = `Average healing potential increase per mp5 over the next ${this.mp5ValueStep} mp5`;
  healBonusValueTooltip = `Average healing potential increase per heal bonus over the next ${this.healBonusValueStep} heal bonus`;
  criticalStrikeValueTooltip = `Average healing potential increase per critical strike % over the next ${this.criticalStrikeValueStep}%`;
  manaValueTooltip = `Average healing potential increase per mana over the next ${this.manaValueStep} mana`;

  constructor() {}

  ngOnInit(): void {
    this.onCompute();
  }

  onCompute(): void {
    let maxManaForComputation = +this.profile.maxMana;
    maxManaForComputation = this.arcaneIntellect
      ? maxManaForComputation + 31 * 15.75
      : maxManaForComputation;
    maxManaForComputation = this.markOfTheWild
      ? maxManaForComputation + 12 * 15.75
      : maxManaForComputation;
    maxManaForComputation = this.improvedMarkOfTheWild
      ? maxManaForComputation + 4 * 15.75
      : maxManaForComputation;

    let criticalStrikeForComputation = +this.profile.criticalRate;
    criticalStrikeForComputation = this.arcaneIntellect
      ? criticalStrikeForComputation + 31 * (1 / 59.2)
      : criticalStrikeForComputation;
    criticalStrikeForComputation = this.markOfTheWild
      ? criticalStrikeForComputation + 12 * (1 / 59.2)
      : criticalStrikeForComputation;
    criticalStrikeForComputation = this.markOfTheWild
      ? criticalStrikeForComputation + 4 * (1 / 59.2)
      : criticalStrikeForComputation;

    const healOuputObject = Utils.healOutput(
      +this.time,
      maxManaForComputation,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      criticalStrikeForComputation / 100
    );

    this.healingPotential = healOuputObject.maxHeal;
    this.highIteration = healOuputObject.highIterationSelected;
    this.firstTooHighRank = healOuputObject.firstTooHighRank;
    this.lowIteration = healOuputObject.lowIterationSelected;

    // Mp5 Value
    const additionalHealingMp5 = Utils.healOutput(
      +this.time,
      maxManaForComputation,
      +this.profile.mp5 + this.mp5ValueStep,
      this.spell,
      +this.profile.healBonus,
      criticalStrikeForComputation / 100
    ).maxHeal;
    this.mp5Value =
      (additionalHealingMp5 - this.healingPotential) / this.mp5ValueStep;

    // Intel Value
    const additionalHealingIntel = Utils.healOutput(
      +this.time,
      maxManaForComputation + this.intelValueStep * 15.75,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      (criticalStrikeForComputation + this.intelValueStep / 59.2) / 100
    ).maxHeal;
    this.intelValue =
      (additionalHealingIntel - this.healingPotential) / this.intelValueStep;

    // Heal Bonus Value
    const additionalHealingHealBonus = Utils.healOutput(
      +this.time,
      maxManaForComputation,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus + this.healBonusValueStep,
      criticalStrikeForComputation / 100
    ).maxHeal;
    this.healBonusValue =
      (additionalHealingHealBonus - this.healingPotential) /
      this.healBonusValueStep;

    // Mana value
    const additionalHealingMana = Utils.healOutput(
      +this.time,
      maxManaForComputation + this.manaValueStep * 1.05,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      criticalStrikeForComputation / 100
    ).maxHeal;
    this.manaValue =
      (additionalHealingMana - this.healingPotential) / this.manaValueStep;

    // Critical strike value
    const additionalCriticalStrike = Utils.healOutput(
      +this.time,
      maxManaForComputation,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      (criticalStrikeForComputation + this.criticalStrikeValueStep) / 100
    ).maxHeal;
    this.criticalStrikeValue =
      (additionalCriticalStrike - this.healingPotential) /
      this.criticalStrikeValueStep;

    this.baseSelect = this.mp5Value;
    this.compareToSelect = this.healBonusValue;
    this.compare();
  }

  addIntel(): void {
    if (!this.addIntelNumber) {
      this.addIntelNumber = 0;
    }
    this.profile.maxMana = (
      +this.profile.maxMana +
      +this.addIntelNumber * 15.75
    ).toString();
    this.profile.criticalRate = (
      +this.profile.criticalRate +
      +this.addIntelNumber / 59.2
    ).toString();
  }

  compare(): void {
    if (this.baseSelect && this.compareToSelect) {
      this.compared = `${+this.baseSelect / +this.compareToSelect}`;
    }
  }

  applyProfile(profile: Profile): void {
    this.profile = new Profile(
      profile.maxMana,
      profile.mp5,
      profile.healBonus,
      profile.criticalRate
    );
  }

  changeMark(markValue: boolean): void {
    this.markOfTheWild = markValue;
    if (!markValue) {
      this.improvedMarkOfTheWild = false;
    }
  }
}
