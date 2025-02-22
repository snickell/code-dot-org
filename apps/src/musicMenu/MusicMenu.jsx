import React from 'react';

const optionsList = [
  {
    name: 'blocks',
    type: 'radio',
    values: [
      {value: 'simple', description: 'A simple set of blocks.'},
      {
        value: 'simple2',
        description:
          'A simple set of blocks, with together/sequential and functions.',
      },
      {value: 'advanced', description: 'An advanced set of blocks.'},
      {value: 'tracks', description: 'A tracks-based model set of blocks.'},
    ],
  },
  {
    name: 'instructions-position',
    type: 'radio',
    values: [
      {value: 'top', description: 'Instructions begin at the top.'},
      {value: 'left', description: 'Instructions begin on the left.'},
      {value: 'right', description: 'Instructions begin on the right.'},
    ],
  },
  {
    name: 'local-library',
    type: 'radio',
    values: [
      {value: 'false', description: 'Use online library file.'},
      {value: 'true', description: 'Use local library file.'},
    ],
  },
  {
    name: 'base-asset-url',
    type: 'string',
    description: 'Use a specific base asset URL.',
  },
  {
    name: 'library',
    type: 'string',
    description: 'Use a specific music library file.',
  },
  {
    name: 'show-sound-filters',
    type: 'radio',
    values: [
      {value: 'false', description: 'Hide sound filters.'},
      {value: 'true', description: 'Show sound filters.'},
    ],
  },
  {
    name: 'show-tts',
    type: 'radio',
    values: [
      {value: 'false', description: 'Hide text to speech.'},
      {value: 'true', description: 'Show text to speech.'},
    ],
  },
  {
    name: 'tts-play-pause',
    type: 'radio',
    values: [
      {
        value: 'false',
        description:
          'Disable play/pause functionality for text to speech (default).',
      },
      {
        value: 'true',
        description: 'Enable play/pause functionality for text to speech.',
      },
    ],
  },
  {
    name: 'tts-play-icon',
    type: 'string',
    description: 'Use a specific icon for text to speech play button.',
  },
  {
    name: 'tts-stop-icon',
    type: 'string',
    description: 'Use a specific icon for text to speech stop button.',
  },
  {
    name: 'play-tune-block',
    type: 'radio',
    values: [
      {value: 'false', description: 'Hide play tune block (default).'},
      {value: 'true', description: 'Show play tune block.'},
    ],
  },
  {
    name: 'play-pattern-ai-block',
    type: 'radio',
    values: [
      {value: 'false', description: 'Hide play pattern AI block (default).'},
      {value: 'true', description: 'Show play pattern AI block.'},
    ],
  },
  {
    name: 'hide-ai-temperature',
    type: 'radio',
    values: [
      {value: 'false', description: 'Show AI temperature (default).'},
      {value: 'true', description: 'Hide AI temperature.'},
    ],
  },
  {
    name: 'show-ai-temperature-explanation',
    type: 'radio',
    values: [
      {
        value: 'false',
        description: 'Hide AI temperature explanation (default).',
      },
      {value: 'true', description: 'Show AI temperature.'},
    ],
  },
  {
    name: 'show-ai-generate-again-help',
    type: 'radio',
    values: [
      {
        value: 'false',
        description: "Don't show AI generate again help (default).",
      },
      {value: 'true', description: 'Show AI generate again help.'},
    ],
  },
  {
    name: 'BPM',
    type: 'string',
    description: 'Set a specific BPM',
  },
  {
    name: 'key',
    type: 'string',
    description: 'Set a specific key by name (i.e. "C", "C#", "D", etc)',
  },
  {
    name: 'skip-controls-enabled',
    type: 'radio',
    values: [
      {value: 'false', description: 'Disable skip controls.'},
      {value: 'true', description: 'Enable skip controls.'},
    ],
  },
  {
    name: 'ui-keyboard-shortcuts-enabled',
    type: 'radio',
    values: [
      {value: 'false', description: 'Disable keyboard shortcuts.'},
      {value: 'true', description: 'Enable keyboard shortcuts.'},
    ],
  },
  {
    name: 'player',
    type: 'radio',
    values: [
      {value: 'sample', description: 'Use the sample player (legacy).'},
      {value: 'tonejs', description: 'Use the ToneJS player (default).'},
    ],
  },
  {
    name: 'allow-change-starting-playhead-position',
    type: 'radio',
    values: [
      {
        value: 'false',
        description: "Don't allow change starting playhead position (default).",
      },
      {value: 'true', description: 'Allow change starting playhead position.'},
    ],
  },
  {
    name: 'use-secondary-finish-button',
    type: 'radio',
    values: [
      {
        value: 'false',
        description: "Don't use secondary finish button (default).",
      },
      {value: 'true', description: 'Use secondary finish button.'},
    ],
  },
  {
    name: 'show-secondary-finish-button-question',
    type: 'radio',
    values: [
      {
        value: 'false',
        description: "Don't show secondary finish button question (default).",
      },
      {value: 'true', description: 'Show secondary finish button question.'},
    ],
  },
  {
    name: 'advanced-controls-enabled',
    type: 'radio',
    values: [
      {
        value: 'false',
        description:
          'Disable advanced controls for the ToneJS player (default).',
      },
      {
        value: 'true',
        description: 'Enable advanced controls for the ToneJS player.',
      },
    ],
  },
  {
    name: 'timeline-original-layout',
    type: 'radio',
    values: [
      {value: 'false', description: 'New timeline (default).'},
      {value: 'true', description: 'Original timeline.'},
    ],
  },
];

