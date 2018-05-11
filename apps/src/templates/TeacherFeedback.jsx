import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import color from "../util/color";
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

const styles = {
  container: {
    margin: 20,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.cyan,
    backgroundColor: color.lightest_cyan,
    borderRadius: 5
  },
  header: {
    color: color.white,
    backgroundColor: color.cyan,
    padding: 5,
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif'
  },
  content: {
    padding: 10
  }
};

class TeacherFeedback extends Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(['Teacher', 'Student'])
  };

  render() {
    if (!(this.props.viewAs === ViewType.Teacher)) {
      return null;
    }

    // Placeholder for upcoming feedback input
    return (
      <div style={styles.container}>
        <div style={styles.header}>{i18n.forTeachersOnly()}</div>
        <div style={styles.content}>Coming soon: You’ll be able to use this tab to give feedback to your students about their work</div>
      </div>
    );
  }
}

export default connect(state => ({
  viewAs: state.viewAs
}))(TeacherFeedback);
