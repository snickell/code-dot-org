/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Object representing a block blockSpace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSpace');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Trashcan');
goog.require('Blockly.Xml');
goog.require('goog.array');
goog.require('goog.math.Coordinate');

/**
 * Class for a BlockSpace.
 * @param {BlockSpaceEditor} blockSpaceEditor parent BlockSpaceEditor for this BlockSpace
 * @param {Function} getMetrics A function that returns size/scrolling metrics.
 * @param {Function} setMetrics A function that sets size/scrolling metrics.
 * @constructor
 */
Blockly.BlockSpace = function(blockSpaceEditor, getMetrics, setMetrics) {
  this.blockSpaceEditor = blockSpaceEditor;
  this.getMetrics = getMetrics;
  this.setMetrics = setMetrics;

  /** @type {boolean} */
  this.isFlyout = false;
  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];

  /**
   * @type {!Array.<!goog.math.Rect>}
   * @private
   */
  this.deleteAreas_ = [];

  /** @type {number} */
  this.maxBlocks = Infinity;

  /** @type {goog.events.EventTarget} */
  this.events = new goog.events.EventTarget();

  /**
   * @typedef {Object} panDragData
   * @property {EventTarget} target
   * @property {function} onTargetMouseDown
   * @property {bindData} mouseDownKey
   * @property {bindData} contextMenuBlockKey
   * @property {bindData} mouseMoveKey
   * @property {bindData} mouseUpKey
   * @property {number} startMouseX
   * @property {number} startMouseY
   * @property {Object} startMetrics
   * @property {number} startScrollX
   * @property {number} startScrollY
   */

  /**
   * Encapsulates state used to make pan-drag work.
   * @type {panDragData}
   * @private
   */
  this.panDragData_ = {};

  Blockly.ConnectionDB.init(this);
  if (Blockly.BlockSpace.DEBUG_EVENTS) {
    this.debugLogOnEvents();
  }
};

Blockly.BlockSpace.DEBUG_EVENTS = false;

Blockly.BlockSpace.EVENTS = {};

/**
 * Called after a blockspace has been populated with a set of blocks
 * (e.g. when using domToBlockSpace)
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.EVENT_BLOCKS_IMPORTED = 'blocksImported';

/**
 * Fired whenever blocklyBlockSpaceChange normally gets fired
 * @type {string}
 */
Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE = 'blockSpaceChange';

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.BlockSpace.SCAN_ANGLE = 3;

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.BlockSpace.prototype.xOffsetFromView = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.BlockSpace.prototype.yOffsetFromView = 0;

/**
 * The blockSpace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.BlockSpace.prototype.trashcan = null;

/**
 * PID of upcoming firing of a blockSpace change event.  Used to fire only one
 * event after multiple changes.
 * @type {?number}
 * @private
 */
Blockly.BlockSpace.prototype.fireChangeEventPid_ = null;

/**
 * PID of upcoming firing of a global change event.  Used to fire only one event
 * after multiple changes.
 * @type {?number}
 * @private
 */
var fireGlobalChangeEventPid_ = null;

/**
 * This blockSpace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.BlockSpace.prototype.scrollbarPair = null;

/**
 * Sets up debug console logging for events
 */
Blockly.BlockSpace.prototype.debugLogOnEvents = function() {
  goog.object.forEach(Blockly.BlockSpace.EVENTS, function(eventIdentifier, eventConstant) {
    this.events.listen(eventIdentifier, function(eventObject) {
      console.log(eventObject);
      console.log(eventConstant);
      console.log(eventIdentifier);
    }, false, this);
  }, this);
};

Blockly.BlockSpace.prototype.findFunction = function(functionName) {
  return goog.array.find(this.getTopBlocks(), function(block) {
    return goog.array.contains(Blockly.Procedures.DEFINITION_BLOCK_TYPES, block.type) &&
      Blockly.Names.equals(functionName, block.getTitleValue('NAME'))
  });
};

