/**
 * @file Core implementation of Applab commands related to the Chart design element.
 *
 * For now, uses Google charts.
 * @see {GoogleChart}
 */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 6,
 maxstatements: 200
 */
'use strict';

var AppStorage = require('./appStorage');
var Promise = require('es6-promise').Promise;
var GoogleChart = require('./GoogleChart');

/**
 * API for requesting/generating charts in Applab.
 *
 * @constructor
 * @param {Document} [docContext] - default is 'document'
 * @param [appStorage] - default is AppStorage
 */
var ChartApi = module.exports = function (docContext, appStorage) {
  this.document_ = docContext || document;
  this.appStorage_ = appStorage || AppStorage;

  /**
   * List of all warnings generated while performing operations through this
   * API instance.
   * @type {Error[]}
   */
  this.warnings = [];
};

// When adding a new type, provide an entry in the string enum (for clean code)
// and an entry in the TypeNameToType map (allows us to easily remap different
// implementations to the same type name).

/** @enum {string} */
ChartApi.ChartType = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  SCATTER: 'scatter'
};

/** @type {Object.<string, GoogleChart>} */
ChartApi.TypeNameToType = {
  'bar': GoogleChart.MaterialBarChart,
  'pie': GoogleChart.PieChart,
  'line': GoogleChart.MaterialLineChart,
  'scatter': GoogleChart.MaterialScatterChart
};

/**
 * Get an array of all the chart type strings.
 * @returns {string[]}
 */
ChartApi.getChartTypeNames = function () {
  return Object.getOwnPropertyNames(ChartApi.TypeNameToType);
};

/**
 * @param {ChartType} chartType
 * @returns {boolean} TRUE if the given type is in the known list of chart types.
 */
ChartApi.supportsType = function (chartType) {
  return ChartApi.getChartTypeNames().indexOf(chartType.toLowerCase()) !== -1;
};

/**
 * @return {string[]} a quoted, sorted list of chart types for use in the
 *         Droplet parameter dropdown.
 */
ChartApi.getChartTypeDropdown = function () {
  return ChartApi.getChartTypeNames().map(quote).sort();
};

function quote(str) {
  return '"' + str + '"';
}

/**
 * Render a chart into an Applab chart element.
 * @param {string} chartId - ID of the destination chart element.
 * @param {ChartType} chartType - Desired chart type.
 * @param {Object[]} chartData - Data to populate the chart.
 * @param {Object} options - passed through to the API.
 * @returns {Promise} which resolves when the chart has been rendered, or
 *          rejects if there are any problems along the way.
 */
ChartApi.prototype.drawChart = function (chartId, chartType, chartData, options) {
  try {
    var chart = this.createChart_(chartId, chartType);
    chart.loadData(chartData).then(function () {
      return chart.drawChart(options);
    }).then(function () {
      this.mergeWarnings_(chart.warnings);
    }.bind(this));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Render a chart into an Applab chart element using data from an AppStorage
 * API table.
 * @param {string} chartId - ID of the destination chart element.
 * @param {ChartType} chartType - Desired chart type.
 * @param {string} tableName - AppStorage API table name to source data from
 *                 for the chart.
 * @param {string[]} columns - Columns to use from the table data for the chart,
 *        in order (required order dependent on chart type).
 * @param {Object} options - passed through to the API.
 * @returns {Promise} resolves when the chart has been rendered, or rejects if
 *          there are any problems along the way.
 */
ChartApi.prototype.drawChartFromRecords = function (chartId, chartType,
    tableName, columns, options) {
  try {
    var chart = this.createChart_(chartId, chartType);
    return Promise.all([
      chart.loadDependencies(),
      this.fetchTableData_(tableName)
    ]).then(function (results) {
      return chart.loadData(results[1], columns);
    }).then(function () {
      return chart.drawChart(options);
    }).then(function () {
      this.mergeWarnings_(chart.warnings);
    }.bind(this));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Add warnings from an array to the ChartApi instance's warnings array.
 * @param {Error[]} newWarnings
 * @private
 */
ChartApi.prototype.mergeWarnings_ = function (newWarnings) {
  Array.prototype.push.apply(this.warnings, newWarnings);
};

/**
 * Create a chart object of the requested type, for the requested target element.
 * @param {string} elementId
 * @param {string} typeName
 * @returns {GoogleChart}
 * @throws {Error} if target element or chart type are not found.
 * @private
 */
ChartApi.prototype.createChart_ = function (elementId, typeName) {
  var targetElement = this.getTargetElement_(elementId);
  var FoundType = ChartApi.getChartTypeByName_(typeName);
  return new FoundType(targetElement);
};

/**
 * Get the DOM Element with the given ID.
 * @param {string} elementId
 * @returns {Element}
 * @throws {Error} if the requested element is not found, or is not a div.
 * @private
 */
ChartApi.prototype.getTargetElement_ = function (elementId) {
  var targetElement = this.document_.getElementById(elementId);
  if (!targetElement || 'div' !== targetElement.tagName.toLowerCase()) {
    throw new Error('Unable to render chart into element "' + elementId + '".');
  }
  return targetElement;
};

/**
 * Get the constructor function for the requested chart type.
 * @param {string} typeName
 * @returns {GoogleChart}
 * @throws {Error} if requested type is not found/supported.
 * @private
 */
ChartApi.getChartTypeByName_= function (typeName) {
  if (typeof typeName !== 'string') {
    throw new Error('Unknown chart type.');
  }

  var type = ChartApi.TypeNameToType[typeName.toLowerCase()];
  if (!type) {
    throw new Error('Unsupported chart type "' + typeName + '".');
  }

  return type;
};

/**
 * Get all data from the requested table.
 * Wraps AppStorage.readRecords in an ES6 Promise interface.
 * @param {string} tableName
 * @returns {Promise}
 * @private
 */
ChartApi.prototype.fetchTableData_ = function (tableName) {
  return new Promise(function (resolve, reject) {
    this.appStorage_.readRecords(tableName, {}, resolve, function (errorMsg) {
      reject(new Error(errorMsg));
    });
  }.bind(this));
};
