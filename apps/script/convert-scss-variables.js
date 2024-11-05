#!/usr/bin/env node

var path = require('path');
var convertScssToJs = require(path.resolve(
  '../tools/scripts/convertScssToJs.js'
));

convertScssToJs(
  require.resolve('@code-dot-org/css-poc/color.scss'),
  path.resolve('./src/util/color.js')
);
convertScssToJs(
  path.resolve('../shared/css/style-constants.scss'),
  path.resolve('./src/styleConstants.js')
);
convertScssToJs(
  require.resolve('@code-dot-org/css-poc/font.scss'),
  path.resolve('./src/fontConstants.js')
);
