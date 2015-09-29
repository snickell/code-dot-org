var React = require('react');
var applabMsg = require('./locale');
var CrosshairOverlay = require('./CrosshairOverlay.jsx');

module.exports = React.createClass({
  propTypes: {
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired,
    scale: React.PropTypes.number.isRequired,
    isApplabRunning: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {
      mouseX: 0,
      mouseY: 0
    };
  },

  isMouseInVisualization: function () {
    return (this.state.mouseX >= 0) &&
        (this.state.mouseX <= this.props.appWidth) &&
        (this.state.mouseY >= 0) &&
        (this.state.mouseY <= this.props.appHeight);
  },

  shouldShowCrosshair: function () {
    return !this.props.isApplabRunning && this.isMouseInVisualization();
  },

  onSvgMouseMove: function (e) {
    var svg = React.findDOMNode(this.refs.svg_);
    var screenToSvg = svg.getScreenCTM().inverse();
    var unscale = svg.createSVGMatrix().scale(1 / this.props.scale);
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    pt = pt.matrixTransform(screenToSvg).matrixTransform(unscale);

    this.setState({
      mouseX: pt.x,
      mouseY: pt.y
    });
  },

  render: function() {
    var overlayComponents = [];
    if (this.shouldShowCrosshair()) {
      overlayComponents.push(<CrosshairOverlay x={this.state.mouseX} y={this.state.mouseY} />);
    }

    return <svg ref="svg_">{overlayComponents}</svg>;
  },

  componentDidMount: function() {
    document.addEventListener('mousemove', this.onSvgMouseMove);
  },

  componentWillUnmount: function() {
    document.removeEventListener('mousemove', this.onSvgMouseMove);
  }
});
