import React, {useState, useEffect, useCallback, useMemo} from 'react';

import musicI18n from '../locale';
import MusicRegistry from '../MusicRegistry';
import {ChordEventValue, PlayStyle} from '../player/interfaces/ChordEvent';
import MusicLibrary from '../player/MusicLibrary';
import {generateGraphDataFromChord, ChordGraphNote} from '../utils/Chords';

import Keybed from './Keybed';
import LoadingOverlay from './LoadingOverlay';
import PreviewControls from './PreviewControls';

import moduleStyles from './chordPanel.module.scss';

const NUM_OCTAVES = 3;
const START_OCTAVE = 4;
const MAX_NOTES = 16;

const styleDropdownOptions: [PlayStyle, string][] = [
  ['arpeggio-up', musicI18n.chordArpeggioUp()],
  ['arpeggio-down', musicI18n.chordArpeggioDown()],
  ['arpeggio-random', musicI18n.chordArpeggioRandom()],
  ['together', musicI18n.chordTogether()],
];

export interface ChordPanelProps {
  initValue: ChordEventValue;
  onChange: (value: ChordEventValue) => void;
}

const ChordPanel: React.FunctionComponent<ChordPanelProps> = ({
  initValue,
  onChange,
}) => {
  const [selectedNotes, setSelectedNotes] = useState<number[]>(initValue.notes);
  const [playStyle, setPlayStyle] = useState<PlayStyle>(initValue.playStyle);
  const [instrument, setInstrument] = useState<string>(initValue.instrument);
  const [isDisabled, setIsDisabled] = useState<boolean>(
    selectedNotes.length >= MAX_NOTES
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const instruments: [string, string][] = useMemo(
    () =>
      MusicLibrary.getInstance()?.instruments.map(folder => [
        folder.name,
        folder.id,
      ]) || [],
    []
  );

  const onPressKey = useCallback(
    (note: number) => {
      const newSelectedNotes = [...selectedNotes];
      if (newSelectedNotes.includes(note)) {
        newSelectedNotes.splice(newSelectedNotes.indexOf(note), 1);
      } else {
        newSelectedNotes.push(note);
        MusicRegistry.player.previewNote(note, instrument);
      }
      setSelectedNotes(newSelectedNotes);
    },
    [selectedNotes, instrument, setSelectedNotes]
  );

  useEffect(() => {
    if (!MusicRegistry.player.isInstrumentLoaded(instrument)) {
      setIsLoading(true);
      // If the instrument is already loading, register a callback and wait for it to finish.
      if (MusicRegistry.player.isInstrumentLoading(instrument)) {
        MusicRegistry.player.registerCallback(
          'InstrumentLoaded',
          instrumentName => {
            if (instrumentName === instrument) {
              setIsLoading(false);
            }
          }
        );
      } else {
        // Otherwise, initiate the load.
        MusicRegistry.player.setupSampler(instrument, () =>
          setIsLoading(false)
        );
      }
    }
  }, [setIsLoading, instrument]);

  useEffect(() => {
    onChange({
      notes: selectedNotes,
      playStyle,
      instrument,
    });
  }, [instrument, playStyle, selectedNotes, onChange]);

  useEffect(() => {
    setIsDisabled(selectedNotes.length >= MAX_NOTES);
  }, [selectedNotes]);

  const playPreview = useCallback(() => {
    MusicRegistry.player.previewChord(
      {
        notes: selectedNotes,
        playStyle,
        instrument,
      },
      undefined, // TODO: use onTick() callback to highlight notes
      () => setIsPlayingPreview(false)
    );
    setIsPlayingPreview(true);
  }, [selectedNotes, playStyle, instrument]);

  const stopPreview = useCallback(() => {
    MusicRegistry.player.cancelPreviews();
    setIsPlayingPreview(false);
  }, [setIsPlayingPreview]);

  useEffect(() => {
    // On unmount.
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  const onClear = useCallback(() => setSelectedNotes([]), [setSelectedNotes]);

  return (
    <div className={moduleStyles.chordPanelContainer}>
      <div className={moduleStyles.optionsRow}>
        <select
          value={instrument}
          onChange={event => setInstrument(event.target.value)}
          className={moduleStyles.dropdown}
          disabled={isLoading}
        >
          {instruments.map(([name, value]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={playStyle}
          onChange={event => setPlayStyle(event.target.value as PlayStyle)}
          className={moduleStyles.dropdown}
        >
          {styleDropdownOptions.map(([playStyle, label]) => (
            <option key={playStyle} value={playStyle}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Keybed
        numOctaves={NUM_OCTAVES}
        startOctave={START_OCTAVE}
        selectedNotes={selectedNotes}
        onPressKey={onPressKey}
        isDisabled={isDisabled || isLoading}
        isVertical={false}
      />
      <NoteGrid
        numOctaves={NUM_OCTAVES}
        startOctave={START_OCTAVE}
        selectedNotes={selectedNotes}
        playStyle={playStyle}
        instrument={instrument}
      />
      <LoadingOverlay show={isLoading} />
      <PreviewControls
        enabled={selectedNotes.length > 0 && !isLoading}
        playPreview={playPreview}
        onClickClear={onClear}
        cancelPreviews={stopPreview}
        isPlayingPreview={isPlayingPreview}
      />
    </div>
  );
};

interface NoteGridProps {
  numOctaves: number;
  startOctave: number;
  selectedNotes: number[];
  playStyle: PlayStyle;
  instrument: string;
}

const NoteGrid: React.FunctionComponent<NoteGridProps> = ({
  numOctaves,
  startOctave,
  selectedNotes,
  playStyle,
  instrument,
}) => {
  const graphNotes: ChordGraphNote[] = generateGraphDataFromChord({
    chordEventValue: {
      notes: selectedNotes,
      playStyle,
      instrument,
    },
    width: 315,
    height: 110,
    numOctaves,
    startOctave,
    padding: 2,
    noteHeightScale: 2,
  });

  return (
    <div id="notegrid-container" className={moduleStyles.noteGridContainer}>
      {graphNotes.map((graphNote: ChordGraphNote, index) => {
        return (
          <div
            key={index}
            className={moduleStyles.gridNote}
            style={{
              top: graphNote.y,
              left: graphNote.x,
              width: graphNote.width,
              height: graphNote.height,
            }}
          >
            &nbsp;
          </div>
        );
      })}
    </div>
  );
};

export default ChordPanel;