export default class MusicMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: {},
      values: {},
    };
  }

  handleCheckChange(e) {
    const name = e.target.name;
    const isChecked = e.target.checked;

    let checked = {...this.state.checked};
    if (isChecked) {
      checked[name] = true;
    } else {
      delete checked[name];
    }
    this.setState({checked});
  }

  handleRadioChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    let values = {...this.state.values};
    values[name] = value;
    this.setState({values});
  };

  handleStringChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    let values = {...this.state.values};
    values[name] = value;
    this.setState({values});
  };

  renderRadio(option) {
    return (
      <div>
        {option.values.map(value => {
          return (
            <div key={value.value} style={{paddingBottom: 3}}>
              <label>
                <input
                  type="radio"
                  style={{marginTop: -3, marginRight: 5}}
                  name={option.name}
                  value={value.value}
                  onChange={this.handleRadioChange}
                />
                {value.value}: {value.description}
              </label>
            </div>
          );
        })}
      </div>
    );
  }

  renderString(option) {
    return (
      <div>
        <input
          type="text"
          style={{marginRight: 10}}
          name={option.name}
          value={this.state.values[option.name]}
          onChange={this.handleStringChange}
        />
        {option.description}
      </div>
    );
  }

  renderResults() {
    return (
      <div
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          margin: '20px 0',
          userSelect: 'all',
        }}
      >
        ?
        {optionsList
          .map(option => {
            return (
              this.state.checked[option.name] &&
              option.name + '=' + this.state.values[option.name]
            );
          })
          .filter(entry => entry)
          .join('&')}
      </div>
    );
  }

  renderOptions() {
    return (
      <div style={{userSelect: 'none'}}>
        {optionsList.map(option => {
          return (
            <div key={option.name}>
              <label>
                <input
                  type="checkbox"
                  name={option.name}
                  checked={this.state.checked[option.name]}
                  style={{marginTop: -3, marginRight: 5}}
                  onChange={e => this.handleCheckChange(e)}
                />
                {option.name}
              </label>
              <div style={{padding: '5px 10px 15px 18px'}}>
                {option.type === 'radio' && this.renderRadio(option)}
                {option.type === 'string' && this.renderString(option)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="main" style={{maxWidth: 970, margin: '0 auto 80px auto'}}>
        <h1>Music Lab options</h1>
        {this.renderResults()}
        {this.renderOptions()}
      </div>
    );
  }
}
