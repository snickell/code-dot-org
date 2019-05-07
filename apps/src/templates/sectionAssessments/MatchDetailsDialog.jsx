import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {getCurrentQuestion, QuestionType} from './sectionAssessmentsRedux';
import color from '@cdo/apps/util/color';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';
import {matchDetailsQuestionPropType} from './assessmentDataShapes';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  },
  answers: {
    float: 'left',
    width: 550
  },
  icon: {
    color: color.level_perfect
  },
  iconSpace: {
    width: 40,
    float: 'left'
  },
  answerBlock: {
    width: '100%'
  },
  answerLetter: {
    width: 30,
    float: 'left',
    fontWeight: 'bold'
  }
};

class MatchDetailsDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    questionAndAnswers: matchDetailsQuestionPropType
  };

  render() {
    const {questionAndAnswers} = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.closeDialog}
      >
        {questionAndAnswers.questionType === QuestionType.MATCH && (
          <div>
            <h2>{i18n.questionDetails()}</h2>
            <div style={styles.instructions}>
              <UnsafeRenderedMarkdown markdown={questionAndAnswers.question} />
            </div>
            {questionAndAnswers.answers &&
              questionAndAnswers.options &&
              questionAndAnswers.answers.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>{i18n.option()}</th>
                      <th>{i18n.answer()}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionAndAnswers.answers.map((answer, index) => {
                      return (
                        <tr key={index}>
                          <td>{questionAndAnswers.options[index]}</td>
                          <td>{answer}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </div>
        )}
        <DialogFooter>
          <Button
            text={i18n.done()}
            onClick={this.props.closeDialog}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

export const UnconnectedMatchDetailsDialog = MatchDetailsDialog;

export default connect(state => ({
  questionAndAnswers: getCurrentQuestion(state)
}))(MatchDetailsDialog);