Blockly.BlockSpace.prototype.findFunctionExamples = function(functionName) {
  return goog.array.filter(this.getTopBlocks(), function(block) {
    if (Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE === block.type) {
      var actualBlock = block.getInputTargetBlock(Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
      return actualBlock &&
        Blockly.Names.equals(functionName, actualBlock.getTitleValue('NAME'));
    }
    return false;
  });
};

/**
 * Create the trash can elements.
 * @return {!Element} The blockSpace's SVG group.
 */
Blockly.BlockSpace.prototype.createDom = function() {
  /*
  <g>
    [Trashcan may go here]
    <g></g>
    <g></g>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {'class': 'svgGroup'}, null);
  this.clippingGroup_ = Blockly.createSvgElement('g', {'class': 'svgClippingGroup'}, this.svgGroup_);
  this.svgBlockCanvas_ = Blockly.createSvgElement('g', {'class': 'svgBlockCanvas'}, this.clippingGroup_);
  this.svgDragCanvas_ = Blockly.createSvgElement('g', {'class': 'svgDragCanvas'}, this.svgGroup_);
  this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {'class': 'svgBubbleCanvas'}, this.svgGroup_);
  this.fireChangeEvent();
  return this.svgGroup_;
};

/**
 * Moves element currently in this BlockSpace to the drag canvas group
 * @param {Element} blockSVGElement svg element to move to the drag group
 */
Blockly.BlockSpace.prototype.moveElementToDragCanvas = function(blockSVGElement) {
  this.getDragCanvas().appendChild(blockSVGElement);
};

/**
 * Moves element currently in this BlockSpace drag canvas back to the main canvas
 * @param {Element} blockSVGElement svg element to move to the main canvas
 */
Blockly.BlockSpace.prototype.moveElementToMainCanvas = function(blockSVGElement) {
  this.getCanvas().appendChild(blockSVGElement);
};

/**
 * Dispose of this blockSpace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.BlockSpace.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBlockCanvas_ = null;
  this.svgDragCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if (this.flyout_) {
    this.flyout_.dispose();
    this.flyout_ = null;
  }
  if (this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null;
  }
  if (this.scrollbarPair) {
    this.scrollbarPair.dispose();
    this.scrollbarPair = null;
  }
};

/**
 * Add a trashcan.
 */
Blockly.BlockSpace.prototype.addTrashcan = function() {
  if (Blockly.hasTrashcan && !Blockly.readOnly) {
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();
    this.svgBlockCanvas_.appendChild(svgTrashcan);
    this.trashcan.init();
  }
};

Blockly.BlockSpace.prototype.setTrashcan = function(trashcan) {
  this.trashcan = trashcan;
};

/**
 * Get the SVG element that wraps groups that should clip at the
 * blockspace view bounds.
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getClippingGroup = function() {
  return this.clippingGroup_;
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the drawing surface for dragged elements
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getDragCanvas = function () {
  return this.svgDragCanvas_;
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.BlockSpace.prototype.getBubbleCanvas = function() {
  return this.svgBubbleCanvas_;
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.BlockSpace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
  this.fireChangeEvent();
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.BlockSpace.prototype.removeTopBlock = function(block) {
  var found = false;
  for (var child, x = 0; child = this.topBlocks_[x]; x++) {
    if (child == block) {
      this.topBlocks_.splice(x, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    throw 'Block not present this blockSpace\'s list of top-most blocks.';
  }
  this.fireChangeEvent();
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} [ordered=false] Sort the list if true.
 * @param {boolean} [shareMainModal=true] Collate main/modal blockSpaces.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.BlockSpace.prototype.getTopBlocks = function(ordered, shareMainModal) {
  if (ordered === undefined ) {
    ordered = false;
  }
  if (shareMainModal === undefined ) {
    shareMainModal = true;
  }

  var blocks = [];
  if (shareMainModal && (this === Blockly.mainBlockSpace ||
      this === Blockly.modalBlockSpace)) {
    // Main + modal blockspaces share top blocks
    blocks = blocks.concat(Blockly.mainBlockSpace.topBlocks_)
      .concat(Blockly.modalBlockSpace ? Blockly.modalBlockSpace.topBlocks_ : []);
  } else {
    // Copy the topBlocks_ list.
    blocks = blocks.concat(this.topBlocks_);
  }
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(Blockly.BlockSpace.SCAN_ANGLE / 180 * Math.PI);
    if (Blockly.RTL) {
      offset *= -1;
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Find all visible blocks in this blockSpace.  No particular order.
 * Filters out blocks rendering in other workspaces and currently invisible
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.BlockSpace.prototype.getAllVisibleBlocks = function() {
  return goog.array.filter(this.getAllBlocks(), function(block) {
    return block.isUserVisible();
  });
};

/**
 * Find all blocks in this blockSpace.  No particular order.
 * @param {object} options
 * @param {boolean?} [options.shareMainModal]
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.BlockSpace.prototype.getAllBlocks = function(options) {
  options = options || {};
  var blocks = this.getTopBlocks(false, options.shareMainModal);
  for (var x = 0; x < blocks.length; x++) {
    blocks = blocks.concat(blocks[x].getChildren());
  }
  return blocks;
};

/**
 * Find all blocks this blockSpace.  No particular order.
 * @return {Number} Count of blocks.
 */
Blockly.BlockSpace.prototype.getBlockCount = function() {
  return this.getAllVisibleBlocks().length;
};

/**
 * Dispose of all blocks this blockSpace.
 */
Blockly.BlockSpace.prototype.clear = function() {
  this.blockSpaceEditor.hideChaff();
  while (this.topBlocks_.length) {
    this.topBlocks_[0].dispose();
  }
};

/**
 * Render all blocks this blockSpace.
 */
Blockly.BlockSpace.prototype.render = function() {
  var renderList = this.getAllBlocks();
  for (var x = 0, block; block = renderList[x]; x++) {
    if (!block.getChildren().length) {
      block.render();
    }
  }
};

/**
 * Finds the block with the specified ID in this blockSpace.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The matching block, or null if not found.
 */
Blockly.BlockSpace.prototype.getBlockById = function(id) {
  // If this O(n) function fails to scale well, maintain a hash table of IDs.
  var blocks = this.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    if (block.id == id) {
      return block;
    }
  }
  return null;
};

/**
 * Turn the visual trace functionality on or off.
 * @param {boolean} armed True if the trace should be on.
 */
Blockly.BlockSpace.prototype.traceOn = function(armed) {
  this.traceOn_ = armed;
  if (this.traceWrapper_) {
    Blockly.unbindEvent_(this.traceWrapper_);
    this.traceWrapper_ = null;
  }
  if (armed) {
    this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_,
        'blocklySelectChange', this, function() {this.traceOn_ = false});
  }
};

