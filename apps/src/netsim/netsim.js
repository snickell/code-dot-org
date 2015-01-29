/**
 * Internet Simulator
 *
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Internet Simulator app for Code.org.
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
*/
/* global -Blockly */
'use strict';

var dom = require('../dom');
var page = require('./page.html');
var utils = require('../utils');
var _ = utils.getLodash();
var NetSimConnection = require('./NetSimConnection');
var NetSimLogger = require('./NetSimLogger');
var DashboardUser = require('./DashboardUser');
var NetSimLobby = require('./NetSimLobby');
var RunLoop = require('./RunLoop');

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = function () {
  this.skin = null;
  this.level = null;
  this.heading = 0;

  /**
   * Current user object which asynchronously grabs the current user's
   * info from the dashboard API.
   * @type {DashboardUser}
   * @private
   */
  this.currentUser_ = DashboardUser.getCurrentUser();

  /**
   * Instance of logging API, gives us choke-point control over log output
   * @type {NetSimLogger}
   * @private
   */
  this.logger_ = new NetSimLogger(NetSimLogger.LogLevel.VERBOSE);

  /**
   * Manager for connection to shared instance of netsim app.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = null;
};

module.exports = NetSim;


/**
 *
 */
NetSim.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Handler for clicking on the send button in the middle of the screen.
 * This is a temporary handler for a temporary UI element - may get
 * torn out.
 * @private
 */
NetSim.prototype.onSendButtonClick_ = function () {
  // TODO (bbuchanan) : This is super hacky "hello world" stuff.  remove it.
  var now = new Date();
  var fromBox = document.getElementById('netsim_inputbox');
  var toBox = document.getElementById('netsim_recievelog');
  toBox.value += '[' + now.toTimeString() + '] ' + fromBox.value + '\n';
  toBox.scrollTop = toBox.scrollHeight;
};

/**
 * Hook up input handlers to controls on the netsim page
 * @private
 */
NetSim.prototype.attachHandlers_ = function () {
  dom.addClickTouchEvent(
      document.getElementById('netsim_sendbutton'),
      _.bind(this.onSendButtonClick_, this)
  );
};

/**
 * Called on page load.
 * @param {Object} config Requires the following members:
 *   skin: ???
 *   level: ???
 */
NetSim.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error("NetSim requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: require('./controls.html')({assetUrl: this.studioApp_.assetUrl})
    },
    hideRunButton: true
  });

  config.enableShowCode = false;
  config.loadAudio = _.bind(this.loadAudio_, this);

  // Override certain StudioApp methods - netsim does a lot of configuration
  // itself, because of its nonstandard layout.
  this.studioApp_.configureDom = _.bind(this.configureDomOverride_, this.studioApp_);
  this.studioApp_.onResize = _.bind(this.onResizeOverride_, this.studioApp_);

  this.studioApp_.init(config);

  this.attachHandlers_();

  // Create netsim lobby widget in page
  this.currentUser_.whenReady(_.bind(function () {
    // Do a deferred initialization of the connection object.
    // TODO: Use promises for this!
    this.connection_ = new NetSimConnection(this.currentUser_.name, this.logger_);
    this.logger_.log("Connection manager created.");
    var lobbyContainer = document.getElementById('netsim_lobby_container');
    this.lobbyUi_ = NetSimLobby.createWithin(lobbyContainer, this.connection_);

    // Begin run loop (will end when page unloads)
    var runLoop = new RunLoop();
    runLoop.tick.register(this, this.tick);
    runLoop.render.register(this, this.render);
    runLoop.begin();
  }, this));
};

/**
 * Recurring event for updating simulation logic
 * @param {RunLoop.Clock} clock - Elapsed time information
 */
NetSim.prototype.tick = function (clock) {
  this.connection_.tick(clock);
};

/**
 * Recurring event for rendering.  On modern browsers this will attempt to
 * sync to the browser repaint loop (hopefully 60fps), but on older
 * browsers it will fall back to a FALLBACK_FPS value
 * @param {RunLoop.Clock} clock - Elapsed time information
 */
NetSim.prototype.render = function (clock) {
};

/**
 * Load audio assets for this app
 * TODO (bbuchanan): Ought to pull this into an audio management module
 * @private
 */
NetSim.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Replaces StudioApp.configureDom.
 * Should be bound against StudioApp instance.
 * @param {Object} config Should at least contain
 *   containerId: ID of a parent DOM element for app content
 *   html: Content to put inside #containerId
 * @private
 */
NetSim.prototype.configureDomOverride_ = function (config) {
  var container = document.getElementById(config.containerId);
  container.innerHTML = config.html;
};

/**
 * Replaces StudioApp.onResize
 * Should be bound against StudioApp instance.
 * @private
 */
NetSim.prototype.onResizeOverride_ = function() {
  var div = document.getElementById('appcontainer');
  var divParent = div.parentNode;
  var parentStyle = window.getComputedStyle(divParent);
  var parentWidth = parseInt(parentStyle.width, 10);
  div.style.top = divParent.offsetTop + 'px';
  div.style.width = parentWidth + 'px';
};
