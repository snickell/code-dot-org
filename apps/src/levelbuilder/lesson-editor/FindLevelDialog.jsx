import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import AddLevelDialogTop from '@cdo/apps/levelbuilder/lesson-editor/AddLevelDialogTop';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import i18n from '@cdo/locale';

import LessonEditorDialog from './LessonEditorDialog';

export default class AddLevelDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
  };

  render() {
    return (
      <LessonEditorDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        style={styles.dialog}
      >
        <h2>Add Levels</h2>
        <div
          style={styles.dialogContent}
          className="uitest-level-dialog-content"
        >
          <AddLevelDialogTop
            addLevel={() => {
              console.log('addLevel');
            }}
          />
        </div>
        <DialogFooter rightAlign>
          <Button
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.brandSecondaryDefault}
            className="save-add-levels-button"
          />
        </DialogFooter>
      </LessonEditorDialog>
    );
  }
}

const styles = {
  dialog: {
    width: 970,
    marginLeft: -500,
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  topArea: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15,
  },
  bottomArea: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15,
  },
  textArea: {
    width: '95%',
  },
  levelsBox: {
    border: '1px solid black',
    width: '95%',
    height: '100%',
    padding: 10,
  },
  filtersAndLevels: {
    display: 'flex',
    flexDirection: 'column',
  },
};
