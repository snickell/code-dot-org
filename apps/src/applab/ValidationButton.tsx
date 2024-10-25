import React, {useCallback, useState} from 'react';
import {Provider} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import ValidationResultsModal from './ValidationResultsModal';
import {useAppDispatch, useAppSelector} from '../util/reduxHooks';
import {askAITutor} from '../aiTutor/redux/aiTutorRedux';
import {AITutorTypes as ActionType} from '@cdo/apps/aiTutor/types';
import consoleRedux from '../codebridge/redux/consoleRedux';

/**
 * Renders a button in App Lab that when clicked makes a call to AI to
 * validate which of the TODOs in the student's code are incomplete,
 * partially complete or complete, and then opens a dialog displaying
 * the results.
 */

const ValidationButton: React.FunctionComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);
  console.log('storedMessages', storedMessages);
  const studentCode =
    'TODO 1: Make a variable called x. TODO 2: Make a variable called y. TODO 3: Set x to dogs. TODO 4: Set y to cats.';
  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    const chatContext = {
      systemPrompt:
        'For each TODO say yes, no or partial to indicate whether the TODO is complete, incomplete or partially complete.',
      studentInput: '',
      studentCode,
      actionType: ActionType.COMPLETION,
    };

    dispatch(askAITutor(chatContext));
  }, [studentCode, dispatch]);

  const onClick = () => {
    handleSubmit();
    setModalOpen(true);
  };
  const onClose = () => {
    setModalOpen(false);
  };
  const results = storedMessages.at(-1)?.chatMessageText;
  return (
    <>
      <Button
        color="purple"
        text="Check my code"
        type="secondary"
        onClick={onClick}
        size="s"
      />
      {modalOpen && (
        <ValidationResultsModal onClose={onClose} results={results} />
      )}
    </>
  );
};

export default ValidationButton;
