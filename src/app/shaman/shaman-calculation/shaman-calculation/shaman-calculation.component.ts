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
  defaultProfile = new Profile('8000', '30', '500', '10');

  @Input() id: string;
  @Input() time: number;
  @Input() profile = this.defaultProfile;

  spell = 'healing-wave';

  addIntelNumber = 1;

  // Profiles
  t0Profile = new Profile('6000', '10', '300', '5');
  t1Profile = new Profile('7000', '20', '450', '7');
  t2Profile = new Profile('8000', '30', '600', '10');

  // Modifiers
  arcaneIntelligence: boolean; // 31 intel
  markOfTheWild: boolean; // 12 stats
  improvedMarkOfTheWild: boolean; // 12 stats * 35% = 16 stats (?)

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

  baseSelect: number;
  compareToSelect: number;
  compared: string;

  // Tooltips
  t0Tooltip = `Dungeons and BoE`;
  t1Tooltip = `Molten Core`;
  t2Tooltip = `Black Wing Lair`;
  applyIntelTooltip = `Click on the button to apply the informed intel value, it will affect maximum mana and critical chance`;
  profileTooltip = `Click on a profile to set those stats above`;
  modifierTooltip = `Check what modifiers should apply during calculation`;

  constructor() {}

  ngOnInit(): void {
    this.onCompute();
  }

  onCompute(): void {
    const healOuputObject = Utils.healOutput(
      +this.time,
      +this.profile.maxMana,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      +this.profile.criticalRate / 100
    );

    this.healingPotential = healOuputObject.maxHeal;
    this.highIteration = healOuputObject.highIterationSelected;
    this.firstTooHighRank = healOuputObject.firstTooHighRank;
    this.lowIteration = healOuputObject.lowIterationSelected;

    // Mp5 Value
    const additionalHealingMp5 = Utils.healOutput(
      +this.time,
      +this.profile.maxMana,
      +this.profile.mp5 + 10,
      this.spell,
      +this.profile.healBonus,
      +this.profile.criticalRate / 100
    ).maxHeal;
    this.mp5Value = (additionalHealingMp5 - this.healingPotential) / 10;

    // Intel Value
    const additionalHealingIntel = Utils.healOutput(
      +this.time,
      +this.profile.maxMana + 10 * 15.75,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      (+this.profile.criticalRate + 10 / 59.2) / 100
    ).maxHeal;
    this.intelValue = (additionalHealingIntel - this.healingPotential) / 10;

    // Heal Bonus Value
    const additionalHealingHealBonus = Utils.healOutput(
      +this.time,
      +this.profile.maxMana,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus + 20,
      +this.profile.criticalRate / 100
    ).maxHeal;
    this.healBonusValue =
      (additionalHealingHealBonus - this.healingPotential) / 20;

    // Mana value
    const additionalHealingMana = Utils.healOutput(
      +this.time,
      +this.profile.maxMana + 150,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      +this.profile.criticalRate / 100
    ).maxHeal;
    this.manaValue = (additionalHealingMana - this.healingPotential) / 150;

    // Critical strike value
    const additionalCriticalStrike = Utils.healOutput(
      +this.time,
      +this.profile.maxMana,
      +this.profile.mp5,
      this.spell,
      +this.profile.healBonus,
      (+this.profile.criticalRate + 3) / 100
    ).maxHeal;
    this.criticalStrikeValue =
      (additionalCriticalStrike - this.healingPotential) / 3;

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
}
