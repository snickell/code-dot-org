/*globals dashboard*/
import i18n from '@cdo/locale';
import trackEvent from '@cdo/apps/util/trackEvent';

/**
 * Runs the user's droplet code through the droplet parser. If droplet is unable
 * to parse the user's code, call the error callback with any information we
 * have regarding the error. Additionally, this will return `true` if any
 * errors are detected and `false` otherwise.
 * @param {object} dropletEditor The droplet engine
 * @param {function} errorCallback The function to call if an error is detected.
 *                   Usage: errorCallback(lineNumber, errorMessage)
 * @returns {boolean} true if an error was detected. false otherwise.
 */
export const findDropletParseErrors = (dropletEditor, errorCallback) => {
  if (!dropletEditor) {
    return false;
  }

  try {
    dropletEditor.parse();
  } catch (error) {
    // Example error message: 'Line ###. Error Message'
    let matchedLineNumber = error.message.match(/Line (\d+)./);
    if (matchedLineNumber) {
      // We were able to find the line number. Report it to the user.
      let errorMessage = error.message.match(/Line \d+. (.*)/)[1];
      if (error.message.includes('indent must be inside block')) {
        errorMessage = i18n.droplet_parsing_error();
      } else {
        // It's unknown what javascript text causes certain droplet errors. If
        // we discover an unknown error, log it to Google Analytics so we can
        // create a user-friendly error message.
        trackEvent(
          'Research',
          'UnknownDropletError',
          `DropletError:${
            error.message
          }--ShareURL:${dashboard.project.getShareUrl()}`
        );
      }
      errorCallback(Number(matchedLineNumber[1]) + 1, errorMessage);
      return true;
    } else {
      // We couldn't find the line number. Display the error to the student and
      // log this in Google Analytics so we can update droplet to return the
      // line number with this error.
      trackEvent(
        'Research',
        'CouldNotFindDropletParseErrorLineNumber',
        'DropletError:' + error.message
      );
      errorCallback(
        0 /* lineNumber */,
        i18n.droplet_parsing_error() + ' ' + error.message
      );
      return true;
    }
  }

  return false;
};
