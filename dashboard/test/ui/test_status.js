// Scripts that operate the test status page.  We expect the page to be
// prepopulated with tables listing all of the tests we are going to run
// (see runner.rb and test_status.haml for how this happens) but the actual
// status of those tests we retrieve asynchronously from a server API
// (see test_status_controller.rb) which in turn gets its information from the
// uploaded S3 logs and their metadata.

// Lodash gets provided on test_status.html
/* global _ */

// Grab DOM references
var lastRefreshTimeLabel = document.querySelector('#last-refresh-time');
var refreshButton = document.querySelector('#refresh-button');
var autoRefreshButton = document.querySelector('#auto-refresh-button');

// Gather metadata for the run
var gitBranch = document.querySelector('#git-branch').dataset.branch;
var commitHash = document.querySelector('#commit-hash').dataset.hash;
var startTime = new Date(document.querySelector('#start-time').textContent);

var lastRefreshTime = startTime;

const GRAY = '#dddddd';
const RED = '#ff8888';
const GREEN = '#78ea78';

const STATUS_PENDING = 'PENDING';
const STATUS_FAILED = 'FAILED';
const STATUS_SUCCEEDED = 'SUCCEEDED';

function Test(fromRow) {
  /** @type {HTMLRowElement} */
  this.row = fromRow;


  /** @type {string} */
  this.browser = (typeof this.row.dataset.browser === 'string') ?
      this.row.dataset.browser : 'UnknownBrowser';

  /** @type {string} */
  this.feature = this.row.dataset.feature;

  /** @type {string} */
  this.versionId = null;

  /** @type {number} */
  this.attempt = 0;

  /** @type {boolean} */
  this.success = false;

  /** @type {number} in seconds */
  this.duration = 0;

  /** @private {string} */
  this.status_ = STATUS_PENDING;

  /** @private {Date} */
  this.lastModified_ = null;

  /** @private {boolean} */
  this.isUpdating_ = false;

  // Do an intitial render to put everything in a consistent state.
  this.updateView();
}

Test.prototype.setLastModified = function (lastModified) {
  // Do no updating if things haven't changed.
  if (this.lastModified_ && lastModified <= this.lastModified_) {
    return;
  }

  this.lastModified_ = lastModified;
  if (lastModified > startTime && this.status_ !== STATUS_SUCCEEDED) {
    this.fetchStatus();
  } else {
    this.updateView();
  }
};

Test.prototype.fetchStatus = function () {
  this.isUpdating_ = true;
  this.updateView();
  const ensure = () => {
    this.isUpdating_ = false;
    this.updateView();
  };

  fetch("/api/v1/test_logs/" + this.s3Key(), {mode: 'no-cors'})
    .then(response => response.json())
    .then(json => {
      if (json.commit === commitHash) {
        this.versionId = json.version_id;
        this.attempt = parseInt(json.attempt, 10);
        this.success = json.success === 'true';
        this.duration = parseInt(json.duration, 10);
        this.status_ = this.success ? STATUS_SUCCEEDED : STATUS_FAILED;
      }
    })
    .then(ensure, ensure);
};

Test.prototype.updateView = function () {
  const succeeded = this.status_ === STATUS_SUCCEEDED;
  const failed = this.status_ === STATUS_FAILED;

  // Get references to row elements
  let row = this.row;
  let statusCell = row.querySelector('.status');
  let logLinkCell = row.querySelector('.log-link');

  // Update row appearance
  if (succeeded || failed) {
    row.style.backgroundColor = succeeded ? GREEN : RED;
    statusCell.innerHTML = (succeeded ? 'Succeeded' : 'Failed') +
        ` in ${Math.round(this.duration)} seconds` +
        (this.attempt > 0 ? ` on retry #${this.attempt}` : '');
    logLinkCell.innerHTML = `<a href="${this.publicLogUrl()}">Log on S3</a>`;
  } else {
    row.style.backgroundColor = GRAY;
    statusCell.innerHTML = '';
    logLinkCell.innerHTML = '';
  }

  if (this.isUpdating_) {
    statusCell.innerHTML += " (Updating)";
  }

  // Call debounced global progress update
  updateProgress && updateProgress();
};

Test.prototype.s3Key = function () {
  const featureRegex = /features\/(.*)\.feature/i;
  let result = featureRegex.exec(this.feature);
  let featureName = result[1].replace('/', '_');
  return `${gitBranch}/${this.browser}_${featureName}_output.html`;
};

Test.prototype.publicLogUrl = function () {
  return `https://cucumber-logs.s3.amazonaws.com/${this.s3Key()}?versionId=${this.versionId}`;
};

// Build a cache of tests for this run.
var tests = {};
var rows = document.querySelectorAll('tbody tr');
rows.forEach(row => {
  let test = new Test(row);
  tests[test.browser] = tests[test.browser] || {};
  tests[test.browser][test.feature] = test;
});

