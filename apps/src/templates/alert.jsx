/* global $ */
var colors = require('../sharedJsxStyles').colors;

/**
 * Simple boot-strapped style alert.
 */
var Alert = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  render: function () {
    var styles = {
      main: {
        position: 'absolute',
        zIndex: 1000,
        top: 45,
        left: 350,
        right: 50
      },
      child: {
        // from bootstrap's alert
        padding: '8px 35px 8px 14px',
        marginBottom: 20,
        textShadoow: '0 1px 0 rgba(255, 255, 255, 0.5)',
        border: '1px solid #fbeed5',
        borderRadius: 4,
        // from alert-error
        backgroundColor: colors.bootstrap.errorBackground,
        color: colors.bootstrap.errorText
      },
      closeButton: {
        margin: 0,
        // from bootstrap's close (note: we've lost :hover)
        padding: 0,
        cursor: 'pointer',
        background: 'transparent',
        border: 0,
        WebkitAppearance: 'none',
        float: 'right',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: '20px',
        color: 'black',
        textShadow: '0 1px 0 white',
        opacity: 0.2,
        position: 'relative',
        top: -2,
        right: -21
      }
    };

    return (
      <div style={styles.main}>
        <div style={styles.child}>
          <button style={styles.closeButton}>
            <span onClick={this.props.onClose}>&times;</span>
          </button>
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Alert;
