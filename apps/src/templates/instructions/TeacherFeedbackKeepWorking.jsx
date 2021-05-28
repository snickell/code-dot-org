import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import ReactTooltip from 'react-tooltip';
import {makeEnum} from '@cdo/apps/utils';

const ReviewStates = makeEnum('completed', 'keepWorking');

class TeacherFeedbackKeepWorking extends Component {
  static propTypes = {
    latestFeedback: PropTypes.object,
    reviewState: PropTypes.oneOf(Object.values(ReviewStates)),
    setReviewState: PropTypes.func,
    setReviewStateChanged: PropTypes.func
  };

  checkbox = null;

  componentDidMount() {
    if (this.isAwaitingTeacherReview()) {
      this.checkbox.indeterminate = true;
    }
  }

  isAwaitingTeacherReview() {
    const {
      student_last_updated,
      created_at,
      review_state
    } = this.props.latestFeedback;

    const previouslyMarkedKeepWorking =
      review_state === ReviewStates.keepWorking;

    const studentHasUpdated =
      student_last_updated && student_last_updated > created_at;

    return previouslyMarkedKeepWorking && studentHasUpdated;
  }

  onCheckboxChange = () => {
    const newReviewState = this.getNewReviewState();
    this.props.setReviewState(newReviewState);

    const isDifferentFromInitial = this.isDifferentFromInitial(newReviewState);
    this.props.setReviewStateChanged(isDifferentFromInitial);
  };

  getNewReviewState() {
    let newReviewState = null;

    if (this.checkbox.checked) {
      newReviewState = ReviewStates.keepWorking;
    } else if (this.isAwaitingTeacherReview()) {
      newReviewState = ReviewStates.completed;
    }

    return newReviewState;
  }

  isDifferentFromInitial(newReviewState) {
    const removedIndeterminateState =
      this.isAwaitingTeacherReview() && !this.checkbox.indeterminate;
    const reviewStateChanged =
      newReviewState !== this.props.latestFeedback.review_state;

    return removedIndeterminateState || reviewStateChanged;
  }

  getTooltipText() {
    if (this.isAwaitingTeacherReview()) {
      return i18n.teacherFeedbackAwaitingReviewTooltip();
    }
    return i18n.teacherFeedbackKeepWorkingTooltip();
  }

  render() {
    return (
      <div style={styles.keepWorking}>
        <input
          id="keep-working"
          ref={ref => (this.checkbox = ref)}
          type="checkbox"
          style={styles.checkbox}
          checked={this.props.reviewState === ReviewStates.keepWorking}
          onChange={this.onCheckboxChange}
        />
        <div data-tip data-place="bottom" data-for="keep-working-tooltip">
          <label htmlFor="keep-working" style={styles.label}>
            <span style={styles.keepWorkingText}>{i18n.keepWorking()}</span>
            {this.isAwaitingTeacherReview() && (
              <span style={styles.awaitingReviewText}>
                <span style={styles.awaitingReviewSpacer}>-</span>
                {i18n.awaitingTeacherReview()}
              </span>
            )}
          </label>
          <ReactTooltip id="keep-working-tooltip" role="tooltip" effect="solid">
            <div style={styles.tooltipContent}>{this.getTooltipText()}</div>
          </ReactTooltip>
        </div>
      </div>
    );
  }
}

const styles = {
  keepWorking: {
    display: 'inline-flex',
    margin: '0 20px'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginTop: '2px'
  },
  label: {
    fontSize: '13px',
    color: color.charcoal,
    margin: '0 8px'
  },
  keepWorkingText: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold'
  },
  awaitingReviewSpacer: {
    margin: '0 3px'
  },
  awaitingReviewText: {
    fontStyle: 'italic'
  },
  tooltipContent: {
    maxWidth: '250px'
  }
};

export default TeacherFeedbackKeepWorking;
