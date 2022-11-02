import React from 'react';
import ReactDOM from 'react-dom';
import SoundsPanel from './SoundsPanel';

var CustomFields = CustomFields || {};

/**
 * Class for an editable pitch field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
class FieldSounds extends Blockly.FieldTextInput {
  /**
   * All pitches available for the picker.
   */
  static NOTES = 'C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4'.split(/ /);

  constructor(text, renderFn) {
    super(text);

    this.renderFn = renderFn;

    // Disable spellcheck.
    this.setSpellcheck(false);

    /**
     * Click event data.
     * @type {?Blockly.browserEvents.Data}
     * @private
     */
    this.clickWrapper_ = null;

    /**
     * Move event data.
     * @type {?Blockly.browserEvents.Data}
     * @private
     */
    this.moveWrapper_ = null;
  }

  /**
   * Construct a FieldSounds from a JSON arg object.
   * @param {!Object} options A JSON object with options (pitch).
   * @returns {!FieldSounds} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldSounds(options.sample, options.renderFn);
  }

  /**
   * Show the inline free-text editor on top of the text and the pitch picker.
   * @protected
   */
  showEditor_() {
    super.showEditor_();

    const div = Blockly.WidgetDiv.DIV;
    if (!div.firstChild) {
      // Mobile interface uses Blockly.dialog.setPrompt().
      return;
    }
    // Build the DOM.
    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    Blockly.DropDownDiv.setColour(
      this.sourceBlock_.style.colourPrimary,
      this.sourceBlock_.style.colourTertiary
    );

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this)
    );

    // The pitch picker is different from other fields in that it updates on
    // mousemove even if it's not in the middle of a drag.  In future we may
    // change this behaviour.  For now, using `bind` instead of
    // `conditionalBind` allows it to work without a mousedown/touchstart.
    /*this.clickWrapper_ =
        Blockly.browserEvents.bind(this.imageElement_, 'click', this,
        this.hide_);
    this.moveWrapper_ =
        Blockly.browserEvents.bind(this.imageElement_, 'mousemove', this,
        this.onMouseMove);*/

    this.updateGraph_();
  }

  /**
   * Create the pitch picker.
   * @returns {!Element} The newly created pitch picker.
   * @private
   */
  dropdownCreate_() {
    this.newDiv_ = document.createElement('div');

    this.renderFn(this.newDiv_);

    ReactDOM.render(<SoundsPanel />, this.newDiv_);

    /*
    const library = window.library;
    const group = library.groups[0];
    for (let folder of group.folders) {
      for (let sound of folder.sounds) {
        const newLineContainer = document.createElement('div');
        const newLine = document.createTextNode(folder.name + '/' + sound.name);
        newLineContainer.appendChild(newLine);

        const playButton = document.createElement('span');
        playButton.innerHTML = '&nbsp; <i class="fa fa-play-circle"/>';
        newLineContainer.appendChild(playButton);

        this.newDiv_.appendChild(newLineContainer);
      }
    }
    */

    this.newDiv_.style.color = 'white';
    this.newDiv_.style.width = '300px';
    this.newDiv_.style.backgroundColor = 'black';
    this.newDiv_.style.padding = '5px';
    this.newDiv_.style.cursor = 'pointer';

    return this.newDiv_;
  }

  /**
   * Dispose of events belonging to the pitch picker.
   * @private
   */
  dropdownDispose_() {
    if (this.clickWrapper_) {
      Blockly.browserEvents.unbind(this.clickWrapper_);
      this.clickWrapper_ = null;
    }
    if (this.moveWrapper_) {
      Blockly.browserEvents.unbind(this.moveWrapper_);
      this.moveWrapper_ = null;
    }
    this.imageElement_ = null;
  }

  /**
   * Hide the editor and picker.
   * @private
   */
  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  /**
   * Set the note to match the mouse's position.
   * @param {!Event} e Mouse move event.
   */
  onMouseMove(e) {
    const bBox = this.imageElement_.getBoundingClientRect();
    const dy = e.clientY - bBox.top;
    const note = Blockly.utils.math.clamp(Math.round(13.5 - dy / 7.5), 0, 12);
    this.imageElement_.style.backgroundPosition = -note * 37 + 'px 0';
    this.setEditorValue_(note);
  }

  /**
   * Convert the machine-readable value (0-12) to human-readable text (C3-A4).
   * @param {number|string} value The provided value.
   * @returns {string|undefined} The respective pitch, or undefined if invalid.
   */
  valueToNote(value) {
    return FieldSounds.NOTES[Number(value)];
  }

  /**
   * Convert the human-readable text (C3-A4) to machine-readable value (0-12).
   * @param {string} text The provided pitch.
   * @returns {number|undefined} The respective value, or undefined if invalid.
   */
  noteToValue(text) {
    const normalizedText = text.trim().toUpperCase();
    const i = FieldSounds.NOTES.indexOf(normalizedText);
    return i > -1 ? i : undefined;
  }

  /**
   * Get the text to be displayed on the field node.
   * @returns {?string} The HTML value if we're editing, otherwise null.
   * Null means the super class will handle it, likely a string cast of value.
   * @protected
   */
  getText_() {
    if (this.isBeingEdited_) {
      return super.getText_();
    }
    return this.valueToNote(this.getValue()) || null;
  }

  /**
   * Transform the provided value into a text to show in the HTML input.
   * @param {*} value The value stored in this field.
   * @returns {string} The text to show on the HTML input.
   */
  getEditorText_(value) {
    return this.valueToNote(value);
  }

  /**
   * Transform the text received from the HTML input (note) into a value
   * to store in this field.
   * @param {string} text Text received from the HTML input.
   * @returns {*} The value to store.
   */
  getValueFromEditorText_(text) {
    return this.noteToValue(text);
  }

  /**
   * Updates the graph when the field rerenders.
   * @private
   * @override
   */
  render_() {
    super.render_();
    this.updateGraph_();
  }

  /**
   * Redraw the pitch picker with the current pitch.
   * @private
   */
  updateGraph_() {
    if (!this.imageElement_) {
      return;
    }
    const i = this.getValue();
    this.imageElement_.style.backgroundPosition = -i * 37 + 'px 0';
  }

  /**
   * Ensure that only a valid value may be entered.
   * @param {*} opt_newValue The input value.
   * @returns {*} A valid value, or null if invalid.
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    const note = this.valueToNote(opt_newValue);
    if (note) {
      return opt_newValue;
    }
    return null;
  }
}

CustomFields.FieldSounds = FieldSounds;

export default FieldSounds;
