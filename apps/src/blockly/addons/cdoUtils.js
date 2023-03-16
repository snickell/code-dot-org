import {ToolboxType, CLAMPED_NUMBER_REGEX} from '../constants';
import cdoTheme from '../themes/cdoTheme';
import {parseElement as parseXmlElement} from '../../xml';
import experiments from '@cdo/apps/util/experiments';

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}

export function getBlockFields(block) {
  let fields = [];
  block.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      fields.push(field);
    });
  });
  return fields;
}

export function getToolboxType() {
  const workspace = Blockly.getMainWorkspace();
  if (!workspace) {
    return;
  }
  // True is passed so we only get the flyout directly owned by the workspace.
  // Otherwise getFlyout will return the flyout for the toolbox if it has categories.
  if (workspace.getFlyout(true)) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.getToolbox()) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth() {
  const workspace = Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  switch (getToolboxType()) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      return 0;
  }
}

export function workspaceSvgResize(workspace) {
  return Blockly.svgResize(workspace);
}

export function bindBrowserEvent(element, name, thisObject, func, useCapture) {
  return Blockly.browserEvents.bind(
    element,
    name,
    thisObject,
    func,
    useCapture
  );
}

export function isWorkspaceReadOnly(workspace) {
  return false; // TODO - used for feedback
}

export function blockLimitExceeded() {
  return false;
}

export function getBlockLimit(blockType) {
  return 0;
}

/**
 * Returns a new Field object,
 * conditional on the type of block we're trying to create.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
export function getField(type) {
  let field;
  if (type === Blockly.BlockValueType.NUMBER) {
    field = new Blockly.FieldNumber();
  } else if (type.includes('ClampedNumber')) {
    const clampedNumberMatch = type.match(CLAMPED_NUMBER_REGEX);
    if (clampedNumberMatch) {
      const min = parseFloat(clampedNumberMatch[1]);
      const max = parseFloat(clampedNumberMatch[2]);
      field = new Blockly.FieldNumber(0, min, max);
    }
  } else {
    field = new Blockly.FieldTextInput();
  }
  return field;
}

/**
 * Returns a theme object, based on the presence of an option in the browser's localStorage.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
// Users can change their active theme using the context menu. Use this setting, if present.
export function getUserTheme(themeOption) {
  return Blockly.themes[localStorage.blocklyTheme] || themeOption || cdoTheme;
}

export function getCode(workspace) {
  if (experiments.isEnabled(experiments.BLOCKLY_JSON)) {
    const blocksJson = Blockly.serialization.workspaces.save(workspace);
    console.log('blocks saved as JSON:', blocksJson);
    return JSON.stringify(blocksJson);
  } else {
    return Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(workspace));
  }
}

export function arrangeBlocksJson(startBlocksJson, arrangement) {
  var code = JSON.parse(startBlocksJson);
  var block;
  for (var i = 0; i < code.blocks.blocks.length; i++) {
    block = code.blocks.blocks[i];
    if (arrangement[block.type]) {
      if (arrangement[block.type].x && block.x) {
        block.x = arrangement[block.type].x;
      }
      if (arrangement[block.type].y && block.y) {
        block.y = arrangement[block.type].y;
      }
    }
  }
  return JSON.stringify(code);
}

export function arrangeBlocksXml(startBlocksXml, arrangement) {
  var type, xmlChild;

  var xml = parseXmlElement(startBlocksXml);

  var xmlChildNodes = xml.childNodes || [];
  arrangement = arrangement || {};

  for (var j = 0; j < xmlChildNodes.length; j++) {
    xmlChild = xmlChildNodes[j];

    // Only look at element nodes
    if (xmlChild.nodeType === 1) {
      // look to see if we have a predefined arrangement for this type
      type = xmlChild.getAttribute('type');
      if (arrangement[type]) {
        if (arrangement[type].x && !xmlChild.hasAttribute('x')) {
          xmlChild.setAttribute('x', arrangement[type].x);
        }
        if (arrangement[type].y && !xmlChild.hasAttribute('y')) {
          xmlChild.setAttribute('y', arrangement[type].y);
        }
      }
    }
  }
  return Blockly.Xml.domToText(xml);
}
