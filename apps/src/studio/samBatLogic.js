var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var Position = studioConstants.Position;
var KeyCodes = require('../constants').KeyCodes;
var codegen = require('../codegen');
var api = require('./api');

/**
 * Custom logic for the Sam the Bat levels
 * @constructor
 * @implements CustomGameLogic
 */
var SamBatLogic = function (studio) {
  this.studio_ = studio;
  this.cached_ = {};
  this.samIndex = 0;
  this.sam = null;
};

SamBatLogic.prototype.onTick = function () {
  this.sam = this.studio_.sprite[this.samIndex];
  
  // Move Sam with arrow keys
  for (var key in KeyCodes) {
    if (this.studio_.keyState[KeyCodes[key]] &&
        this.studio_.keyState[KeyCodes[key]] === "keydown") {
      switch (KeyCodes[key]) {
        case KeyCodes.LEFT:
          this.updateSam_(Direction.WEST);
          break;
        case KeyCodes.UP:
          this.updateSam_(Direction.NORTH);
          break;
        case KeyCodes.RIGHT:
          this.updateSam_(Direction.EAST);
          break;
        case KeyCodes.DOWN:
          this.updateSam_(Direction.SOUTH);
          break;
      }
    }
  }

  // Move Sam with arrow buttons
  for (var btn in this.studio_.btnState) {
    if (this.studio_.btnState[btn]) {
      switch (btn) {
        case 'leftButton':
          this.updateSam_(Direction.WEST);
          break;
        case 'upButton':
          this.updateSam_(Direction.NORTH);
          break;
        case 'rightButton':
          this.updateSam_(Direction.EAST);
          break;
        case 'downButton':
          this.updateSam_(Direction.SOUTH);
          break;
      }
    }
  }
  
  // Display Sam's coordinates, with y inverted
  var centerX = this.sam.x + this.sam.width / 2;
  var centerY = this.studio_.MAZE_HEIGHT - (this.sam.y + this.sam.height / 2);
  this.studio_.scoreText = '(' + centerX + ', ' + centerY + ')';
  this.studio_.displayScore();
};

/**
 * Before moving, check if Sam would still be onscreen?
 * If move would take Sam offscreen, set dir to None
 */
SamBatLogic.prototype.updateSam_ = function (dir) {
  var centerX = this.sam.x + this.sam.width / 2;
  //invert Y
  var centerY = this.studio_.MAZE_HEIGHT - (this.sam.y + this.sam.height / 2);
  
  switch (dir) {
    case Direction.WEST:
      if (!this.onscreen(centerX - this.sam.speed, centerY)) {
        dir = Direction.NONE;
      }
      break;
    case Direction.NORTH:
      if (!this.onscreen(centerX, centerY + this.sam.speed)) {
        dir = Direction.NONE;
      }
      break;
    case Direction.EAST:
      if (!this.onscreen(centerX + this.sam.speed, centerY)) {
        dir = Direction.NONE;
      }
      break;
    case Direction.SOUTH:
      if (!this.onscreen(centerX, centerY - this.sam.speed)) {
        dir = Direction.NONE;
      }
      break;
  }
  this.studio_.moveSingle({spriteIndex: this.samIndex, dir: dir});
};

SamBatLogic.prototype.cacheBlock = function (key, block) {
  this.cached_[key] = block;
};

SamBatLogic.prototype.resolveCachedBlock_ = function (key) {
  var result = '';
  var block = this.cached_[key];
  if (!block) {
    return result;
  }

  var code = 'return ' + Blockly.JavaScript.blockToCode(block);
  result = codegen.evalWith(code, {
    Studio: api,
    Globals: Studio.Globals
  });
  return result;
};

/**
 * Calls the user provided onscreen? function, or no-op if none was provided.
 * @param {number} x Current x location of Sam
 * @param {number} y Current y location of Sam (optional)
 * @returns {boolean} True if coordinate is onscreen?
 */
SamBatLogic.prototype.onscreen = function (x, y) {
  return this.resolveCachedBlock_('VALUE')(x, y);
};

module.exports = SamBatLogic;
