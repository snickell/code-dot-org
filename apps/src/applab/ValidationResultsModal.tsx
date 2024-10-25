import React from 'react';
import {Provider} from 'react-redux';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {Heading3} from '@cdo/apps/componentLibrary/typography';

/**
 * Renders a dialog displaying results of the App Lab Code Checker.
 */

export interface ValidationResultsModalProps {
  onClose: () => void;
  results: string | undefined;
}

const ValidationResultsModal: React.FunctionComponent<
  ValidationResultsModalProps
> = ({onClose, results}) => {
  return (
    <AccessibleDialog onClose={onClose}>
      <div>
        <Heading3>Results will go here :)</Heading3>
        {results && <p>{results}</p>}
      </div>
      <hr />
    </AccessibleDialog>
  );
};

export default ValidationResultsModal;
