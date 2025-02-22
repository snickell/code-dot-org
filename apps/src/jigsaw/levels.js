var createToolbox = require('../block_utils').createToolbox;

var jigsawBlock = function (type, x, y, child, childType) {
  return jigsawBlockWithDeletableAttr(type, x, y, child, childType, true);
};

var undeletableJigsawBlock = function (type, x, y, child, childType) {
  return jigsawBlockWithDeletableAttr(type, x, y, child, childType, false);
};

var jigsawBlockWithDeletableAttr = function (
  type,
  x,
  y,
  child,
  childType,
  deletable
) {
  var childAttr = '';
  x = x || 0;
  y = y || 0;
  childType = childType || 'next';
  if (childType === 'statement') {
    childAttr = " name='child'";
  }
  // We add a static block ID to the first block in the lesson
  // so that we can validate whether or not it is clicked.
  return (
    '<block type="' +
    type +
    '" deletable="' +
    deletable +
    '"' +
    ' x="' +
    x +
    '"' +
    ' id="' +
    type +
    '"' +
    ' y="' +
    y +
    '">' +
    (child
      ? '<' + childType + childAttr + '>' + child + '</' + childType + '>'
      : '') +
    '</block>'
  );
};

/**
 * Validates whether puzzle has been successfully put together.
 *
 * @param {string[]} list of types
 * @param {number} options.level Level number
 * @Param {number} options.numBlocks How many blocks there are in the level
 */
var validateSimplePuzzle = function (types, options) {
  var numBlocks;
  if (types) {
    numBlocks = types.length;
  } else {
    var letters = '-ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var level = options.level;
    numBlocks = options.numBlocks;

    types = [];
    for (var i = 1; i <= numBlocks; i++) {
      types.push('jigsaw_' + level + letters[i]);
    }
  }

  var roots = Blockly.mainBlockSpace.getTopBlocks();
  if (roots.length !== 1) {
    return false;
  }

  var depth = 0;
  var block = roots[0];
  while (depth < numBlocks) {
    if (!block || block.type !== types[depth]) {
      return false;
    }
    var children = block.getChildren();
    if (children.length > 1) {
      return false;
    }
    block = children[0];
    depth++;
  }

  // last block shouldnt have children
  if (block !== undefined) {
    return false;
  }

  return true;
};

/*
 * Configuration for all levels.
 */

