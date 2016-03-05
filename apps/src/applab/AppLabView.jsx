/** @file Top-level view for App Lab */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var connect = require('react-redux').connect;
var PlaySpaceHeader = require('./PlaySpaceHeader.jsx');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv.jsx');
var ConnectedStudioAppWrapper = require('./ConnectedStudioAppWrapper.jsx');

/**
 * Top-level React wrapper for App Lab.
 */
var AppLabView = React.createClass({
  propTypes: {
    isEditingProject: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,

    startInDesignMode: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,

    renderCodeWorkspace: React.PropTypes.func.isRequired,
    renderVisualizationColumn: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    this.props.onMount();
  },

  render: function () {
    var playSpaceHeader;
    if (!this.props.isReadOnlyWorkspace) {
      playSpaceHeader = <PlaySpaceHeader
          isEditingProject={this.props.isEditingProject}
          startInDesignMode={this.props.startInDesignMode}
          screenIds={this.props.screenIds}
          onDesignModeButton={this.props.onDesignModeButton}
          onCodeModeButton={this.props.onCodeModeButton}
          onViewDataButton={this.props.onViewDataButton}
          onScreenChange={this.props.onScreenChange}
          onScreenCreate={this.props.onScreenCreate} />;
    }

    return (
      <ConnectedStudioAppWrapper>
        <div id="visualizationColumn">
          {playSpaceHeader}
          <ProtectedStatefulDiv renderContents={this.props.renderVisualizationColumn} />
        </div>
        <ProtectedStatefulDiv id="visualizationResizeBar" className="fa fa-ellipsis-v" />
        <ProtectedStatefulDiv
            id="codeWorkspace"
            renderContents={this.props.renderCodeWorkspace} />
      </ConnectedStudioAppWrapper>
    );
  }
});
module.exports = connect(function propsFromState(state) {
  return {
    isReadOnlyWorkspace: state.isReadOnlyWorkspace
  };
})(AppLabView);
