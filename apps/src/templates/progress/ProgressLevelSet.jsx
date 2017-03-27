import React, { PropTypes } from 'react';
import Radium from 'radium';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import { levelType } from './progressTypes';
import { getIconForLevel } from './progressHelpers';
import ProgressPill from './ProgressPill';

const styles = {
  table: {
    marginTop: 12
  },
  nameText: {
    color: color.charcoal
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    letterSpacing: -0.12
  },
  col2: {
    paddingLeft: 30
  },
  linesAndDot: {
    whiteSpace: 'nowrap',
    marginLeft: '50%',
    marginRight: 14,
  },
  verticalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    height: 15,
    width: 3,
    position: 'relative',
    bottom: 2,
  },
  horizontalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    position: 'relative',
    top: -2,
    height: 3,
    width: '100%'
  },
  dot: {
    display: 'inline-block',
    position: 'relative',
    left: -2,
    top: 1,
    backgroundColor: color.lighter_gray,
    height: 10,
    width: 10,
    borderRadius: 10
  }
};

/**
 * A set of one or more levels that are part of the same progression
 */
const ProgressLevelSet = React.createClass({
  propTypes: {
    // TODO - can most likely get rid of start here
    start: PropTypes.number.isRequired,
    name: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
  },

  render() {
    const { name, levels, start, disabled } = this.props;

    const multiLevelStep = levels.length > 1;
    const status = multiLevelStep ? 'multi_level' : levels[0].status;

    const url = levels[0].url;

    const lastStep = start + levels.length - 1;
    let levelNumber = start;
    if (multiLevelStep) {
      levelNumber += `-${lastStep}`;
    }

    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td>
              {/*
                TODO - fixed width isn't great for i18n. likely want to come up with some
                way of having this be dynamic, but the same size across all instances
                width: 110,
              */}
              <ProgressPill
                url={multiLevelStep ? undefined : url}
                status={status}
                icon={getIconForLevel(levels[0])}
                text={i18n.levelN({levelNumber})}
                width={130}
              />
            </td>
            <td style={styles.col2}>
              <a href={url}>
                <div style={{...styles.nameText, ...styles.text}}>
                  {name}
                </div>
              </a>
            </td>
          </tr>
          {multiLevelStep &&
            <tr>
              <td>
                <div style={styles.linesAndDot}>
                  <div style={styles.verticalLine}/>
                  <div style={styles.horizontalLine}/>
                  <div style={styles.dot}/>
                </div>
              </td>
              <td style={styles.col2}>
                <ProgressBubbleSet
                  levels={levels}
                  disabled={disabled}
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    );
  }
});

export default Radium(ProgressLevelSet);