/**
 * Highlight a block in the blockSpace.
 * @param {?string} id ID of block to find.
 */
Blockly.BlockSpace.prototype.highlightBlock = function(id, spotlight) {
  if (!this.traceOn_ || Blockly.Block.isDragging()) {
    return;
  }
  var block = null;
  if (id) {
    block = this.getBlockById(id);
    if (!block) {
      return;
    }
  }
  // Temporary turn off the listener for selection changes, so that we don't
  // trip the monitor for detecting user activity.
  this.traceOn(false);
  // Select the current block.
  if (block) {
    block.select(spotlight);
  } else if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  // Restore the monitor for user activity.
  this.traceOn(true);
};

/**
 * Fire a change event for this blockSpace.  Changes include new block, dropdown
 * edits, mutations, connections, etc.  Groups of simultaneous changes (e.g.
 * a tree of blocks being deleted) are merged into one event.
 * Applications may hook blockSpace changes by listening for
 * 'blocklyBlockSpaceChange' on Blockly.mainBlockSpace.getCanvas().  To hook
 * changes across all blockSpaces, listen for 'workspaceChange' on window.
 */
Blockly.BlockSpace.prototype.fireChangeEvent = function() {
  if (this.fireChangeEventPid_) {
    window.clearTimeout(this.fireChangeEventPid_);
  }
  var canvas = this.svgBlockCanvas_;
  if (canvas) {
    var self = this;
    this.fireChangeEventPid_ = window.setTimeout(function() {
      self.events.dispatchEvent(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE);
      Blockly.fireUiEvent(canvas, 'blocklyBlockSpaceChange');
    }, 0);
  }

  if (fireGlobalChangeEventPid_) {
    window.clearTimeout(fireGlobalChangeEventPid_);
  }
  fireGlobalChangeEventPid_ = window.setTimeout(function () {
    Blockly.fireUiEvent(window, 'workspaceChange');
  }, 0);
};