function testFromS3Key(key) {
  var re = /[^/]+\/([^_]+)_(.*)_output\.html/i;
  var result = re.exec(key);
  var browser = result[1]; // TODO: Handle slashes
  var feature = "features/" + result[2] + ".feature";
  // If we don't have the browser, we definitely don't have the test.
  if (!tests[browser]) {
    return undefined;
  }

  // Incrementally replace underscores with slashes and try again, in case
  // this was a test from a subdirectory.
  // Example:
  //   Feature: features/applab/tooltips.feature
  //   Key    : {browser}_applab_tooltips_output.html
  // If we ever have an ambiguous case (someone creates
  // features/applab_tooltips.feature) then this will be a problem - but it is
  // unlikely.
  var test = tests[browser][feature];
  while (!test && feature.indexOf('_') >= 0) {
    feature = feature.replace('_', '/'); // Replaces first underscore only.
    test = tests[browser][feature];
  }
  return test;
}

function calculateBrowserProgress(browser) {
  let successCount = 0, failureCount = 0, pendingCount = 0;
  for (let feature in tests[browser]) {
    let status = tests[browser][feature].status_;
    if (status === STATUS_PENDING) {
      pendingCount++;
    } else if (status === STATUS_FAILED) {
      failureCount++;
    } else if (status === STATUS_SUCCEEDED) {
      successCount++;
    }
  }
  return {
    successCount,
    failureCount,
    pendingCount
  };
}

function renderBrowserProgress(browser, progress) {
  let {successCount, failureCount, pendingCount} = progress;
  let totalCount = successCount + failureCount + pendingCount;

  // DOM references
  let progressDiv = document.querySelector(`#${browser}-progress`);
  let progressText = progressDiv.querySelector('.progress-text');
  let progressBar = progressDiv.querySelector('.progress-bar');
  let successBar = progressBar.querySelector('.success');
  let failureBar = progressBar.querySelector('.failure');
  let pendingBar = progressBar.querySelector('.pending');

  // We manipulate the percentages to make them round numbers, adding up to 100,
  // and each category gets at least 1% if its count is greater than zero.
  let successPercent = Math.max(Math.floor(successCount * 100 / totalCount), successCount > 0 ? 1 : 0);
  let failurePercent = Math.max(Math.floor(failureCount * 100 / totalCount), failureCount > 0 ? 1 : 0);
  let pendingPercent = Math.max(Math.floor(pendingCount * 100 / totalCount), pendingCount > 0 ? 1 : 0);
  let leftover = 100 - (successPercent + failurePercent + pendingPercent);
  if (pendingCount > 0) {
    pendingPercent += leftover;
  } else {
    successCount += leftover;
  }

  // Set progress text
  let runPercent = successPercent + failurePercent;
  progressText.textContent = `${runPercent}% of ${totalCount} tests have run.`
      + ` ${successCount} passed,`
      + ` ${failureCount} failed,`
      + ` ${pendingCount} are pending.`;

  // Update the progress bar
  successBar.style.backgroundColor = GREEN;
  successBar.style.width = `${successPercent}%`;
  failureBar.style.backgroundColor = RED;
  failureBar.style.width = `${failurePercent}%`;
  pendingBar.style.backgroundColor = GRAY;
  pendingBar.style.width = `${pendingPercent}%`;
}

var updateProgress = _.debounce(function updateProgress__() {
  // Count up tests by status
  let successCount = 0, failureCount = 0, pendingCount = 0;
  for (let browser in tests) {
    let browserProgress = calculateBrowserProgress(browser);
    renderBrowserProgress(browser, browserProgress);
    successCount += browserProgress.successCount;
    failureCount += browserProgress.failureCount;
    pendingCount += browserProgress.pendingCount;
  }
  renderBrowserProgress('total', {
    successCount,
    failureCount,
    pendingCount
  });
  // Disable auto-refresh if the test run is done and green.
  if (pendingCount + failureCount === 0) {
    disableAutoRefresh();
  }
}, 300);

function refresh() {
  // Fetches all logs for this branch and maps them to the tests in this run.
  // Passes last modification times to the test objects so they can decide
  // whether to update.
  refreshButton.disabled = true;
  const ensure = () => {
    refreshButton.disabled = false;
  };
  let lastRefreshEpochSeconds = Math.floor(lastRefreshTime.getTime()/1000);
  let newTime = new Date();
  fetch(`/api/v1/test_logs/${gitBranch}/since/${lastRefreshEpochSeconds}`, { mode: 'no-cors' })
    .then(response => response.json())
    .then(json => {
      json.forEach(object => {
        let test = testFromS3Key(object.key);
        if (test) {
          test.setLastModified(new Date(object.last_modified));
        }
      });
      lastRefreshTime = newTime;
      lastRefreshTimeLabel.textContent = 'Updated ' + lastRefreshTime.toTimeString();
    })
    .then(ensure, ensure);
}

var refreshInterval = null;
function enableAutoRefresh() {
  refreshButton.style.display = 'none';
  autoRefreshButton.textContent = 'Disable Auto-Refresh';
  refreshInterval = setInterval(refresh, 10000); // 10 seconds
}

function disableAutoRefresh() {
  refreshButton.style.display = 'inline-block';
  autoRefreshButton.textContent = 'Enable Auto-Refresh';
  clearInterval(refreshInterval);
  refreshInterval = null;
}

function toggleAutoRefresh() {
  if (refreshInterval) {
    disableAutoRefresh();
  } else {
    enableAutoRefresh();
  }
}
refreshButton.onclick = refresh;
autoRefreshButton.onclick = toggleAutoRefresh;
enableAutoRefresh();
refresh();
