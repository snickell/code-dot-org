var React = require('react');

var PropertyRow = require('./PropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow.jsx');

var elementUtils = require('./elementUtils');

var ScreenProperties = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <div id='propertyRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true} />
        <ColorPickerPropertyRow
          desc={'background color'}
          initialValue={elementUtils.rgb2hex(element.style.backgroundColor)}
          handleChange={this.props.handleChange.bind(this, 'backgroundColor')} />
        <ImagePickerPropertyRow
          desc={'image'}
          initialValue={element.getAttribute('data-canonical-image-url') || ''}
          handleChange={this.props.handleChange.bind(this, 'screen-image')} />
      </div>);
  }
});

var ScreenEvents = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      <div id='eventRowContainer'>
        <PropertyRow
          desc={'id'}
          initialValue={element.id}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}/>
      </div>
    );
  }
});

module.exports = {
  PropertyTab: ScreenProperties,
  EventTab: ScreenEvents,

  create: function () {
    var element = document.createElement('div');
    element.setAttribute('class', 'screen');
    element.style.display = 'block';
    element.style.height = Applab.appHeight + 'px';
    element.style.width = Applab.appWidth + 'px';
    element.style.left = '0px';
    element.style.top = '0px';
    // We want our screen to be behind canvases. By setting any z-index on the
    // screen element, we create a new stacking context with this div as its
    // root, which results in all children (including canvas) to appear in front
    // of it, regardless of their z-index value.
    // see http://philipwalton.com/articles/what-no-one-told-you-about-z-index/
    element.style.position = 'absolute';
    element.style.zIndex = 0;

    return element;
  },
  onDeserialize: function (element, onPropertyChange) {
    var url = element.getAttribute('data-canonical-image-url');
    if (url) {
      onPropertyChange(element, 'screen-image', url);
    }
    // Properly position existing screens, so that canvases appear correctly.
    element.style.position = 'absolute';
    element.style.zIndex = 0;
  }
};
