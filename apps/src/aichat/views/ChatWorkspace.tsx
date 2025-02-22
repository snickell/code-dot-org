import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  fetchStudentChatHistory,
  selectAllVisibleMessages,
  setShowModalType,
} from '@cdo/apps/aichat/redux/aichatRedux';
import TeacherOnboardingModal from '@cdo/apps/aichat/views/TeacherOnboardingModal';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {Button} from '@cdo/apps/componentLibrary/button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {ModalTypes} from '../constants';
import aichatI18n from '../locale';
import {getShortName} from '../utils';

import ChatEventsList from './ChatEventsList';
import CopyButton from './CopyButton';
import UserChatMessageEditor from './UserChatMessageEditor';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatWorkspaceProps {
  onClear: () => void;
}

enum WorkspaceTeacherViewTab {
  STUDENT_CHAT_HISTORY = 'viewStudentChatHistory',
  TEST_STUDENT_MODEL = 'testStudentModel',
}

const eraserIcon: FontAwesomeV6IconProps = {
  iconName: 'eraser',
};

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  onClear,
}) => {
  const [selectedTab, setSelectedTab] =
    useState<WorkspaceTeacherViewTab | null>(null);

  const {showModalType, studentChatHistory} = useAppSelector(
    state => state.aichat
  );
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const visibleItems = useSelector(selectAllVisibleMessages);

  const students = useAppSelector(
    state => state.teacherSections.selectedStudents
  );

  const dispatch = useAppDispatch();

  const selectedStudentName = useMemo(() => {
    if (viewAsUserId && currentLevelId) {
      const selectedStudent = Object.values(students).find(
        student => student.id === viewAsUserId
      );
      if (selectedStudent) {
        dispatch(fetchStudentChatHistory(selectedStudent.id));
        return getShortName(selectedStudent.name);
      }
    }
    return null;
  }, [viewAsUserId, students, dispatch, currentLevelId]);

  // Teacher user is able to interact with chatbot.
  const canChatWithModel = useMemo(
    () => selectedTab !== WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY,
    [selectedTab]
  );

  useEffect(() => {
    const teacherSawAichatOnboardingModal = tryGetLocalStorage(
      'teacherSawAichatOnboarding',
      'no'
    );
    const modalToShow =
      isUserTeacher && teacherSawAichatOnboardingModal !== 'yes'
        ? ModalTypes.TEACHER_ONBOARDING
        : ModalTypes.WARNING;
    dispatch(setShowModalType(modalToShow));
  }, [isUserTeacher, dispatch]);

  useEffect(() => {
    // If we are viewing as a student, default to the student chat history tab if tab is not yet selected.
    if (viewAsUserId && !selectedTab) {
      setSelectedTab(WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY);
    } else if (!viewAsUserId) {
      setSelectedTab(null);
    }
  }, [viewAsUserId, selectedTab]);

  const iconValue: FontAwesomeV6IconProps = {
    iconName: 'lock',
    iconStyle: 'solid',
  };

  const tabs = [
    {
      value: 'viewStudentChatHistory',
      text:
        selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY
          ? aichatI18n.viewOnlyTabLabel({
              fieldLabel: aichatI18n.viewStudentChatHistory({
                selectedStudentName: selectedStudentName ?? '',
              }),
            })
          : aichatI18n.viewStudentChatHistory({
              selectedStudentName: selectedStudentName ?? '',
            }),
      tabContent: (
        <ChatEventsList events={studentChatHistory} isTeacherView={true} />
      ),
      iconLeft: iconValue,
    },
    {
      value: 'testStudentModel',
      text: aichatI18n.testStudentModel(),
      tabContent: <ChatEventsList events={visibleItems} />,
    },
  ];

  const handleOnChange = useCallback(
    (value: string) => {
      setSelectedTab(value as WorkspaceTeacherViewTab);
    },
    [setSelectedTab]
  );

  const tabArgs: TabsProps = {
    name: 'teacherViewChatHistoryTabs',
    tabs,
    defaultSelectedTabValue: tabs[0].value,
    onChange: handleOnChange,
    type: 'secondary',
    tabsContainerClassName: moduleStyles.tabsContainer,
    tabPanelsContainerClassName: moduleStyles.tabPanelsContainer,
  };

  const ChatModal = useMemo(
    () =>
      showModalType === ModalTypes.TEACHER_ONBOARDING
        ? TeacherOnboardingModal
        : showModalType === ModalTypes.WARNING
        ? ChatWarningModal
        : undefined,
    [showModalType]
  );

  const onCloseModal = useCallback(() => {
    // We only want to show the teacher onboarding modal the first time a teacher user
    // interacts with the aichat tool. Thus, we store a value in local storage when
    // closing the modal. After the first time viewing the modal, the teacher user
    // sees the warning modal on page load from then on.
    if (
      isUserTeacher &&
      showModalType === ModalTypes.TEACHER_ONBOARDING &&
      tryGetLocalStorage('teacherSawAichatOnboarding', 'no') !== 'yes'
    ) {
      trySetLocalStorage('teacherSawAichatOnboarding', 'yes');
    }
    dispatch(setShowModalType(undefined));
  }, [dispatch, isUserTeacher, showModalType]);

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {ChatModal && <ChatModal onClose={onCloseModal} />}
      {viewAsUserId ? (
        <Tabs {...tabArgs} />
      ) : (
        <ChatEventsList events={visibleItems} />
      )}

      <div className={moduleStyles.footer}>
        {canChatWithModel && (
          <UserChatMessageEditor
            editorContainerClassName={moduleStyles.messageEditorContainer}
          />
        )}
        <div className={moduleStyles.buttonRow}>
          <Button
            text={aichatI18n.clearChatButtonText()}
            disabled={!canChatWithModel}
            iconLeft={eraserIcon}
            size="s"
            type="secondary"
            color="gray"
            onClick={onClear}
          />
          <CopyButton isDisabled={!canChatWithModel} />
        </div>
      </div>
    </div>
  );
};

export default ChatWorkspace;
