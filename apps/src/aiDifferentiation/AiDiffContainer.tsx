import classnames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';
import Draggable, {DraggableEventHandler} from 'react-draggable';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Button from '@cdo/apps/componentLibrary/button';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import HttpClient from '../util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffBotMessageFooter from './AiDiffBotMessageFooter';
import AiDiffChatFooter from './AiDiffChatFooter';
import AiDiffSuggestedPrompts from './AiDiffSuggestedPrompts';
import {ChatItem, ChatPrompt} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  open: boolean;
  lessonId: number;
  lessonName: string;
  unitDisplayName: string;
}

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  open,
  lessonId,
  lessonName,
  unitDisplayName,
}) => {
  // TODO: Update to support i18n
  const aiDiffHeaderText = 'AI Teaching Assistant';
  const aiDiffPositionX = 'aiDiffPositionX';
  const aiDiffPositionY = 'aiDiffPositionY';

  const aiDiffChatMessageEndpoint = '/ai_diff/chat_completion';

  const reportingData = {
    lessonId: lessonId,
    lessonName: lessonName,
    unitName: unitDisplayName,
  };

  const [positionX, setPositionX] = useState(
    parseInt(tryGetSessionStorage(aiDiffPositionX, 0)) || 0
  );
  const [positionY, setPositionY] = useState(
    parseInt(tryGetSessionStorage(aiDiffPositionY, 0)) || 0
  );

  const [sessionId, setSessionId] = useState(null);

  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const SUGGESTED_PROMPTS = [
    {
      label: 'Explain a concept',
      prompt:
        'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
    },
    {
      label: 'Give an example to use with my class',
      prompt:
        'Can I have an example to use with my class? You can ask me a follow-up question to get more details for the kind of example needed.',
    },
    {
      label: 'Write an extension activity for students who finish early',
      prompt:
        'Write an extension activity for this lesson for students who finish early',
    },
    {
      label: 'Write an extension activity for students who need extra practice',
      prompt:
        'Write an extension activity for this lesson for students who need extra practice',
    },
  ];

  const [messageHistory, setMessageHistory] = useState<ChatItem[]>([
    {
      role: Role.ASSISTANT,
      chatMessageText: `Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me.`,
      status: Status.OK,
    },
    SUGGESTED_PROMPTS,
  ]);

  useEffect(() => {
    trySetSessionStorage(aiDiffPositionX, String(positionX));
  }, [positionX]);

  useEffect(() => {
    trySetSessionStorage(aiDiffPositionY, String(positionY));
  }, [positionY]);

  const onStopHandler: DraggableEventHandler = (e, data) => {
    setPositionX(data.x);
    setPositionY(data.y);
  };

  const onMessageSend = (message: string) => {
    const newUserMessage = {
      role: Role.USER,
      chatMessageText: message,
      status: Status.OK,
    };

    setMessageHistory(prevMessages => [...prevMessages, newUserMessage]);
    getAIResponse(message, false);
  };

  const onPromptSelect = (prompt: ChatPrompt) => {
    getAIResponse(prompt.prompt, true);
  };

  const onSuggestPrompts = () => {
    setMessageHistory(prevMessages => [...prevMessages, SUGGESTED_PROMPTS]);
  };

  const sendChatEvent = (
    role: string,
    prompt: string,
    preset: boolean,
    session: string
  ) => {
    const responseEventData = {
      ...reportingData,
      role: role,
      isPreset: preset,
      text: prompt,
      sessionId: session,
    };
    analyticsReporter.sendEvent(
      EVENTS.AI_DIFF_CHAT_EVENT,
      responseEventData,
      PLATFORMS.STATSIG
    );
  };

  const getAIResponse = (prompt: string, isPreset: boolean) => {
    setIsWaitingForResponse(true);

    if (sessionId !== null) {
      sendChatEvent(Role.USER, prompt, isPreset, sessionId);
    }

    const body = JSON.stringify({
      inputText: prompt,
      lessonId: lessonId,
      unitDisplayName: unitDisplayName,
      sessionId: sessionId,
      isPreset: isPreset,
    });
    HttpClient.post(`${aiDiffChatMessageEndpoint}`, body, true, {
      'Content-Type': 'application/json',
    })
      .then(response => response.json())
      .then(json => {
        const newAiMessage = {
          role: Role.ASSISTANT,
          chatMessageText: json.chat_message_text,
          status: json.status,
        };

        // logging here because on the first user message the sessionId is null
        // we only get a sessionID initialized in the response
        if (sessionId === null) {
          sendChatEvent(Role.USER, prompt, isPreset, json.session_id);
        }

        sendChatEvent(
          Role.ASSISTANT,
          json.chat_message_text,
          isPreset,
          json.session_id
        );
        setSessionId(json.session_id);
        setMessageHistory(prevMessages => [...prevMessages, newAiMessage]);
      })
      .catch(error => console.log(error))
      .finally(() => {
        setIsWaitingForResponse(false);
      });
  };

  // Scroll to bottom of content when a new message comes in
  const chatWindowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatWindowRef.current?.lastElementChild?.scrollIntoView();
  }, [messageHistory]);

  return (
    <Draggable
      handle=".ai_diff_handle"
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        // eslint-disable-next-line react/forbid-dom-props
        data-testid="draggable-test-id"
        id="draggable-id"
        className={style.aiDiffContainer}
        style={open ? undefined : {display: 'none'}}
      >
        <div className={classnames(style.aiDiffHeader, 'ai_diff_handle')}>
          <div className={style.aiDiffHeaderLeftSide}>
            <div className={style.aiBotHeader}>
              <img
                src={aiBotOutlineIcon}
                className={style.aiBotOutlineIcon}
                alt={aiDiffHeaderText}
              />
              <div className={style.taOverlayHeader}>
                <span>{'TA'}</span>
              </div>
            </div>
            <span className={style.aiDiffHeaderText}>{aiDiffHeaderText}</span>
          </div>
          <div className={style.aiDiffHeaderRightSide}>
            <Button
              color="white"
              icon={{iconName: 'times', iconStyle: 'solid'}}
              type="tertiary"
              isIconOnly={true}
              onClick={closeTutor}
              size="s"
            />
          </div>
        </div>

        <div className={style.fabBackground}>
          <div className={style.chatContent} ref={chatWindowRef}>
            {messageHistory.map((item: ChatItem, id: number) =>
              Array.isArray(item) ? (
                <AiDiffSuggestedPrompts
                  suggestedPrompts={item}
                  isLatest={id === messageHistory.length - 1}
                  onSubmit={onPromptSelect}
                  key={id}
                />
              ) : (
                <ChatMessage
                  {...item}
                  customStyles={style}
                  key={id}
                  isTA={true}
                  footer={
                    item.role === Role.ASSISTANT && (
                      <AiDiffBotMessageFooter message={item} />
                    )
                  }
                />
              )
            )}
            <img
              src="/blockly/media/aichat/typing-animation.gif"
              alt={'Waiting for response'}
              className={
                isWaitingForResponse
                  ? style.waitingForResponse
                  : style.hideWaitingForResponse
              }
            />
          </div>
          <AiDiffChatFooter
            onSubmit={onMessageSend}
            onSuggestPrompts={onSuggestPrompts}
            messages={messageHistory}
            waiting={isWaitingForResponse}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default AiDiffContainer;
