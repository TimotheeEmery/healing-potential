import { Utils } from './utils';
import { Spell } from 'src/app/shared/models/spell';

fdescribe('Utils', () => {
  describe('Utils level penalty', () => {
    it('should be harsh when level is low', () => {
      let returnedValue = Utils.levelPenalty(5);
      let expectedValue = 1 - 15 * 0.0375;

      expect(returnedValue).toEqual(expectedValue);
    });
    it('should be moderate when level is medium', () => {
      let returnedValue = Utils.levelPenalty(10);
      let expectedValue = 1 - 10 * 0.0375;

      expect(returnedValue).toEqual(expectedValue);
    });
    it('should be 1 when level is high enough', () => {
      let returnedValue = Utils.levelPenalty(30);
      let expectedValue = 1;

      expect(returnedValue).toEqual(expectedValue);
    });
  });

  describe('Utils duration penalty', () => {
    it('should be high when duration is short', () => {
      let returnedValue = Utils.durationPenalty(1.5);
      let expectedValue = 1.5 / 3.5;

      expect(returnedValue).toEqual(expectedValue);
    });
    it('should be average when duration is medium', () => {
      let returnedValue = Utils.durationPenalty(2.5);
      let expectedValue = 2.5 / 3.5;

      expect(returnedValue).toEqual(expectedValue);
    });
    it('should be 1 when duration is long enough', () => {
      let returnedValue = Utils.durationPenalty(6);
      let expectedValue = 1;

      expect(returnedValue).toEqual(expectedValue);
    });
  });

  describe('Average heal should return the right value', () => {
    it('should be computed correctly', () => {
      const rank = 4;
      const healPower = 500;
      const critical = 0.1;
      const healingWaveRank4 = new Spell(4, 18, 3, 155, 268, 316);

      let returnedValue = Utils.averageHeal(
        'healing-wave',
        rank,
        healPower,
        critical
      );

      let averageMinMax =
        ((healingWaveRank4.minHeal + healingWaveRank4.maxHeal) / 2) * 1.1;

      let healBonusAfterModifiers =
        healPower *
        Utils.durationPenalty(healingWaveRank4.duration) *
        Utils.levelPenalty(healingWaveRank4.level);

      let healWithoutCrit = averageMinMax + healBonusAfterModifiers;

      let expectedValue =
        healWithoutCrit + healWithoutCrit * (critical + 0.05) * 0.5;

      console.log(averageMinMax);
      console.log(healBonusAfterModifiers);
      console.log(returnedValue);
      console.log(expectedValue);

      expect(returnedValue).toBeCloseTo(expectedValue, -0.1);
    });
  });
});