/**
 * Paste the provided block onto the blockSpace.
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.BlockSpace.prototype.paste = function(clipboard) {
  var xmlBlock = clipboard.dom;
  // When pasting into a different block spaces, remove parameter blocks
  if (this !== clipboard.sourceBlockSpace) {
    if (xmlBlock.getAttribute('type') === 'parameters_get') {
      return;
    }
    goog.array.forEach(xmlBlock.getElementsByTagName('block'), function(block) {
      if (block.getAttribute('type') === 'parameters_get') {
        goog.dom.removeNode(block);
      }
    });
  }
  if (xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return;
  }
  var block = Blockly.Xml.domToBlock(this, xmlBlock);
  // Move the duplicate to original position.
  var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
  var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
  if (!isNaN(blockX) && !isNaN(blockY)) {
    if (Blockly.RTL) {
      blockX = -blockX;
    }
    // Offset block until not clobbering another block.
    do {
      var collide = false;
      var allBlocks = this.getAllBlocks();
      for (var x = 0, otherBlock; otherBlock = allBlocks[x]; x++) {
        var otherXY = otherBlock.getRelativeToSurfaceXY();
        if (Math.abs(blockX - otherXY.x) <= 1 &&
            Math.abs(blockY - otherXY.y) <= 1) {
          if (Blockly.RTL) {
            blockX -= Blockly.SNAP_RADIUS;
          } else {
            blockX += Blockly.SNAP_RADIUS;
          }
          blockY += Blockly.SNAP_RADIUS * 2;
          collide = true;
        }
      }
    } while (collide);
    block.moveBy(blockX, blockY);
  }
  block.setUserVisible(true);
  block.select();
};

/**
 * The number of blocks that may be added to the blockSpace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.BlockSpace.prototype.remainingCapacity = function() {
  if (this.maxBlocks == Infinity) {
    return Infinity;
  }
  return this.maxBlocks - this.getAllBlocks().length;
};

/**
* Make a list of all the delete areas for this blockSpace.
*/
Blockly.BlockSpace.prototype.recordDeleteAreas = function() {
  this.deleteAreas_ = [];

  if (this.trashcan) {
    goog.array.extend(this.deleteAreas_, this.trashcan.getRect());
    this.deleteAreaTrash_ = this.trashcan.getRect();
  } else {
    this.deleteAreaTrash_ = null;
  }

  if (this.flyout_) {
    goog.array.extend(this.deleteAreas_, this.flyout_.getRect());
  }

  if (this.blockSpaceEditor) {
    goog.array.extend(this.deleteAreas_,
        this.blockSpaceEditor.getDeleteAreas());
  }
};

