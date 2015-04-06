/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var utils = require('../utils');
var markup = require('./NetSimSlider.html');
var i18n = require('../../locale/current/netsim');

/**
 * @type {number}
 * @const
 */
var SLIDER_DEFAULT_MIN_VALUE = 0;

/**
 * @type {number}
 * @const
 */
var SLIDER_DEFAULT_MAX_VALUE = 100;

/**
 *
 * @constructor
 * @param {jQuery} rootDiv - element whose content we replace with the slider
 *        on render()
 * @param {Object} options
 * @param {function} [options.onChange] - a function invoked whenever the
 *        slider-value is changed by the student.  Passed the new value as an
 *        argument.
 * @param {function} [options.onStop] - a function invoked only when the
 *        slider-handle is released by the student.  Passed the new value as an
 *        argument.
 * @param {number} [options.value] - Initial value of the slider.  Defaults to
 *        slider minimum value.
 * @param {number} [options.min] - Lowest possible value of the slider;
 *        next-to-lowest if lowerBoundInfinite is true.  Defaults to zero.
 * @param {number} [options.max] - Highest possible value of the slider;
 *        next-to-highest if upperBoundInfinite is true.  Defaults to 100.
 * @param {number} [options.step] - Step-value of jQueryUI slider - not
 *        necessarily related to min and max values if you provide custom value
 *        converters. Defaults to 1.
 * @param {boolean} [options.upperBoundInfinite] - if TRUE, the highest value
 *        on the slider will be Infinity/Unlimited.  Default FALSE.
 * @param {boolean} [options.lowerBoundInfinite] - if TRUE, the lowest value
 *        on the slider will be -Infinity/Unlimited.  Default FALSE.
 */
