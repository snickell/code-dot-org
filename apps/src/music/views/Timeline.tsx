import classNames from 'classnames';
import React, {MouseEvent, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import appConfig from '../appConfig';
import {BlockMode, MIN_NUM_MEASURES} from '../constants';
import {
  clearSelectedBlockId,
  getBlockMode,
  setStartingPlayheadPosition,
} from '../redux/musicRedux';
import {MusicLevelData} from '../types';

import usePlaybackUpdate from './hooks/usePlaybackUpdate';
import TimelineSampleEvents from './TimelineSampleEvents';
import TimelineSimple2Events from './TimelineSimple2Events';
import {useMusicSelector} from './types';

import moduleStyles from './timeline.module.scss';

// The height of the primary timeline area for drawing events.  This is the height of each measure's
// vertical bar.
const timelineHeight = 130;
// The width of one measure.
const barWidth = 60;
// Leave some vertical space between each event block.
const eventVerticalSpace = 2;
// A little room on the left.
const paddingOffset = 10;
// Start scrolling the playhead when it's more than this percentage of the way across the timeline area.
const playheadScrollThreshold = 0.75;
// How many extra measures to show at the end.
const extraMeasures = 8;

const getEventHeight = (
  numUniqueRows: number,
  availableHeight = timelineHeight
) => {
  // While we might not actually have this many rows to show,
  // we will limit each row's height to the size that would allow
  // this many to be shown at once.
  const minVisible = 5;

  const maxVisible = 26;

  // We might not actually have this many rows to show, but
  // we will size the bars so that this many rows would show.
  const numSoundsToShow = Math.max(
    Math.min(numUniqueRows, maxVisible),
    minVisible
  );

  return Math.floor(availableHeight / numSoundsToShow);
};

/**
 * Renders the music playback timeline.
 */
const Timeline: React.FunctionComponent = () => {
  const isPlaying = useMusicSelector(state => state.music.isPlaying);

  const blockMode = useSelector(getBlockMode);
  const dispatch = useDispatch();
  const currentPlayheadPosition = useMusicSelector(
    state => state.music.currentPlayheadPosition
  );
  const startingPlayheadPosition = useMusicSelector(
    state => state.music.startingPlayheadPosition
  );

  const allowChangeStartingPlayheadPosition =
    (useAppSelector(
      state =>
        (state.lab.levelProperties?.levelData as MusicLevelData | undefined)
          ?.allowChangeStartingPlayheadPosition
    ) ||
      appConfig.getValue('allow-change-starting-playhead-position') ===
        'true') &&
    !isPlaying;
  const measuresToDisplay =
    Math.max(
      MIN_NUM_MEASURES,
      useMusicSelector(state => state.music.lastMeasure)
    ) + extraMeasures;
  const loopEnabled = useMusicSelector(state => state.music.loopEnabled);
  const loopStart = useMusicSelector(state => state.music.loopStart);
  const loopEnd = useMusicSelector(state => state.music.loopEnd);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const positionToUse = isPlaying
    ? currentPlayheadPosition
    : startingPlayheadPosition;
  const playHeadOffsetInPixels = (positionToUse - 1) * barWidth;

  const timelineElementProps = {
    paddingOffset,
    barWidth,
    eventVerticalSpace,
    getEventHeight,
  };

  // Generate an array containing measure numbers from 1..measuresToDisplay.
  const arrayOfMeasures = Array.from(
    {length: measuresToDisplay},
    (_, i) => i + 1
  );

  const currentlyAllowChangeStartingPlayheadPosition =
    !isPlaying && allowChangeStartingPlayheadPosition;

  const onMeasuresBackgroundClick = useCallback(
    (event: MouseEvent) => {
      if (!currentlyAllowChangeStartingPlayheadPosition) {
        return;
      }

      const offset =
        event.clientX -
        (event.target as Element).getBoundingClientRect().x -
        paddingOffset;
      const exactMeasure = offset / barWidth + 1;
      // Round measure to the nearest beat (1/4 note).
      const roundedMeasure = Math.round(exactMeasure * 4) / 4;
      dispatch(setStartingPlayheadPosition(roundedMeasure));
    },
    [dispatch, currentlyAllowChangeStartingPlayheadPosition]
  );

  const onMeasureNumberClick = useCallback(
    (measureNumber: number) => {
      if (!currentlyAllowChangeStartingPlayheadPosition) {
        return;
      }

      dispatch(setStartingPlayheadPosition(measureNumber));
    },
    [dispatch, currentlyAllowChangeStartingPlayheadPosition]
  );

  const onTimelineClick = useCallback(() => {
    dispatch(clearSelectedBlockId());
  }, [dispatch]);

  const scrollPlayheadForward = useCallback(() => {
    if (!timelineRef.current || !playheadRef.current) {
      return;
    }

    const playheadOffset =
      playheadRef.current.getBoundingClientRect().left -
      timelineRef.current.getBoundingClientRect().left;
    const scrollThreshold =
      timelineRef.current.clientWidth * playheadScrollThreshold;
    if (playheadOffset > scrollThreshold) {
      timelineRef.current.scrollBy(playheadOffset - scrollThreshold, 0);
    }
  }, [playheadRef]);

  const scrollToPlayhead = useCallback(() => {
    playheadRef.current?.scrollIntoView();
  }, [playheadRef]);

  usePlaybackUpdate(scrollPlayheadForward, scrollToPlayhead, scrollToPlayhead);

  return (
    <div
      id="timeline"
      className={classNames(
        moduleStyles.timeline,
        isPlaying && moduleStyles.timelinePlaying
      )}
      onClick={onTimelineClick}
      ref={timelineRef}
    >
      <div
        id="timeline-measures-background"
        className={classNames(
          moduleStyles.measuresBackground,
          moduleStyles.fullWidthOverlay,
          currentlyAllowChangeStartingPlayheadPosition &&
            moduleStyles.measuresBackgroundClickable
        )}
        style={{width: paddingOffset + measuresToDisplay * barWidth}}
        onClick={onMeasuresBackgroundClick}
      >
        &nbsp;
      </div>
      <div id="timeline-measures" className={moduleStyles.fullWidthOverlay}>
        {arrayOfMeasures.map((measure, index) => {
          return (
            <div
              key={index}
              className={moduleStyles.barLineContainer}
              style={{left: paddingOffset + index * barWidth}}
            >
              <div
                className={classNames(
                  moduleStyles.barNumber,
                  measure === Math.floor(currentPlayheadPosition) &&
                    moduleStyles.barNumberCurrent,
                  currentlyAllowChangeStartingPlayheadPosition &&
                    moduleStyles.barNumberClickable
                )}
                onClick={() => onMeasureNumberClick(measure)}
              >
                {measure}
              </div>
              <div
                className={classNames(
                  moduleStyles.barLine,
                  measure === Math.floor(currentPlayheadPosition) &&
                    moduleStyles.barLineCurrent
                )}
              />
            </div>
          );
        })}
      </div>

      <div id="timeline-soundsarea" className={moduleStyles.soundsArea}>
        {blockMode === BlockMode.SIMPLE2 ? (
          <TimelineSimple2Events {...timelineElementProps} />
        ) : (
          <TimelineSampleEvents {...timelineElementProps} />
        )}
      </div>

      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        <div
          className={classNames(
            moduleStyles.playhead,
            isPlaying && moduleStyles.playheadPlaying
          )}
          style={{left: paddingOffset + playHeadOffsetInPixels}}
          ref={playheadRef}
        >
          &nbsp;
        </div>
      </div>
      {loopEnabled && <LoopMarkers loopStart={loopStart} loopEnd={loopEnd} />}
    </div>
  );
};

const LoopMarkers: React.FunctionComponent<{
  loopStart: number;
  loopEnd: number;
}> = ({loopStart, loopEnd}) => {
  const startOffset = (loopStart - 1) * barWidth;
  const endOffset = (loopEnd - 1) * barWidth;

  return (
    <>
      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        <div
          className={classNames(
            moduleStyles.playhead,
            moduleStyles.playheadLoop
          )}
          style={{left: paddingOffset + startOffset}}
        >
          &nbsp;
        </div>
      </div>
      <div id="timeline-playhead" className={moduleStyles.fullWidthOverlay}>
        <div
          className={classNames(
            moduleStyles.playhead,
            moduleStyles.playheadLoop
          )}
          style={{left: paddingOffset + endOffset}}
        >
          &nbsp;
        </div>
      </div>
    </>
  );
};

export default Timeline;
