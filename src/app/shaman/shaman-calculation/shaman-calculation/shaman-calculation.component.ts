import { Component, OnInit, Input } from '@angular/core';
import { Utils } from 'src/app/shared/utils';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-shaman-calculation',
  templateUrl: './shaman-calculation.component.html',
  styleUrls: ['./shaman-calculation.component.scss'],
})
export class ShamanCalculationComponent implements OnInit {
  time: number = 150;
  maxMana: number = 8000;
  mp5: number = 30;
  spell: string = 'healing-wave';
  healBonus: number = 500;
  criticalRate: number = 10;
  addIntelNumber: number = 1;
  healingPotential: number;

  intelValue: number;
  mp5Value: number;
  healBonusValue: number;
  criticalStrikeValue: number;
  manaValue: number;

  baseSelect: number;
  compareToSelect: number;

  compared: string;

  constructor() {}

  ngOnInit(): void {
    this.onCompute();
  }

  onCompute(): void {
    this.healingPotential = Utils.healOutput(
      +this.time,
      +this.maxMana,
      +this.mp5,
      this.spell,
      +this.healBonus,
      +this.criticalRate / 100
    );

    // Mp5 Value
    const additionalHealingMp5 = Utils.healOutput(
      +this.time,
      +this.maxMana,
      +this.mp5 + 10,
      this.spell,
      +this.healBonus,
      +this.criticalRate / 100
    );
    this.mp5Value = (additionalHealingMp5 - this.healingPotential) / 10;

    // Intel Value
    const additionalHealingIntel = Utils.healOutput(
      +this.time,
      +this.maxMana + 10 * 15.75,
      +this.mp5,
      this.spell,
      +this.healBonus,
      (+this.criticalRate + 10 / 59.2) / 100
    );
    this.intelValue = (additionalHealingIntel - this.healingPotential) / 10;

    // Heal Bonus Value
    const additionalHealingHealBonus = Utils.healOutput(
      +this.time,
      +this.maxMana,
      +this.mp5,
      this.spell,
      +this.healBonus + 20,
      +this.criticalRate / 100
    );
    this.healBonusValue =
      (additionalHealingHealBonus - this.healingPotential) / 20;

    // Mana value
    const additionalHealingMana = Utils.healOutput(
      +this.time,
      +this.maxMana + 150,
      +this.mp5,
      this.spell,
      +this.healBonus,
      +this.criticalRate / 100
    );
    this.manaValue = (additionalHealingMana - this.healingPotential) / 150;

    // Critical strike value
    const additionalCriticalStrike = Utils.healOutput(
      +this.time,
      +this.maxMana,
      +this.mp5,
      this.spell,
      +this.healBonus,
      (+this.criticalRate + 3) / 100
    );
    this.criticalStrikeValue =
      (additionalCriticalStrike - this.healingPotential) / 3;
  }

  addIntel(): void {
    if (!this.addIntelNumber) {
      this.addIntelNumber = 0;
    }
    this.maxMana = +this.maxMana + +this.addIntelNumber * 15.75;
    this.criticalRate = +this.criticalRate + +this.addIntelNumber / 59.2;
  }

  compare(): void {
    if (this.baseSelect && this.compareToSelect) {
      this.compared = `${+this.baseSelect / +this.compareToSelect}`;
    }
  }
}