module.exports = {
  1: {
    instructionsIcon: 'apple',
    isK1: true,
    image: {
      name: 'apple',
      width: 200,
      height: 200,
    },
    backgroundHSV: [41, 1.0, 0.969],
    numBlocks: 1,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function () {
        return Jigsaw.block1Clicked;
      },
    },
    startBlocks: undeletableJigsawBlock('jigsaw_1A', 20, 20),
  },
  2: {
    instructionsIcon: 'smiley',
    isK1: true,
    instructionsImportant: true,
    image: {
      name: 'smiley',
      width: 200,
      height: 200,
    },
    backgroundHSV: [184, 1.0, 0.733],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 1,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function () {
        // need to be finished drag
        if (Blockly.mainBlockSpace.dragMode) {
          return false;
        }
        var pos = Blockly.mainBlockSpace
          .getAllBlocks()[0]
          .getRelativeToSurfaceXY();
        // how close to ghost?
        var dx = Math.abs(400 - pos.x);
        var dy = Math.abs(100 - pos.y);
        return dx + dy < 80;
      },
    },
    startBlocks: undeletableJigsawBlock('jigsaw_2A', 20, 20),
  },
  3: {
    instructionsIcon: 'snail',
    isK1: true,
    image: {
      name: 'snail',
      width: 200,
      height: 200,
    },
    backgroundHSV: [36, 1.0, 0.999],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 2,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 3, numBlocks: 2});
      },
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_3A', 380, 80) +
      undeletableJigsawBlock('jigsaw_3B', 100, 220),
  },

  4: {
    instructionsIcon: 'elephant',
    isK1: true,
    image: {
      name: 'elephant',
      width: 200,
      height: 200,
    },
    backgroundHSV: [320, 0.6, 0.999],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 2,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 4, numBlocks: 2});
      },
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_4A', 100, 140) +
      undeletableJigsawBlock('jigsaw_4B', 380, 180),
  },

  5: {
    instructionsIcon: 'fish',
    isK1: true,
    image: {
      name: 'fish',
      width: 200,
      height: 200,
    },
    backgroundHSV: [209, 0.66, 0.59],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 5, numBlocks: 3});
      },
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_5A', 100, 20) +
      undeletableJigsawBlock('jigsaw_5B', 100, 140) +
      undeletableJigsawBlock('jigsaw_5C', 100, 280),
  },

  6: {
    instructionsIcon: 'doggie',
    isK1: true,
    image: {
      name: 'doggie',
      width: 200,
      height: 200,
    },
    backgroundHSV: [25, 0.87, 0.96],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 6, numBlocks: 3});
      },
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_6B', 100, 20) +
      undeletableJigsawBlock('jigsaw_6A', 100, 140) +
      undeletableJigsawBlock('jigsaw_6C', 100, 280),
  },

  7: {
    instructionsIcon: 'tree',
    isK1: true,
    image: {
      name: 'tree',
      width: 200,
      height: 200,
    },
    backgroundHSV: [238, 0.51, 0.999],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 7, numBlocks: 3});
      },
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_7B', 100, 20) +
      undeletableJigsawBlock('jigsaw_7A', 100, 140) +
      undeletableJigsawBlock('jigsaw_7C', 100, 280),
  },

  8: {
    instructionsIcon: 'flower',
    isK1: true,
    image: {
      name: 'flower',
      width: 200,
      height: 200,
    },
    backgroundHSV: [75, 0.8, 0.999],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 8, numBlocks: 3});
      },
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_8C', 100, 20) +
      undeletableJigsawBlock('jigsaw_8B', 100, 140) +
      undeletableJigsawBlock('jigsaw_8A', 100, 280),
  },

  9: {
    instructionsIcon: 'house',
    isK1: true,
    image: {
      name: 'house',
      width: 200,
      height: 200,
    },
    backgroundHSV: [110, 0.56, 0.6],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 9, numBlocks: 3});
      },
    },
    startBlocks: undeletableJigsawBlock(
      'jigsaw_9B',
      100,
      20,
      undeletableJigsawBlock(
        'jigsaw_9C',
        0,
        0,
        undeletableJigsawBlock('jigsaw_9A', 0, 0)
      )
    ),
  },

  10: {
    instructionsIcon: 'computer',
    isK1: true,
    image: {
      name: 'computer',
      width: 200,
      height: 200,
    },
    backgroundHSV: [300, 0.25, 0.8],
    ghost: {
      x: 380,
      y: 80,
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 10, numBlocks: 3});
      },
    },
    startBlocks: undeletableJigsawBlock(
      'jigsaw_10A',
      100,
      20,
      undeletableJigsawBlock(
        'jigsaw_10C',
        0,
        0,
        undeletableJigsawBlock('jigsaw_10B', 0, 0)
      )
    ),
  },

  11: {
    instructionsIcon: 'blocks',
    isK1: true,
    image: {
      name: 'blocks',
      width: 115,
      height: 233,
    },
    ghost: {
      x: 170,
      y: 56,
    },
    numBlocks: 0,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: false,
    snapRadius: 30,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(
          ['jigsaw_purple', 'jigsaw_blue', 'jigsaw_green'],
          {}
        );
      },
    },
    startBlocks: undeletableJigsawBlock(
      'jigsaw_purple',
      0,
      40,
      undeletableJigsawBlock('jigsaw_blue')
    ),
    toolbox: createToolbox(jigsawBlock('jigsaw_green')),
  },

  12: {
    instructionsIcon: 'blocks',
    isK1: true,
    image: {
      name: 'blocks',
      width: 115,
      height: 233,
    },
    ghost: {
      x: 94,
      y: 94,
    },
    numBlocks: 0,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: false,
    snapRadius: 30,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(
          ['jigsaw_purple', 'jigsaw_blue', 'jigsaw_green'],
          {}
        );
      },
    },
    startBlocks: '',
    toolbox: createToolbox(
      jigsawBlock('jigsaw_green') +
        jigsawBlock('jigsaw_purple') +
        jigsawBlock('jigsaw_blue')
    ),
  },

  // assessment
  13: {
    instructionsIcon: 'doggie',
    isK1: true,
    image: {
      name: 'doggie',
      width: 200,
      height: 200,
    },
    ghost: {
      x: 380,
      y: 80,
    },
    backgroundHSV: [25, 0.87, 0.96],
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 13, numBlocks: 3});
      },
    },
    startBlocks: jigsawBlock(
      'jigsaw_13C',
      100,
      20,
      jigsawBlock('jigsaw_13B', 0, 0, jigsawBlock('jigsaw_13A', 0, 0))
    ),
  },
};
