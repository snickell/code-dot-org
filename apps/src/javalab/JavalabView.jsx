import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import JavalabConsole from './JavalabConsole';
import JavalabEditor from './JavalabEditor';
import JavalabSettings from './JavalabSettings';
import {appendOutputLog, setIsDarkMode, setIsRunning} from './javalabRedux';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import VisualizationResizeBar from '@cdo/apps/lib/ui/VisualizationResizeBar';
import ControlButtons from './ControlButtons';
import JavalabButton from './JavalabButton';

const FOOTER_BUFFER = 10;

class JavalabView extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    onInputMessage: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,
    visualization: PropTypes.object,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    disableFinishButton: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    appendOutputLog: PropTypes.func,
    setIsDarkMode: PropTypes.func,
    channelId: PropTypes.string,
    isEditingStartSources: PropTypes.bool,
    isRunning: PropTypes.bool,
    setIsRunning: PropTypes.func,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    awaitingContainedResponse: PropTypes.bool,
    isSubmittable: PropTypes.bool,
    isSubmitted: PropTypes.bool
  };

  state = {
    isTesting: false,
    rightContainerHeight: 800
  };

  componentDidMount() {
    this.props.onMount();
    this.setRightContainerHeight();
  }

  compile = () => {
    this.props.appendOutputLog('Compiling program...');
    this.props.appendOutputLog('Compiled!');
  };

  // Sends redux call to update dark mode, which handles user preferences
  renderSettings = () => {
    const {isDarkMode, setIsDarkMode} = this.props;
    return [
      <a onClick={() => setIsDarkMode(!isDarkMode)} key="theme-setting">
        Switch to {isDarkMode ? 'light mode' : 'dark mode'}
      </a>
    ];
  };

  // This controls the 'run' button state, but stopping program execution is not yet
  // implemented and will need to be added here.
  toggleRun = () => {
    const toggledIsRunning = !this.props.isRunning;
    this.props.setIsRunning(toggledIsRunning);
    if (toggledIsRunning) {
      this.props.onRun();
    } else {
      // TODO: Stop program execution.
    }
  };

  // This controls the 'test' button state, but running/stopping tests
  // is not yet implemented and will need to be added here.
  toggleTest = () => {
    this.setState(
      state => ({isTesting: !state.isTesting}),
      () => {
        // TODO: Run/stop tests.
      }
    );
  };

  renderVisualization = () => {
    const {visualization} = this.props;
    if (visualization) {
      return <div style={styles.preview}>{visualization}</div>;
    }

    // This workaround is necessary because <VisualizationResizeBar /> requires
    // an element with ID 'visualization' or it will not resize.
    return <div id="visualization" />;
  };

  setRightContainerHeight = () => {
    let rightContainerHeight = this.editorAndVisualization.getBoundingClientRect()
      .top;
    let topPos = window.innerHeight - rightContainerHeight - FOOTER_BUFFER;
    this.setState({
      rightContainerHeight: topPos
    });
  };

  render() {
    const {
      isDarkMode,
      onCommitCode,
      onInputMessage,
      onContinue,
      handleVersionHistory,
      isEditingStartSources,
      isRunning,
      showProjectTemplateWorkspaceIcon,
      awaitingContainedResponse
    } = this.props;
    const {isTesting, rightContainerHeight} = this.state;

    if (isDarkMode) {
      document.body.style.backgroundColor = '#1b1c17';
    } else {
      document.body.style.backgroundColor = color.background_gray;
    }

    let finishButtonText, finishButtonId;
    if (this.props.isSubmitted) {
      finishButtonText = i18n.unsubmit();
      finishButtonId = 'unsubmitButton';
    } else if (this.props.isSubmittable) {
      finishButtonText = i18n.submit();
      finishButtonId = 'submitButton';
    } else {
      finishButtonText = i18n.finish();
      finishButtonId = 'javalabFinish';
    }
    return (
      <StudioAppWrapper>
        <div
          style={{
            ...styles.javalab,
            ...{height: rightContainerHeight}
          }}
        >
          <div style={styles.buttons}>
            <JavalabSettings>{this.renderSettings()}</JavalabSettings>
            {!isEditingStartSources && (
              <JavalabButton
                text={finishButtonText}
                id={finishButtonId}
                onClick={onContinue}
                style={styles.finish}
                isDisabled={this.props.disableFinishButton}
              />
            )}
          </div>
          <div
            ref={ref => (this.editorAndVisualization = ref)}
            style={styles.editorAndVisualization}
          >
            <div
              id="visualizationColumn"
              className="responsive"
              style={styles.instructionsAndPreview}
            >
              <TopInstructions
                mainStyle={styles.instructions}
                standalone
                displayDocumentationTab
                displayReviewTab
              />
              {this.renderVisualization()}
            </div>
            <VisualizationResizeBar />
            <div
              style={{
                ...styles.editorAndConsole,
                color: isDarkMode ? color.white : color.black
              }}
              className="editor-column"
            >
              <JavalabEditor
                onCommitCode={onCommitCode}
                handleVersionHistory={handleVersionHistory}
                showProjectTemplateWorkspaceIcon={
                  showProjectTemplateWorkspaceIcon
                }
              />
              <JavalabConsole
                onInputMessage={onInputMessage}
                style={styles.consoleParent}
                leftColumn={
                  <ControlButtons
                    isRunning={isRunning}
                    isDarkMode={isDarkMode}
                    isTesting={isTesting}
                    toggleRun={this.toggleRun}
                    toggleTest={this.toggleTest}
                    isDisabled={awaitingContainedResponse}
                  />
                }
              />
            </div>
          </div>
        </div>
      </StudioAppWrapper>
    );
  }
}

const styles = {
  instructionsAndPreview: {
    color: color.black,
    right: '15px'
  },
  instructions: {
    width: '100%',
    position: 'relative',
    marginLeft: 0,
    color: color.black,
    left: 0
  },
  editorAndConsole: {
    right: '15px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  consoleParent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flexGrow: 1,
    overflowY: 'hidden'
  },
  editorAndVisualization: {
    display: 'flex',
    flexGrow: '1',
    height: '100%'
  },
  preview: {
    backgroundColor: color.light_gray,
    height: '200px',
    marginTop: '13px'
  },
  javalab: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  clear: {
    clear: 'both'
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    margin: '10px 0',
    overflowY: 'hidden'
  },
  finish: {
    backgroundColor: color.orange,
    borderColor: color.orange,
    fontFamily: '"Gotham 5r"',
    fontSize: '15px',
    padding: '1px 8px',
    margin: '5px 0 5px 5px'
  }
};

// We use the UnconnectedJavalabView to make this component's methods testable.
// This is a deprecated pattern but calling shallow().dive().instance() on the
// connected JavalabView does not give us access to the methods owned by JavalabView.
export const UnconnectedJavalabView = JavalabView;
export default connect(
  state => ({
    isProjectLevel: state.pageConstants.isProjectLevel,
    channelId: state.pageConstants.channelId,
    isDarkMode: state.javalab.isDarkMode,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isRunning: state.javalab.isRunning,
    showProjectTemplateWorkspaceIcon: !!state.pageConstants
      .showProjectTemplateWorkspaceIcon,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    disableFinishButton: state.javalab.disableFinishButton,
    isSubmittable: state.pageConstants.isSubmittable,
    isSubmitted: state.pageConstants.isSubmitted
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setIsDarkMode: isDarkMode => dispatch(setIsDarkMode(isDarkMode)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning))
  })
)(UnconnectedJavalabView);