/**
* Is the mouse event over a delete area?
* Shows the trash zone as a side effect.
* @param {!Event} e Mouse move event.
* @param {integer} startDragX The x coordinate of the drag start.
* @return {boolean} True if event is in a delete area.
*/
Blockly.BlockSpace.prototype.isDeleteArea = function(e, startDragX) {
  // If there is no toolbox and no flyout then there is no trash area.
  if (!Blockly.languageTree) {
    return false;
  }

  var mouseXY = Blockly.mouseToSvg(e, this.blockSpaceEditor.svg_);
  var xy = new goog.math.Coordinate(mouseXY.x, mouseXY.y);

  var mouseDragStartXY = Blockly.mouseCoordinatesToSvg(
    startDragX, 0, this.blockSpaceEditor.svg_);
  var dragStartXY = new goog.math.Coordinate(
    mouseDragStartXY.x, mouseDragStartXY.x);

  // Update trash can visual state
  // Might be nice to do this side-effect elsewhere.
  if (this.deleteAreaTrash_) {
    if (this.deleteAreaTrash_.contains(xy)) {
      this.trashcan.setOpen_(true);
    } else {
      this.trashcan.setOpen_(false);
    }
  }

  this.drawTrashZone(xy.x, dragStartXY.x);

  // Check against all delete areas
  for (var i = 0, area; area = this.deleteAreas_[i]; i++) {
    if (area.contains(xy)) {
      return true;
    }
  }

  this.blockSpaceEditor.setCursor(Blockly.Css.Cursor.CLOSED);

  return false;
};

/**
* Called when a drag event ends, to hide any delete UI.
*/
Blockly.BlockSpace.prototype.hideDelete = function() {
  var veryDistantX = Blockly.RTL ? -10000 : 10000;
  this.drawTrashZone(veryDistantX, 0);
};