var NetSimSlider = module.exports = function (rootDiv, options) {
  /**
   * Unique instance ID for this panel, in case we have several
   * of them on a page.
   * @type {number}
   * @private
   */
  this.instanceID_ = NetSimSlider.uniqueIDCounter;
  NetSimSlider.uniqueIDCounter++;

  /**
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * A function invoked whenever the slider-value is changed by the student.
   * Passed the new value (not slider position) as an argument.
   * @type {function}
   * @private
   */
  this.changeCallback_ = utils.valueOr(options.onChange, function () {});

  /**
   * A function invoked only when the slider-handle is released by the student.
   * Passed the new value (not slider position) as an argument
   * @type {function}
   * @private
   */
  this.stopCallback_ = utils.valueOr(options.onStop, function () {});

  /**
   * @type {number}
   * @private
   */
  this.minValue_ = utils.valueOr(options.min, SLIDER_DEFAULT_MIN_VALUE);

  /**
   * @type {number}
   * @private
   */
  this.maxValue_ = utils.valueOr(options.max, SLIDER_DEFAULT_MAX_VALUE);

  /**
   * The current (outward-facing) value of the slider.
   * @type {number}
   * @private
   */
  this.value_ = utils.valueOr(options.value, this.minValue_);

  /**
   * Whether the slider maximum value should be Infinity.
   * @type {boolean}
   * @private
   */
  this.isUpperBoundInfinite_ = utils.valueOr(options.upperBoundInfinite, false);

  /**
   * Whether the slider minimimum value should be -Infinity.
   * @type {boolean}
   * @private
   */
  this.isLowerBoundInfinite_ = utils.valueOr(options.lowerBoundInfinite, false);

  /**
   * @type {number}
   * @private
   */
  this.step_ = utils.valueOr(options.step, 1);
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this component on the page
 * @type {number}
 */
NetSimSlider.uniqueIDCounter = 0;

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimSlider.prototype.render = function () {
  var minValue = this.isLowerBoundInfinite_ ? -Infinity : this.minValue_;
  var maxValue = this.isUpperBoundInfinite_ ? Infinity : this.maxValue_;
  var minPosition = this.valueToSliderPosition(minValue);
  var maxPosition = this.valueToSliderPosition(maxValue);

  var renderedMarkup = $(markup({
    instanceID: this.instanceID_,
    minValue: this.valueToShortLabel(minValue),
    maxValue: this.valueToShortLabel(maxValue)
  }));
  this.rootDiv_.html(renderedMarkup);

  this.rootDiv_.find('.slider')
      .slider({
        value: this.valueToSliderPosition(this.value_),
        min: minPosition,
        max: maxPosition,
        step: this.step_,
        slide: this.onSliderValueChange_.bind(this),
        stop: this.onSliderStop_.bind(this)
      });
  this.setLabelFromValue_(this.value_);
};

/**
 * External access to set the value of the slider.
 * @param {number} newValue
 */
NetSimSlider.prototype.setValue = function (newValue) {
  if (this.value_ === newValue) {
    return;
  }

  this.value_ = newValue;
  this.rootDiv_.find('.slider').slider('option', 'value',
      this.valueToSliderPosition(newValue));
  this.setLabelFromValue_(newValue);
};

/** @private */
NetSimSlider.prototype.onSliderValueChange_ = function (event, ui) {
  var newValue = this.sliderPositionToValue(ui.value);
  this.value_ = newValue;
  this.setLabelFromValue_(newValue);
  this.changeCallback_(newValue);
};

/** @private */
NetSimSlider.prototype.onSliderStop_ = function () {
  this.stopCallback_(this.value_);
};

/**
 * Updates the slider label to localize and display the given value.
 * @param {number} val - slider value to display
 * @private
 */
NetSimSlider.prototype.setLabelFromValue_ = function (val) {
  this.rootDiv_.find('.slider-value').text(this.valueToLabel(val));
};

/**
 * Converts the given value into an internal value we can pass to the
 * jQueryUI slider control.
 * @param {number} val - external-facing value
 * @returns {number} - internal slider value
 */
NetSimSlider.prototype.valueToSliderPosition = function (val) {
  if (this.isUpperBoundInfinite_ && val > this.maxValue_) {
    return this.valueToSliderPosition(this.maxValue_) + this.step_;
  } else if (this.isLowerBoundInfinite_ && val < this.minValue_) {
    return this.valueToSliderPosition(this.minValue_) - this.step_;
  }
  return Math.max(this.minValue_, Math.min(this.maxValue_, val));
};

/**
 * Converts the internal jQueryUI slider value into an external-facing
 * value for this control.
 * Should be an inverse of valueToSliderPosition
 * @param {number} pos - internal slider value
 * @returns {number} - external-facing value
 */
NetSimSlider.prototype.sliderPositionToValue = function (pos) {
  if (pos > this.valueToSliderPosition(this.maxValue_)) {
    return this.isUpperBoundInfinite_ ? Infinity : this.maxValue_;
  } else if (pos < this.valueToSliderPosition(this.minValue_)) {
    return this.isLowerBoundInfinite_ ? -Infinity : this.minValue_;
  }
  return pos;
};

/**
 * Converts an external-facing numeric value into a localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 */
NetSimSlider.prototype.valueToLabel = function (val) {
  if (val === Infinity || val === -Infinity) {
    return i18n.unlimited();
  }
  return val;
};

/**
 * Alternate label converter, used for slider end labels.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 */
NetSimSlider.prototype.valueToShortLabel = function (val) {
  return this.valueToLabel(val);
};

/**
 * Default minimum of zero is useless to a logarithmic scale
 * @type {number}
 * @const
 */
var LOGARITHMIC_DEFAULT_MIN_VALUE = 1;

/**
 * By default, a logarithmic scale slider increases by a factor of 2
 * every step.
 * @type {number}
 */
var LOGARITHMIC_DEFAULT_BASE = 2;

/**
 * @param {jQuery} rootDiv
 * @param {Object} options - takes NetSimSlider options, except:
 * @param {number} [options.min] - same as base slider, but defaults to 1.
 * @param {number} [options.logBase] - factor by which the value increases
 *        with every slider step.  Default base 2.
 * @constructor
 * @augments NetSimSlider
 */
NetSimSlider.LogarithmicSlider = function (rootDiv, options) {
  options.min = utils.valueOr(options.min, LOGARITHMIC_DEFAULT_MIN_VALUE);
  NetSimSlider.call(this, rootDiv, options);

  /**
   * Factor by which the value increases with every slider step.
   * @type {number}
   * @private
   */
  this.logBase_ = utils.valueOr(options.logBase, LOGARITHMIC_DEFAULT_BASE);

  /**
   * Precalculate natural log of our base value, because we'll use it a lot.
   * @type {number}
   * @private
   */
  this.lnLogBase_ = Math.log(this.logBase_);

  this.calculateSliderBounds_();
};
NetSimSlider.LogarithmicSlider.inherits(NetSimSlider);

/**
 * For the logarithmic slider, it's easiest to calculate the slider
 * boundary values once and use them later.
 * @private
 */
NetSimSlider.LogarithmicSlider.prototype.calculateSliderBounds_ = function () {
  // Pick boundary slider values
  this.maxSliderPosition = this.logFloor_(this.maxValue_);
  // Add a step if we don't already land exactly on a step, to
  // compensate for the floor() operation
  if (Math.pow(this.logBase_, this.maxSliderPosition) !== this.maxValue_) {
    this.maxSliderPosition += this.step_;
  }
  this.minSliderPosition = this.logFloor_(this.minValue_);

  // Pick infinity slider values
  this.infinitySliderPosition = this.maxSliderPosition + this.step_;
  this.negInfinitySliderPosition = this.minSliderPosition - this.step_;
};

/**
 * Cheater "floor(log_base_n(x))" method with a hacky workaround for
 * floating-point errors.  Uses the logarithmic base factor that the slider
 * is configured for (this.logBase_). Good enough for the slider.
 * @param {number} val
 * @returns {number}
 * @private
 */
NetSimSlider.LogarithmicSlider.prototype.logFloor_ = function (val) {
  // JavaScript floating-point math causes this logarithm calculation to
  // sometimes return slightly imprecise values. For example:
  // log(1000) / log(10) === 2.9999999999999996
  // Although we usually want to floor noninteger values, the above calculation
  // is supposed to come out as exactly 3.
  // The fudge factor below gives a threshold at which we will ceil() a result
  // rather than floor() it, to account for this imprecision.
  // The _right_ way to fix this is to use a better number type like BigDecimal,
  // but it's not really worth it for this use case.  Six digits is more than
  // enough precision for the slider when we're trying to work with whole
  // numbers anyway.
  var ceilThreshold = 0.0000001;
  return Math.floor(ceilThreshold + (Math.log(val) / this.lnLogBase_));
};

/**
 * Converts the given value into an internal value we can pass to the
 * jQueryUI slider control.
 * @param {number} val - external-facing value
 * @returns {number} - internal slider value
 * @override
 */
NetSimSlider.LogarithmicSlider.prototype.valueToSliderPosition = function (val) {
  if (val > this.maxValue_) {
    return this.isUpperBoundInfinite_ ?
        this.infinitySliderPosition : this.maxSliderPosition;
  } else if (val === this.maxValue_) {
    return  this.maxSliderPosition;
  } else if (val < this.minValue_) {
    return this.isLowerBoundInfinite_ ?
        this.negInfinitySliderPosition : this.minSliderPosition;
  } else if (val === this.minValue_) {
    return this.minSliderPosition;
  }
  return Math.max(this.minSliderPosition, this.logFloor_(val));
};

/**
 * Converts the internal jQueryUI slider value into an external-facing
 * value for this control.
 * Should be an inverse of valueToSliderPosition
 * @param {number} pos - internal slider value
 * @returns {number} - external-facing value
 * @override
 */
NetSimSlider.LogarithmicSlider.prototype.sliderPositionToValue = function (pos) {
  if (pos > this.maxSliderPosition) {
    return this.isUpperBoundInfinite_ ? Infinity : this.maxValue_;
  } else if (pos === this.maxSliderPosition) {
    return this.maxValue_;
  } else if (pos < this.minSliderPosition) {
    return this.isLowerBoundInfinite_ ? -Infinity : this.minValue_;
  } else if (pos === this.minSliderPosition) {
    return this.minValue_;
  }
  return Math.pow(this.logBase_, pos);
};
