import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {Heading1, h3Style} from "../../lib/ui/Headings";
import * as styleConstants from '@cdo/apps/styleConstants';
import Button from '../Button';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { sectionShape, assignmentShape } from './shapes';
import DialogFooter from './DialogFooter';
import i18n from '@cdo/locale';
import {
  editSectionProperties,
  cancelEditingSection,
} from './teacherSectionsRedux';

const style = {
  root: {
    width: styleConstants['content-width'],
  },
  dropdown: {
    padding: '0.3em',
  },
  sectionNameInput: {
    // Full-width, large happy text, lots of space.
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 'large',
    padding: '0.5em',
  }
};

class EditSectionForm extends Component{
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleSave: PropTypes.func.isRequired,

    //Comes from redux
    validGrades: PropTypes.arrayOf(PropTypes.string).isRequired,
    validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
    primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    sections: PropTypes.objectOf(sectionShape).isRequired,
    section: sectionShape.isRequired,
    editSectionProperties: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  render(){
    const {
      section,
      title,
      validGrades,
      validAssignments,
      primaryAssignmentIds,
      editSectionProperties
    } = this.props;
    return (
      <div style={style.root}>
        <Heading1>
          {title}
        </Heading1>
        <div>
          <SectionNameField
            value={section.name}
            onChange={name => editSectionProperties({name})}
          />
          <GradeField
            value={section.grade}
            onChange={grade => editSectionProperties({grade})}
            validGrades={validGrades}
          />
          <AssignmentField
            section={section}
            onChange={ids => editSectionProperties(ids)}
            validAssignments={validAssignments}
            primaryAssignmentIds={primaryAssignmentIds}
          />
          <LessonExtrasField
            value={section.stageExtras}
            onChange={stageExtras => editSectionProperties({stageExtras})}
          />
          <PairProgrammingField
            value={section.pairingAllowed}
            onChange={pairingAllowed => editSectionProperties({pairingAllowed})}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={this.props.handleClose}
            text={i18n.dialogCancel()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.gray}
          />
          <Button
            onClick={this.props.handleSave}
            text={i18n.save()}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </div>
    );
  }
}

export const UnconnectedEditSectionForm = EditSectionForm;

export default connect(state => ({
  validGrades: state.teacherSections.validGrades,
  validAssignments: state.teacherSections.validAssignments,
  primaryAssignmentIds: state.teacherSections.primaryAssignmentIds,
  sections: state.teacherSections.sections,
  section: state.teacherSections.sectionBeingEdited,
}), {
  editSectionProperties,
  handleClose: cancelEditingSection,
})(EditSectionForm);

const FieldProps = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

const SectionNameField = ({value, onChange}) => (
  <div>
    <FieldName>
      {i18n.sectionName()}
    </FieldName>
    <FieldDescription>
      {i18n.addSectionName()}
    </FieldDescription>
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
      style={style.sectionNameInput}
    />
  </div>
);
SectionNameField.propTypes = FieldProps;

const GradeField = ({value, onChange, validGrades}) => {
  const gradeOptions = [""]
    .concat(validGrades)
    .map(grade => ({
      value: grade,
      text: grade === 'Other' ? 'Other/Mixed' : grade,
    }));
  return (
    <div>
      <FieldName>
        {i18n.grade()}
      </FieldName>
      <Dropdown
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {gradeOptions.map((grade, index) => (
          <option key={index} value={grade.value}>{grade.text}</option>
        ))}
      </Dropdown>
    </div>
  );
};
GradeField.propTypes = {
  ...FieldProps,
  validGrades: PropTypes.arrayOf(PropTypes.string).isRequired
};

const AssignmentField = ({
  section,
  onChange,
  validAssignments,
  primaryAssignmentIds,
}) => (
  <div>
    <FieldName>
      {i18n.course()}
    </FieldName>
    <FieldDescription>
      {i18n.whichCourse()}
    </FieldDescription>
    <AssignmentSelector
      section={section}
      onChange={ids => onChange(ids)}
      primaryAssignmentIds={primaryAssignmentIds}
      assignments={validAssignments}
      chooseLaterOption={true}
      dropdownStyle={style.dropdown}
    />
  </div>
);
AssignmentField.propTypes = {
  section: sectionShape,
  onChange: PropTypes.func.isRequired,
  validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
  primaryAssignmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const LessonExtrasField = ({value, onChange}) => (
  <div>
    <FieldName>
      {i18n.enableLessonExtras()}
    </FieldName>
    <FieldDescription>
      {i18n.explainLessonExtras()}
      {' '}
      <a
        href="https://support.code.org/hc/en-us/articles/228116568-In-the-teacher-dashboard-what-are-stage-extras-"
        target="_blank"
      >
        {i18n.explainLessonExtrasLearnMore()}
      </a>
    </FieldDescription>
    <YesNoDropdown
      value={value}
      onChange={stageExtras => onChange(stageExtras)}
    />
  </div>
);
LessonExtrasField.propTypes = FieldProps;

const PairProgrammingField = ({value, onChange}) => (
  <div>
    <FieldName>
      {i18n.enablePairProgramming()}
    </FieldName>
    <FieldDescription>
      {i18n.explainPairProgramming()}
      {' '}
      <a
        href="https://support.code.org/hc/en-us/articles/115002122788-How-does-pair-programming-within-Code-Studio-work-"
        target="_blank"
      >
        {i18n.explainPairProgrammingLearnMore()}
      </a>
    </FieldDescription>
    <YesNoDropdown
      value={value}
      onChange={pairingAllowed => onChange(pairingAllowed)}
    />
  </div>
);
PairProgrammingField.propTypes = FieldProps;

const FieldName = props => (
  <div
    style={{
      ...h3Style,
      marginTop: 20,
      marginBottom: 0,
    }}
    {...props}
  />
);

const FieldDescription = props => (
  <div
    style={{
      marginBottom: 5,
    }}
    {...props}
  />
);

const Dropdown = props => (
  <select style={style.dropdown} {...props}/>
);

const YesNoDropdown = ({value, onChange}) => (
  <Dropdown
    value={value ? 'yes' : 'no'}
    onChange={event => onChange('yes' === event.target.value)}
  >
    <option value="yes">{i18n.yes()}</option>
    <option value="no">{i18n.no()}</option>
  </Dropdown>
);
YesNoDropdown.propTypes = FieldProps;