/**
* Draws the trash zone over the toolbox/flyout, as the user drags an
* item towards it.
* @param {!Event} e Mouse move event.
* @param {integer} startDragX The x coordinate of the drag start.
* @return {boolean} True if event is in a delete area.
*/
Blockly.BlockSpace.prototype.drawTrashZone = function(x, startDragX) {
  var background;
  var blockGroup;
  var trashcan;
  var trashcanElement;
  var blockGroupForeground = null;

  // When in the function editor, we will rely on the grey rectangle and
  // trashcan image provided by the main blockspace underneath.
  var blockSpaceEditor = this.blockSpaceEditor.hideTrashRect_ ?
    Blockly.mainBlockSpaceEditor : this.blockSpaceEditor;

  if (this.blockSpaceEditor.toolbox) {
    var toolbox = blockSpaceEditor.toolbox;
    background = blockSpaceEditor.svgBackground_;
    blockGroup = toolbox.tree_.element_;
    trashcan = toolbox.trashcan;
    trashcanElement = toolbox.trashcanHolder;

    // When in the function editor there is a second copy of the
    // toolbox category names shown simultaneously.  It's in the foreground
    // and owned by the function editor's blockspace.  We'll fade that one too.
    if (this.blockSpaceEditor.hideTrashRect_) {
      blockGroupForeground = this.blockSpaceEditor.toolbox.tree_.element_;
    }
  } else {
    var flyout = blockSpaceEditor.flyout_;
    background = flyout.svgBackground_;
    blockGroup = flyout.blockSpace_.svgGroup_;
    trashcan = flyout.trashcan;
    trashcanElement = trashcan.svgGroup_;
  }

  var toolbarWidth = background.getBoundingClientRect().width;

  // The user can drag towards the trash zone a little bit before the zone
  // starts fading in.
  var dragBuffer = 10;

  // Has the user dragged the block a certain amount towards the trash zone?
  var pastThreshold = false;

  var xDifference;
  var trashZoneWidth;

  if (Blockly.RTL) {
    pastThreshold = x > startDragX + dragBuffer;
    var editorWidth = blockSpaceEditor.svg_.getBoundingClientRect().width;
    var canvasAreaWidth = editorWidth - toolbarWidth;
    xDifference = canvasAreaWidth - x;
    trashZoneWidth = canvasAreaWidth - startDragX - dragBuffer;
  } else {
    pastThreshold = x < startDragX - dragBuffer;
    xDifference = x - toolbarWidth;
    trashZoneWidth = startDragX - toolbarWidth - dragBuffer;
  }

  var normalIntensity = 1;

  // When dragging within this distance, we directly fade in the trash can.
  // When dragging from beyond this distance, we fade a little until we reach
  // this distance, and then we fade in the rest of the way from there.
  var INNER_TRASH_DISTANCE = 100;

  // The intensity when at the INNER_TRASH_DISTANCE during a long drag.
  var INNER_TRASH_NORMAL_INTENSITY = 0.8;
  var INNER_TRASH_TRASHCAN_INTENSITY = 1 - INNER_TRASH_NORMAL_INTENSITY;

  if (pastThreshold) {
    if (xDifference <= 0) {
      normalIntensity = 0;
      trashcan.setOpen_(true);
    } else {
      trashcan.setOpen_(false);
      if (xDifference >= trashZoneWidth) {
        normalIntensity = 1;
      } else if (trashZoneWidth < INNER_TRASH_DISTANCE) {
        // Short drag, just do a regular scale.
        normalIntensity = xDifference / trashZoneWidth;
      } else {
        // Long drag...
        if (xDifference < INNER_TRASH_DISTANCE)
        {
          // Last part of the drag:
          // fade normal blocks from mostly-visible to invisible.
          normalIntensity = xDifference / INNER_TRASH_DISTANCE *
            INNER_TRASH_NORMAL_INTENSITY;
        }
        else
        {
          // Initial part of the drag:
          // fade normal blocks from fully-visible to mostly-visible.
          normalIntensity = INNER_TRASH_NORMAL_INTENSITY +
            (xDifference - INNER_TRASH_DISTANCE) /
            (trashZoneWidth - INNER_TRASH_DISTANCE) *
            INNER_TRASH_TRASHCAN_INTENSITY;
        }
      }
    }
  }

  var trashIntensity = 1 - normalIntensity;

  var REGULAR_GREY = 0xdd;
  var TRASH_GREY = 0xaa;

  var r = Math.floor(trashIntensity * TRASH_GREY + normalIntensity * REGULAR_GREY);
  var g = Math.floor(trashIntensity * TRASH_GREY + normalIntensity * REGULAR_GREY);
  var b = Math.floor(trashIntensity * TRASH_GREY + normalIntensity * REGULAR_GREY);
  var rgbString = "rgb(" + r + ", " + g + ", " + b + ")";

  // Fade towards the new backround color.
  background.style["fill"] = rgbString;

  // Fade out the blocks in the flyout area.
  blockGroup.style["opacity"] = normalIntensity;

  if (blockGroupForeground) {
    blockGroupForeground.style["opacity"] = normalIntensity;
  }

  // Fade in the trash can.
  var trashcanDisplay = trashIntensity == 0 ? "none" : "block";
  trashcanElement.style["opacity"] = trashIntensity;
  trashcanElement.style["display"] = trashcanDisplay;
};

/**
 * Gives the logical size of the blockly workspace, currently defined as the
 * distance from the block-space origin to the far edge of the farthest block
 * in each scrollable direction (the workspace expands down and/or right to
 * accommodate content), never to be smaller than the blockspace viewport size.
 *
 * Gets used in calculations for scrolling and block bumping.
 *
 * @param {Object} metrics object with information about view and content
 *        dimensions, e.g. output of
 *        Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_
 * @param {number} metrics.contentLeft - distance from x=0 to left edge of
 *        bounding box around all blocks in the blockspace.
 * @param {number} metrics.contentWidth - width of the bounding box around all
 *        blocks in the blockspace.
 * @param {number} metrics.viewWidth - amount of horizontal blockspace that can
 *        be displayed at once.
 * @param {number} metrics.contentTop - distance from y=0 to top edge of bounding
 *        box around all blocks in the blockspace.
 * @param {number} metrics.contentHeight - height of the bounding box around all
 *        blocks in the blockspace.
 * @param {number} metrics.viewHeight - amount of vertical blockspace that can be
 *        displayed at once.
 * @returns {{width: number, height: number}}
 */
