/** @file Game Lab constants */
var utils = require('../utils');

/** @enum {string} */
module.exports.GameLabInterfaceMode = utils.makeEnum('CODE', 'ANIMATION');

module.exports.LocationPickerMode = utils.makeEnum('IDLE', 'SELECTING');

/** @const {number} */
module.exports.GAME_WIDTH = 400;

/** @const {number} */
module.exports.GAME_HEIGHT = 400;

/** @const {string} */
module.exports.GAMELAB_DPAD_CONTAINER_ID = 'studio-dpad-container';

/**
 * DataURL for a 1x1 transparent gif image.
 * @const {string}
 */
module.exports.EMPTY_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

module.exports.PlayBehavior = utils.makeEnum('ALWAYS_PLAY', 'NEVER_PLAY');

module.exports.AllAnimationsCategory = 'category_all';

module.exports.AnimationCategories = {
  category_animals: 'Animals',
  category_backgrounds: 'Backgrounds',
  category_generic_items: 'Generic items',
  category_vehicles: 'Vehicles',
  category_characters: 'Characters',
  category_environment: 'Environment',
  category_food: 'Food',
  category_tools: 'Tools',
  category_gameplay: 'Board games',
  category_music: 'Music',
  category_obstacles: 'Obstacles',
  category_all: 'All'
};

module.exports.SpritelabReservedWords = [
  // Gamelab globals
  'CENTER',
  'World',
  'background',
  'createEdgeSprites',
  'createGroup',
  'createSprite',
  'drawSprites',
  'edges',
  'fill',
  'keyDown',
  'keyWentDown',
  'keyWentUp',
  'mousePressedOver',
  'mouseWentDown',
  'randomNumber',
  'rect',
  'text',
  'textAlign',
  'textSize',
  // GamelabJr.interpreted.js
  'inputEvents',
  'touchEvents',
  'collisionEvents',
  'callbacks',
  'loops',
  'sprites',
  'score',
  'game_over',
  'show_score',
  'title',
  'subTitle',
  'initialize',
  'addBehavior',
  'addBehaviorSimple',
  'removeBehavior',
  'removeBehaviorSimple',
  'Behavior',
  'normalizeBehavior',
  'findBehavior',
  'behaviorsEqual',
  'whenUpArrow',
  'whenDownArrow',
  'whenLeftArrow',
  'whenRightArrow',
  'whenSpace',
  'whileUpArrow',
  'whileDownArrow',
  'whileLeftArrow',
  'whileRightArrow',
  'whileSpace',
  'whenMouseClicked',
  'whenPressedAndReleased',
  'clickedOn',
  'spriteDestroyed',
  'whenTouching',
  'whileTouching',
  'whenStartAndStopTouching',
  'repeatWhile',
  'forever',
  'register',
  'makeNewSpriteLocation',
  'setAnimation',
  'makeNewSprite',
  'makeNewGroup',
  'setProp',
  'getProp',
  'changePropBy',
  'getDirection',
  'moveForward',
  'jumpTo',
  'mirrorSprite',
  'turn',
  'debugSprite',
  'randomLoc',
  'setBackground',
  'showScore',
  'endGame',
  'isDestroyed',
  'showTitleScreen',
  'hideTitleScreen',
  'shouldUpdate',
  'moveInDirection',
  'unitVectorTowards',
  'draw',
  // Blocks
  'addBehaviorUntil',
  'beginBehavior',
  'bounceOff',
  'bounceOffEdges',
  'changeColor',
  'changeColorBy',
  'comment',
  'createNewSprite',
  'distance',
  'draggable',
  'edgesDisplace',
  'enableDebug',
  'getAnim',
  'getFrameDelay',
  'getThisSprite',
  'hasBehavior',
  'hsbColor',
  'isTouchingEdges',
  'joystickDirection',
  'locationAdd',
  'locationAt',
  'locationConstant',
  'locationDelta',
  'locationEast',
  'locationMouse',
  'locationNorth',
  'locationOf',
  'locationSouth',
  'locationWest',
  'mixColors',
  'moveInDirection2',
  'pointInDirection',
  'pointToward',
  'randColor',
  'randomColor',
  'randomLocation',
  'removeAllBehaviors',
  'setDirection',
  'setFrameDelay',
  'setSizes',
  'setupSim',
  'spriteCostume',
  'spriteDirection',
  'spritesWhere',
  'spritesWhereFirst',
  'spritesWhereGenerator',
  'spritesWhereLast',
  'spritesWhereRandom',
  'whenDownArrow',
  'whenJoystick',
  'whenKey',
  'whenLeftArrow',
  'whenRightArrow',
  'whenTouchingAny',
  'whenTrue',
  'whenUpArrow',
  'whileDownArrow',
  'whileJoystick',
  'whileKey',
  'whileLeftArrow',
  'whileRightArrow',
  'whileUpArrow',
  'xLocationOf',
  'yLocationOf'
];
