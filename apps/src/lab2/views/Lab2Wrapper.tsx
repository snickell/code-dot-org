// Lab2Wrapper
//
// Lab2 uses this component to wrap the apps that it switches between.  This
// component remains agnostic to the children that are passed into it, which
// are the apps.  But this component provides a few useful things: an error
// boundary; a fade-in between levels; a loading spinner when a level takes a
// while to load; and a sad bee when things go wrong.

import classNames from 'classnames';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import fetchPermissions from '@cdo/apps/lab2/utils/fetchPermissions';
import {useBrowserTextToSpeech} from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {PERMISSIONS} from '../constants';
import ErrorBoundary from '../ErrorBoundary';
import useLifecycleNotifier from '../hooks/useLifecycleNotifier';
import {
  LabState,
  isLabLoading,
  hasPageError,
  setIsShareView,
  setPermissions,
} from '../lab2Redux';
import Lab2Registry from '../Lab2Registry';
import {getAppOptionsLevelId, getIsShareView} from '../projects/utils';
import {LifecycleEvent} from '../utils';

import {ErrorFallbackPage, ErrorUI} from './ErrorFallbackPage';
import Loading from './Loading';
import {ProjectBlockedUI} from './ProjectBlockedUI';

import moduleStyles from './Lab2Wrapper.module.scss';

export interface Lab2WrapperProps {
  children: React.ReactNode;
}

const Lab2Wrapper: React.FunctionComponent<Lab2WrapperProps> = ({children}) => {
  const isLoading: boolean = useSelector(isLabLoading);
  const isPageError: boolean = useSelector(hasPageError);
  const isBlocked = useAppSelector(state => state.lab.isBlocked);
  const dispatch = useAppDispatch();
  const isProjectValidator = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.PROJECT_VALIDATOR)
  );
  useEffect(() => {
    fetchPermissions().then(data => {
      dispatch(setPermissions(data));
    });
  }, [dispatch]);
  const errorMessage: string | undefined = useSelector(
    (state: {lab: LabState}) =>
      state.lab.pageError?.errorMessage || state.lab.pageError?.error?.message
  );
  const {cancel} = useBrowserTextToSpeech();

  // Store some server-provided data in redux.
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  // Store the level ID provided by App Options in redux if necessary.
  // This is needed on pages without a header, such as the share view.
  const appOptionsLevelId = getAppOptionsLevelId();
  useEffect(() => {
    if (!currentLevelId && appOptionsLevelId) {
      dispatch(setCurrentLevelId(appOptionsLevelId.toString()));
    }
  }, [currentLevelId, appOptionsLevelId, dispatch]);

  // Store whether we are in share view in redux, from App Options.
  const isShareView = getIsShareView();
  useEffect(() => {
    if (isShareView !== undefined) {
      dispatch(setIsShareView(isShareView));
    }
  }, [isShareView, dispatch]);

  // Add listeners to cancel in any-progress text to speech on level change or reload.
  useLifecycleNotifier(LifecycleEvent.LevelChangeRequested, cancel);
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, cancel);

  return (
    <ErrorBoundary
      fallback={<ErrorFallbackPage />}
      onError={(error, componentStack) =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Uncaught React Error', error, {
            componentStack,
          })
      }
    >
      <div
        id="lab-container"
        className={classNames(
          moduleStyles.labContainer,
          isLoading && moduleStyles.labContainerLoading,
          isShareView && moduleStyles.labContainerShareView
        )}
      >
        {children}
        <Loading isLoading={isLoading} />

        {isPageError && <ErrorUI message={errorMessage} />}
        {isBlocked && (
          <ProjectBlockedUI isProjectValidator={isProjectValidator} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Lab2Wrapper;