Blockly.BlockSpace.prototype.getScrollableSize = function(metrics) {
  var scrollbarPair = this.scrollbarPair;
  var canScrollHorizontally = scrollbarPair && scrollbarPair.canScrollHorizontally();
  var canScrollVertically = scrollbarPair && scrollbarPair.canScrollVertically();

  return {
    width: canScrollHorizontally ?
        Math.max(metrics.contentLeft + metrics.contentWidth, metrics.viewWidth) :
        metrics.viewWidth,
    height: canScrollVertically ?
        Math.max(metrics.contentTop + metrics.contentHeight, metrics.viewHeight) :
        metrics.viewHeight
  };
};

/**
 * Can be called to force an update of scrollbar height/position and usable
 * blockspace size according to the current content.
 */
Blockly.BlockSpace.prototype.updateScrollableSize = function () {
  if (this.scrollbarPair) {
    this.scrollbarPair.resize();
  }
};

/**
 * Establish a mousedown handler on the given dragTarget that will put the
 * blockspace into a pan-drag mode as long as the mouse is down.
 * @param {EventTarget} dragTarget - element that will begin pan-drag mode
 *        when directly clicked.
 * @param {function} [onDragTargetMouseDown] - optional function called when
 *        click on the drag target begins (used for hideChaff by BSE)
 */
Blockly.BlockSpace.prototype.bindBeginPanDragHandler = function (dragTarget,
    onDragTargetMouseDown) {
  this.unbindBeginPanDragHandler();
  this.panDragData_.target = dragTarget;
  this.panDragData_.onTargetMouseDown = onDragTargetMouseDown;
  this.panDragData_.mouseDownKey = Blockly.bindEvent_(
      dragTarget, 'mousedown', this, this.onPanDragTargetMouseDown_);

  // Also block the context menu on the pan-drag target element
  this.panDragData_.contextMenuBlockKey = Blockly.bindEvent_(
      dragTarget, 'contextmenu', null, Blockly.blockContextMenu);
};

/**
 * Unbinds previously bound handler to begin pan-drag.  Safe to call if no
 * such handler is bound.
 */
Blockly.BlockSpace.prototype.unbindBeginPanDragHandler = function () {
  if (this.panDragData_.mouseDownKey) {
    Blockly.unbindEvent_(this.panDragData_.mouseDownKey);
    this.panDragData_.mouseDownKey = null;
  }

  if (this.panDragData_.contextMenuBlockKey) {
    Blockly.unbindEvent_(this.panDragData_.contextMenuBlockKey);
    this.panDragData_.contextMenuBlockKey = null;
  }

  this.panDragData_.target = null;
};

/**
 * Binds temporary mousemove and mouseup handlers against window,
 * so that drag behavior and ending the drag work no matter where the cursor
 * goes after the initial mousedown.
 * @private
 */
Blockly.BlockSpace.prototype.bindDuringPanDragHandlers_ = function () {
  this.unbindDuringPanDragHandlers_();

  // We bind against "capture" (instead of the default "bubble") so that we
  // receive the event before the actual event target - pan-drag mode should
  // pretty much override everything.
  var onCapture = true;
  this.panDragData_.mouseMoveKey = Blockly.bindEvent_(
      window, 'mousemove', this, this.onPanDragMouseMove_, onCapture);
  this.panDragData_.mouseUpKey = Blockly.bindEvent_(
      window, 'mouseup', this, this.onPanDragMouseUp_, onCapture);
};

/**
 * Unbinds mousemove and mouseup handlers that only apply during pan-drag mode.
 * @private
 */
