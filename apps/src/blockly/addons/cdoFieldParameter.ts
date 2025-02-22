import {
  ObservableParameterModel,
  ObservableProcedureModel,
} from '@blockly/block-shareable-procedures';
import * as GoogleBlockly from 'blockly/core';

import {commonI18n} from '@cdo/apps/types/locale';

import {BLOCK_TYPES} from '../constants';
import {ExtendedWorkspaceSvg, ProcedureBlock} from '../types';

const RENAME_PARAMETER_ID = 'RENAME_VARIABLE_ID';
const DELETE_PARAMETER_ID = 'DELETE_VARIABLE_ID';

interface ParameterPromptOptions {
  promptText: string; // Description text for window prompt
  confirmButtonLabel: string; // Label of confirm button, e.g., "Rename"
  callback: (newName: string) => void; // Callback with text of new parameter name
  isDeleteDialog: boolean; // True for delete dialog; False for rename dialog
  defaultText?: string; // Default input text for window prompt
}
export default class CdoFieldParameter extends GoogleBlockly.FieldVariable {
  /**
   * Handle the selection of an item in the parameter dropdown menu.
   * Special case the 'Rename' and 'Delete' options to prompt the user.
   * @param {!Blockly.Menu} menu The Menu component clicked.
   * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
   * @protected
   */
  onItemSelected_(menu: GoogleBlockly.Menu, menuItem: GoogleBlockly.MenuItem) {
    const oldVar = this.getText();
    const id = menuItem.getValue();
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      switch (id) {
        case RENAME_PARAMETER_ID:
          // Rename all instances of this variable.
          CdoFieldParameter.parameterPrompt({
            promptText: commonI18n.renameParameterPromptTitle({
              parameterName: oldVar,
            }),
            confirmButtonLabel: commonI18n.rename(),
            callback: this.renameSelectedParameter.bind(this),
            isDeleteDialog: false,
            defaultText: oldVar,
          });
          break;
        case DELETE_PARAMETER_ID:
          // Delete this parameter and any of its parameter blocks.
          CdoFieldParameter.parameterPrompt({
            promptText: commonI18n.deleteParameterTitle({
              parameterName: oldVar,
            }),
            confirmButtonLabel: commonI18n.delete(),
            callback: this.deleteSelectedParameter.bind(this),
            isDeleteDialog: true,
          });
          break;
        default:
          // If we have somehow have another option (we shouldn't), and
          // it gets selected, use the default dropdown action.
          this.setValue(id);
          break;
      }
    }
  }

  /**
   * Find the selected parameter, remove it from the procedure model,
   * then dispose of any parameter blocks that had it selected.
   * @protected
   */
  deleteSelectedParameter() {
    const {definitionBlock, workspace} = this.findDefinitionBlockAndWorkspace();

    const procedureModel = (
      definitionBlock as ProcedureBlock
    ).getProcedureModel();
    const parameters = procedureModel.getParameters();

    // Find the parameter variable
    const variableName = this.getText();
    const variable = workspace.getVariable(variableName);

    if (variable) {
      // Find the index of the procedure parameter to delete
      const paramIndexToDelete = parameters.findIndex(
        parameter => parameter.getName() === variable.name
      );

      // Delete the parameter from the procedure model
      if (paramIndexToDelete !== -1) {
        procedureModel.deleteParameter(paramIndexToDelete);
      }

      const parameterBlocks = workspace
        .getAllBlocks()
        .filter(
          (block: GoogleBlockly.Block) => block.type === 'parameters_get'
        );
      parameterBlocks.forEach((paramBlock: GoogleBlockly.Block) => {
        const varField = paramBlock?.getField(
          'VAR'
        ) as GoogleBlockly.FieldVariable | null;
        if (varField && varField.getVariable()?.name === variable.name) {
          paramBlock.dispose(true);
        }
      });
    } else {
      console.error(`Variable with name ${variableName} not found`);
    }
  }

  /**
   * Find the selected variable and rename it, then rename the parameter.
   * @param {string} newName The new name for the parameter.
   * @protected
   */
  renameSelectedParameter(newName: string) {
    const {definitionBlock, workspace} = this.findDefinitionBlockAndWorkspace();

    const variableName = this.getText();
    const variable = workspace.getVariable(variableName);
    if (variable) {
      workspace.renameVariableById(variable.getId(), newName);

      const procedureModel = (
        definitionBlock as ProcedureBlock
      ).getProcedureModel();
      const parameters = procedureModel.getParameters();

      // Find the parameter to rename
      const paramToRename = parameters.find(
        parameter => parameter.getName() === variableName
      );

      // Rename the parameter in the procedure model
      if (paramToRename) {
        paramToRename.setName(newName);
      }
      // In case the block is disconnected from the definition, manually
      // reset its field value.
      this.getSourceBlock()?.setFieldValue(variable.getId(), 'VAR');
    }
  }
  /**
   * For a given parameter block, find the definition block and its workspace.
   * If the block is part of the function definition, we want the root (top-most) block.
   * If this block is in a mini-toolbox, we want the flyout's parent block.
   * If neither of these are true (e.g. the block is disconnected on the workspace),
   * we will attempt to find the first definition block on the same workspace that
   * includes the parameter.
   * @returns An object containing:
   *   - `definitionBlock`: The definition block associated with the parameter
   *   - `workspace`: The workspace that the parameter block belongs to.
   */
  protected findDefinitionBlockAndWorkspace(): {
    definitionBlock: GoogleBlockly.Block | null;
    workspace: GoogleBlockly.WorkspaceSvg;
  } {
    const parameterBlock = this.getSourceBlock() as GoogleBlockly.Block;
    let definitionBlock: GoogleBlockly.Block | null;
    let workspace = parameterBlock.workspace as GoogleBlockly.WorkspaceSvg;

    if (parameterBlock.isInFlyout) {
      definitionBlock = (workspace as ExtendedWorkspaceSvg).flyoutParentBlock;
      workspace = (workspace as GoogleBlockly.WorkspaceSvg)
        .targetWorkspace as GoogleBlockly.WorkspaceSvg;
    } else {
      definitionBlock = parameterBlock.getRootBlock();
    }

    // Check if the root block is a definition block
    if (
      definitionBlock &&
      definitionBlock.type !== BLOCK_TYPES.procedureDefinition
    ) {
      definitionBlock = null;
    }

    if (!definitionBlock) {
      const variableName = this.getText();
      const variable = workspace.getVariable(variableName);

      if (variable) {
        // Find the first block in the workspace that matches the expected type
        definitionBlock =
          workspace.getAllBlocks().find(block => {
            if (block.type === BLOCK_TYPES.procedureDefinition) {
              const procedureModel = (
                block as ProcedureBlock
              ).getProcedureModel();
              return procedureModel
                .getParameters()
                .some(parameter => parameter.getName() === variableName);
            }
            return false;
          }) || null;
      }
    }
    return {definitionBlock, workspace};
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
    if (!this.getSourceBlock()?.isEditable()) {
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

  menuGenerator_ = function (
    this: GoogleBlockly.FieldDropdown
  ): GoogleBlockly.MenuOption[] {
    // Parameter field dropdowns only have options to rename or delete.
    return [
      [commonI18n.renameParameter(), RENAME_PARAMETER_ID],
      [commonI18n.deleteParameter(), DELETE_PARAMETER_ID],
    ];
  };

  /**
   * Prompt the user to name or delete a parameter.
   * @param {ParameterPromptOptions} options The options object.
   */
  static parameterPrompt = function (options: ParameterPromptOptions) {
    Blockly.customSimpleDialog({
      bodyText: options.promptText,
      prompt: !options.isDeleteDialog,
      promptPrefill: options.defaultText,
      cancelText: options.confirmButtonLabel,
      isDangerCancel: !!options.isDeleteDialog,
      confirmText: commonI18n.cancel(),
      onConfirm: null,
      onCancel: options.callback,
      disableSpaceClose: !options.isDeleteDialog,
    });
  };
}

export const getAddParameterButtonWithCallback = (
  workspace: GoogleBlockly.WorkspaceSvg,
  procedure: ObservableProcedureModel
) => {
  const addParameterCallbackKey = 'addParameterCallback';
  workspace.registerButtonCallback(addParameterCallbackKey, () => {
    workspace.hideChaff();
    CdoFieldParameter.parameterPrompt({
      promptText: commonI18n.newParameterTitle(),
      confirmButtonLabel: commonI18n.create(),
      callback: parameterName => {
        const newParameter = new ObservableParameterModel(
          workspace,
          parameterName
        );
        const newIndex = procedure.getParameters().length;
        procedure.insertParameter(newParameter, newIndex);
      },
      isDeleteDialog: false,
    });
  });

  return {
    kind: 'button',
    text: '+',
    callbackKey: addParameterCallbackKey,
  };
};
