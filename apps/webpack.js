var _ = require('lodash');
var webpack = require('webpack');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var envConstants = require('./envConstants');

// Our base config, on which other configs are derived
var baseConfig = {
  resolve: {
    extensions: ["", ".js", ".jsx"],
    alias: {
      '@cdo/apps': path.resolve(__dirname, 'src'),
    }
  },
  externals: {
    "johnny-five": "var JohnnyFive",
    "playground-io": "var PlaygroundIO",
    "chrome-serialport": "var ChromeSerialport",
    "marked": "var marked",
    "blockly": "this Blockly",
    "react": "var React",
    "react-dom": "var ReactDOM",
    "jquery": "var $"
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'},
      {test: /\.ejs$/, loader: 'ejs-compiled'},
    ],
    preLoaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(__dirname, 'node_modules', '@cdo'),
        ],
        exclude: [
          path.resolve(__dirname, 'src', 'lodash.js'),
        ],
        loader: "babel",
        query: {
          cacheDirectory: true,
          sourceMaps: true,
        }
      },
    ],
  },
};

// modify baseConfig's preLoaders if looking for code coverage info
if (envConstants.COVERAGE) {
  baseConfig.module.preLoaders = [
    {
      test: /\.jsx?$/,
      include: [
        path.resolve(__dirname, 'test'),
        path.resolve(__dirname, 'node_modules', '@cdo'),
      ],
      loader: "babel",
      query: {
        cacheDirectory: true,
      }
    }, {
      test: /\.jsx?$/,
      loader: 'babel-istanbul',
      include: path.resolve(__dirname, 'src'),
      exclude: [
        path.resolve(__dirname, 'src', 'lodash.js'),
      ],
      query: {
        cacheDirectory: true,
      }
    },
  ];
}

// config for our test runner
var karmaConfig = _.extend({}, baseConfig, {
  devtool: 'inline-source-map',
  externals: {
    "johnny-five": "var JohnnyFive",
    "playground-io": "var PlaygroundIO",
    "chrome-serialport": "var ChromeSerialport",
    "blockly": "this Blockly",

    // The below are necessary for enzyme to work.
    // See https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
    "cheerio": "window",
    "react/addons": true,
    "react/lib/ExecutionEnvironment": true,
    "react/lib/ReactContext": true
  },
  plugins: [
    new webpack.ProvidePlugin({React: 'react'}),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(true),
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
      BUILD_STYLEGUIDE: JSON.stringify(true),
      PISKEL_DEVELOPMENT_MODE: false
    }),
  ]
});

/**
 * Generate the appropriate webpack config based off of our base config and
 * some input options
 * @param {object} options
 * @param {string} options.output
 * @param {string[]} options.entries - list of input source files
 * @param {object[]} options.chunks - list of chunk info objects
 * @param {bool} options.minify
 * @param {bool} options.watch
 * @param {string} options.piskelDevMode
 */
function create(options) {
  var outputDir = options.output;
  var entries = options.entries;
  var chunks = options.chunks;
  var minify = options.minify;
  var watch = options.watch;
  var piskelDevMode = options.piskelDevMode;

  var config = _.extend({}, baseConfig, {
    output: {
      path: outputDir,
      filename: "[name]." + (minify ? "min." : "") + "js",
    },
    devtool: options.minify ? 'source-map' : 'cheap-module-eval-source-map',
    entry: entries,
    plugins: [
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
        BUILD_STYLEGUIDE: JSON.stringify(false),
        PISKEL_DEVELOPMENT_MODE: piskelDevMode
      })
    ].concat(chunks.map(function (chunkInfo) {
      return new webpack.optimize.CommonsChunkPlugin({
        name: chunkInfo.name,
        chunks: chunkInfo.chunks,
        minChunks: 2
      });
    })),
    watch: watch,
    keepalive: watch,
    failOnError: !watch
  });

  if (minify) {
    config.plugins = config.plugins.concat(
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      })
    );
  }

  if (watch) {
    config.plugins = config.plugins.concat(
      new LiveReloadPlugin({
        appendScriptTag: envConstants.AUTO_RELOAD
      })
    );
  }

  return config;
}


module.exports = {
  config: baseConfig,
  karmaConfig: karmaConfig,
  create: create
};
