import * as GoogleBlockly from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

import {getNonFunctionVariableIds} from './cdoVariables';

const RENAME_THIS_ID = 'RENAME_THIS_ID';
const RENAME_ALL_ID = 'RENAME_ALL_ID';

interface VariableNamePromptOptions {
  promptText: string; // Description text for window prompt
  confirmButtonLabel: string; // Label of confirm button, e.g., "Rename"
  defaultText: string; // Default input text for window prompt
  callback: (newName: string) => void; // Callback with text of new variable name
}
export default class CdoFieldVariable extends GoogleBlockly.FieldVariable {
  /**
   * Handle the selection of an item in the variable dropdown menu.
   * Special case the 'Rename all' and 'Rename this' options to prompt the user
   * for a new name.
   * @param {!Blockly.Menu} menu The Menu component clicked.
   * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
   * @protected
   */
  onItemSelected_(menu: GoogleBlockly.Menu, menuItem: GoogleBlockly.MenuItem) {
    const oldVar = this.getText();
    const id = menuItem.getValue();
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      switch (id) {
        case RENAME_ALL_ID:
          // Rename all instances of this variable.
          CdoFieldVariable.variableNamePrompt({
            promptText: commonI18n.renameAllPromptTitle({variableName: oldVar}),
            confirmButtonLabel: commonI18n.rename(),
            defaultText: oldVar,
            callback: newName =>
              this.sourceBlock_?.workspace.renameVariableById(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ((this as any).variable as GoogleBlockly.VariableModel).getId(),
                newName
              ),
          });
          break;
        case RENAME_THIS_ID:
          // Rename just this variable.
          CdoFieldVariable.variableNamePrompt({
            promptText: commonI18n.renameThisPromptTitle(),
            confirmButtonLabel: commonI18n.create(),
            defaultText: '',
            callback: newName => {
              const newVar =
                this.sourceBlock_?.workspace.createVariable(newName);
              if (newVar) {
                this.setValue(newVar.getId());
              }
            },
          });
          break;
        default:
          this.setValue(id);
          break;
      }
    }
  }

  /**
   * We override createTextArrow_ to skip creating the arrow for uneditable blocks.
   *
   * Additionally, we need fix the arrow position on Safari, but only until
   * upgrading to Blockly v11. After this, we should be able to just call
   * super.createTextArrow_() after the early return.
   *  @override */
  createTextArrow_() {
    /**
     * Begin CDO customization
     */
    if (
      Blockly.disableVariableEditing ||
      !this.getSourceBlock()?.isEditable()
    ) {
      return;
    }
    /**
     * End CDO customization
     */

    const arrow = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TSPAN,
      {},
      this.textElement_
    );
    arrow.appendChild(
      document.createTextNode(
        this.getSourceBlock()?.RTL
          ? Blockly.FieldDropdown.ARROW_CHAR + ' '
          : ' ' + Blockly.FieldDropdown.ARROW_CHAR
      )
    );

    /**
     * Begin CDO customization
     */
    arrow.setAttribute('dominant-baseline', 'central');
    /**
     * End CDO customization
     */

    if (this.getSourceBlock()?.RTL) {
      this.getTextElement().insertBefore(arrow, this.textContent_);
    } else {
      this.getTextElement().appendChild(arrow);
    }
    // this.arrow is private in the parent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).arrow = arrow;
  }

  /**
   * Create a dropdown menu under the text.
   *
   * @param e Optional mouse event that triggered the field to open, or
   *     undefined if triggered programmatically.
   * @override Prevent editing if variable editing is disabled (Play Lab)
   */
  showEditor_(e?: MouseEvent) {
    if (!Blockly.disableVariableEditing) {
      super.showEditor_(e);
    }
  }

  menuGenerator_ = function (
    this: GoogleBlockly.FieldDropdown
  ): GoogleBlockly.MenuOption[] {
    const options = CdoFieldVariable.dropdownCreate.call(
      this as GoogleBlockly.FieldVariable
    );

    // Remove the last two options (Delete and Rename)
    options.pop();
    options.pop();

    const filteredOptions = options.filter(option => {
      const workspace = this.getSourceBlock()?.workspace;
      // Embedded workspaces are read-only, so we don't need to modify the dropdown options.
      if (!workspace || Blockly.embeddedWorkspaces.includes(workspace.id)) {
        return true;
      }

      const nonParamVarIds = getNonFunctionVariableIds(workspace);
      const optionValue = option[1] as string;
      return nonParamVarIds.includes(optionValue);
    });

    // Add our custom options (Rename this variable, Rename all)
    filteredOptions.push([
      commonI18n.renameAll({variableName: this.getText()}),
      RENAME_ALL_ID,
    ]);
    filteredOptions.push([commonI18n.renameThis(), RENAME_THIS_ID]);

    return filteredOptions;
  };

  /**
   * Prompt the user for a variable name and perform some whitespace cleanup
   * @param {VariableNamePromptOptions} options The options object.
   */
  static variableNamePrompt = function (options: VariableNamePromptOptions) {
    Blockly.customSimpleDialog({
      bodyText: options.promptText,
      prompt: true,
      promptPrefill: options.defaultText,
      cancelText: options.confirmButtonLabel,
      confirmText: commonI18n.cancel(),
      onConfirm: null,
      onCancel: options.callback,
      disableSpaceClose: true,
    });
  };
}
