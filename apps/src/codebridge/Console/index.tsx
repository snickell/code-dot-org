import {
  appendSystemInMessage,
  resetOutput,
} from '@codebridge/redux/consoleRedux';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {setInput} from '@cdo/apps/pythonlab/pyodideWorkerManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ControlButtons from './ControlButtons';
import GraphModal from './GraphModal';
import RightButtons from './RightButtons';

import moduleStyles from './console.module.scss';

const Console: React.FunctionComponent = () => {
  const codeOutput = useAppSelector(state => state.codebridgeConsole.output);
  const dispatch = useDispatch();
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [activeGraphIndex, setActiveGraphIndex] = useState(0);

  // TODO: Update this with other apps that use the console as needed.
  const systemMessagePrefix = appName === 'pythonlab' ? '[PYTHON LAB] ' : '';

  const clearOutput = useCallback(
    (sendAnalytics: boolean) => {
      dispatch(resetOutput());
      if (sendAnalytics) {
        sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_CLEAR_CONSOLE, appName);
      }
      setGraphModalOpen(false);
    },
    [dispatch, appName]
  );

  // Clear console when we change levels. Don't send an analytics event
  // as the user did not initiate this action.
  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () =>
    clearOutput(false)
  );

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [codeOutput]);

  const popOutGraph = (index: number) => {
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_POP_OUT_IMAGE, appName);
    setActiveGraphIndex(index);
    setGraphModalOpen(true);
  };

  const getConsoleLines = () => {
    return codeOutput.map((outputLine, index) => {
      if (outputLine.type === 'img') {
        return (
          <span>
            <img
              src={`data:image/png;base64,${outputLine.contents}`}
              alt="matplotlib_image"
            />
            <Button
              color={buttonColors.black}
              disabled={false}
              icon={{
                iconName: 'up-right-from-square',
                iconStyle: 'solid',
              }}
              isIconOnly={true}
              onClick={() => popOutGraph(index)}
              size="xs"
              type="primary"
              aria-label="open matplotlib_image in pop-up"
            />
            {activeGraphIndex === index && graphModalOpen && (
              <GraphModal
                src={`data:image/png;base64,${outputLine.contents}`}
                onClose={() => setGraphModalOpen(false)}
              />
            )}
          </span>
        );
      } else if (
        outputLine.type === 'system_out' ||
        outputLine.type === 'system_in'
      ) {
        return <span>{outputLine.contents}</span>;
      } else if (outputLine.type === 'error') {
        return (
          <span className={moduleStyles.errorLine}>{outputLine.contents}</span>
        );
      } else if (outputLine.type === 'system_error') {
        return (
          <span className={moduleStyles.errorLine}>
            {systemMessagePrefix}
            {codebridgeI18n.systemCodeError()}
          </span>
        );
      } else {
        return (
          <span>
            {systemMessagePrefix}
            {outputLine.contents}
          </span>
        );
      }
    });
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const input = event.currentTarget.value;
      event.preventDefault();
      setInput(input);
      dispatch(appendSystemInMessage(input));
    }
  };

  const consoleLines = getConsoleLines();
  return (
    <PanelContainer
      id="codebridge-console"
      className={moduleStyles.consoleContainer}
      headerContent={'Console'}
      rightHeaderContent={
        <RightButtons clearOutput={() => clearOutput(true)} />
      }
      leftHeaderContent={<ControlButtons />}
      headerClassName={moduleStyles.consoleHeader}
    >
      <div className={moduleStyles.console} id="uitest-codebridge-console">
        {consoleLines.map((output, index) => {
          if (index === consoleLines.length - 1) {
            return (
              <div key={index}>
                {output}
                <input
                  id="console-input"
                  type="text"
                  spellCheck="false"
                  onKeyDown={onInputKeyDown}
                  aria-label="console input"
                  ref={inputRef}
                />
              </div>
            );
          } else {
            return <div key={index}>{output}</div>;
          }
        })}
        <div ref={scrollAnchorRef} />
      </div>
    </PanelContainer>
  );
};

export default Console;
