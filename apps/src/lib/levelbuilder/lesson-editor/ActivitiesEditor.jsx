import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import ActivityCardAndPreview from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCardAndPreview';
import {connect} from 'react-redux';
import {addActivity} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import ReactDOM from 'react-dom';
import {activityShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  activityEditAndPreview: {
    margin: 10
  },
  addActivity: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none'
  }
};

/*
 A GUI for editing activities in a lesson. Shows
 the editing fields side by side with a preview of how they will
 look in the lesson plan.
 */

class ActivitiesEditor extends Component {
  static propTypes = {
    serializeActivities: PropTypes.func.isRequired,

    //redux
    activities: PropTypes.arrayOf(activityShape).isRequired,
    addActivity: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      targetActivityPos: null,
      targetActivitySectionPos: null
    };
  }

  handleAddActivity = () => {
    this.props.addActivity(
      this.props.activities.length,
      this.generateActivityKey()
    );
  };

  generateActivityKey = () => {
    let activityNumber = this.props.activities.length + 1;
    while (
      this.props.activities.some(
        activity => activity.key === `activity-${activityNumber}`
      )
    ) {
      activityNumber++;
    }

    return `activity-${activityNumber}`;
  };

  // To be populated with the react ref of each ActivitySectionCard element.
  sectionRefs = [];

  setActivitySectionRef = (sectionRef, activityPos, sectionPos) => {
    this.sectionRefs[activityPos] = this.sectionRefs[activityPos] || [];
    this.sectionRefs[activityPos][sectionPos] = sectionRef;
  };

  // To be populated with the bounding client rect of each ActivitySectionCard element.
  sectionMetrics = [];

  // populate sectionMetrics from sectionRefs.
  updateActivitySectionMetrics = () => {
    this.sectionMetrics = [];
    this.sectionRefs.forEach((sectionRefs, activityPos) => {
      sectionRefs.forEach((ref, sectionPos) => {
        const node = ReactDOM.findDOMNode(ref);
        const rect = !!node && node.getBoundingClientRect();
        this.sectionMetrics[activityPos] =
          this.sectionMetrics[activityPos] || [];
        this.sectionMetrics[activityPos][sectionPos] = rect;
      });
    });
  };

  // Given a clientY value of a location on the screen, find the ActivityCard
  // and ActivitySectionCard corresponding to that location, and update
  // targetActivityPos and targetActivitySectionPos to match.
  updateTargetActivitySection = y => {
    this.sectionMetrics.forEach((sectionMetrics, activityPos) => {
      sectionMetrics.forEach((rect, sectionPos) => {
        if (y > rect.top && y < rect.top + rect.height) {
          this.setState({
            targetActivityPos: activityPos,
            targetActivitySectionPos: sectionPos
          });
        }
      });
    });
  };

  render() {
    const {activities} = this.props;

    return (
      <div style={styles.activityEditAndPreview}>
        {activities.map(activity => (
          <ActivityCardAndPreview
            key={activity.key}
            activity={activity}
            activitiesCount={activities.length}
            setActivitySectionRef={this.setActivitySectionRef}
            updateTargetActivitySection={this.updateTargetActivitySection}
            targetActivityPos={this.state.targetActivityPos}
            targetActivitySectionPos={this.state.targetActivitySectionPos}
            activitySectionMetrics={this.sectionMetrics}
            updateActivitySectionMetrics={this.updateActivitySectionMetrics}
          />
        ))}
        <button
          onMouseDown={this.handleAddActivity}
          className="btn add-activity"
          style={styles.addActivity}
          type="button"
        >
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Activity
        </button>
        <input
          type="hidden"
          name="activities"
          value={this.props.serializeActivities()}
        />
      </div>
    );
  }
}

export const UnconnectedActivitiesEditor = ActivitiesEditor;

export default connect(
  state => ({
    activities: state.activities
  }),
  {
    addActivity
  }
)(ActivitiesEditor);