Blockly.BlockSpace.prototype.unbindDuringPanDragHandlers_ = function () {
  if (this.panDragData_.mouseMoveKey) {
    Blockly.unbindEvent_(this.panDragData_.mouseMoveKey);
    this.panDragData_.mouseMoveKey = null;
  }

  if (this.panDragData_.mouseUpKey) {
    Blockly.unbindEvent_(this.panDragData_.mouseUpKey);
    this.panDragData_.mouseUpKey = null;
  }
};

/**
 * When a mousedown event occurs over the pan-drag target, deselect blocks
 * and decide whether we can actually begin pan-drag mode.
 * @param {!Event} e
 * @private
 */
Blockly.BlockSpace.prototype.onPanDragTargetMouseDown_ = function (e) {
  if (this.panDragData_.onTargetMouseDown) {
    this.panDragData_.onTargetMouseDown();
  }

  var isClickDirectlyOnDragTarget = e.target && e.target === this.panDragData_.target;

  // Clicking on the flyout background clears the global selection
  if (Blockly.selected && !Blockly.readOnly && isClickDirectlyOnDragTarget) {
    Blockly.selected.unselect();
  }

  // On left-click on scrollable area, begin scroll-drag
  // In readonly mode, we scroll-drag when clicking through a block, too.
  if (this.scrollbarPair && !Blockly.isRightButton(e) &&
      (Blockly.readOnly || isClickDirectlyOnDragTarget)) {
    this.beginDragScroll_(e);

    // Don't click through to the workspace drag handler, or the browser
    // default drag/scroll handlers.
    e.stopPropagation();
    e.preventDefault();
  }
};

/**
 * Actually begin pan-drag mode.
 * @param {!Event} e
 * @private
 */
Blockly.BlockSpace.prototype.beginDragScroll_ = function (e) {
  // Record the current mouse position.
  this.panDragData_.startMouseX = e.clientX;
  this.panDragData_.startMouseY = e.clientY;
  this.panDragData_.startMetrics = this.getMetrics();
  this.panDragData_.startScrollX = this.xOffsetFromView;
  this.panDragData_.startScrollY = this.yOffsetFromView;

  this.bindDuringPanDragHandlers_();
};

/**
 * Mouse-move handler that is only bound and active during pan-drag mode
 * for this blockspace.  Causes scroll and stops the event.
 * @param {!Event} e
 * @private
 */
Blockly.BlockSpace.prototype.onPanDragMouseMove_ = function (e) {
  // Prevent text selection on page
  Blockly.removeAllRanges();

  var mouseDx = e.clientX - this.panDragData_.startMouseX; // + if mouse right
  var mouseDy = e.clientY - this.panDragData_.startMouseY; // + if mouse down
  var metrics = this.panDragData_.startMetrics;
  var blockSpaceSize = this.getScrollableSize(metrics);

  // New target scroll (x,y) offset
  var newScrollX = this.panDragData_.startScrollX + mouseDx; // new pan-right (+) position
  var newScrollY = this.panDragData_.startScrollY + mouseDy; // new pan-down (+) position

  // Don't allow panning past top left
  newScrollX = Math.min(newScrollX, 0);
  newScrollY = Math.min(newScrollY, 0);

  // Don't allow panning past bottom or right
  var furthestScrollAllowedX = -blockSpaceSize.width + metrics.viewWidth;
  var furthestScrollAllowedY = -blockSpaceSize.height + metrics.viewHeight;
  newScrollX = Math.max(newScrollX, furthestScrollAllowedX);
  newScrollY = Math.max(newScrollY, furthestScrollAllowedY);

  // Set the scrollbar position, which will auto-scroll the canvas
  this.scrollbarPair.set(-newScrollX, -newScrollY);

  e.stopPropagation();
  e.preventDefault();
};

/**
 * Mouse-up handler that is only bound and active during pan-drag mode
 * for this flyout.  Ends pan-drag mode.
 * @param {!Event} e
 * @private
 */
Blockly.BlockSpace.prototype.onPanDragMouseUp_ = function (e) {
  this.unbindDuringPanDragHandlers_();
  e.stopPropagation();
  e.preventDefault();
};
