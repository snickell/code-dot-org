/** @file Tests for GameLabGroup, our extension of p5.play Group */
import {spy} from 'sinon';
import {expect} from '../../util/configuredChai';
import {forEveryBooleanPermutation} from '../../util/testUtils';
import {createStatefulGameLabP5} from '../../util/gamelab/TestableGameLabP5';

describe('GameLabGroup', function () {
  let gameLabP5, createSprite, createGroup;

  beforeEach(function () {
    gameLabP5 = createStatefulGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
    createGroup = gameLabP5.p5.createGroup.bind(gameLabP5.p5);
  });

  describe('methods applying to each sprite', function () {
    it('setSpeedAndDirectionEach calls setSpeedAndDirection for each member', function () {
      let sprite1 = createSprite(0, 0);
      let sprite2 = createSprite(0, 0);
      let group = createGroup();
      group.add(sprite1);
      group.add(sprite2);
      spy(sprite1, 'setSpeedAndDirection');
      spy(sprite2, 'setSpeedAndDirection');
      expect(sprite1.setSpeedAndDirection.calledOnce).to.be.false;
      expect(sprite2.setSpeedAndDirection.calledOnce).to.be.false;

      const speed = 5;
      const direction = 180;
      group.setSpeedAndDirectionEach(speed, direction);
      expect(sprite1.setSpeedAndDirection.calledOnce).to.be.true;
      expect(sprite2.setSpeedAndDirection.calledOnce).to.be.true;
      expect(sprite1.setSpeedAndDirection.calledWith(speed, direction)).to.be.true;
      expect(sprite2.setSpeedAndDirection.calledWith(speed, direction)).to.be.true;
    });
  });

  describe('collision methods', function () {
    var sprite1, sprite2, targetSprite, group;

    beforeEach(function () {
      sprite1 = createSprite(0, 0, 100, 100);
      sprite2 = createSprite(400, 400, 100, 100);
      targetSprite = createSprite(200, 200, 100, 100);
      group = createGroup();
      group.add(sprite1);
      group.add(sprite2);
    });

    describe('isTouching', function () {
      it('returns false if no sprite in group overlaps target sprite', function () {
        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(false);
      });

      it('returns true if first sprite in group overlaps target sprite', function () {
        // Make sprite1 overlap with target sprite
        sprite1.x = targetSprite.x;
        sprite1.y = targetSprite.y;

        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true if last sprite in group overlaps target sprite', function () {
        // Make sprite1 overlap with target sprite
        sprite2.x = targetSprite.x;
        sprite2.y = targetSprite.y;

        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(true);
      });

      it('returns true if every sprite in group overlaps target sprite', function () {
        // Make sprite1 overlap with target sprite
        sprite1.x = targetSprite.x;
        sprite1.y = targetSprite.y;
        sprite2.x = targetSprite.x;
        sprite2.y = targetSprite.y;

        let result;
        for (let i = 0; i < group.length + 1; i++) {
          result = group.isTouching(targetSprite);
        }
        expect(result).to.equal(true);
      });
    });
  });
});
