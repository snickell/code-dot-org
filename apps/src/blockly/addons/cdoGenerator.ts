import * as GoogleBlockly from 'blockly/core';

import {
  BlocklyWrapperType,
  ExtendedBlock,
  ExtendedCodeGenerator,
  ExtendedJavascriptGenerator,
  ExtendedWorkspaceSvg,
} from '@cdo/apps/blockly/types';

export default function initializeGenerator(
  blocklyWrapper: BlocklyWrapperType
) {
  (
    blocklyWrapper.getGenerator() as ExtendedJavascriptGenerator
  ).translateVarName = function (name: string) {
    let varName = (Blockly.JavaScript.nameDB_ as GoogleBlockly.Names).getName(
      name,
      Blockly.VARIABLE_CATEGORY_NAME
    );
    // Play Lab (aka Studio) variables are contained within the Globals namespace.
    if (Blockly.varsInGlobals) varName = 'Globals.' + varName;
    return varName;
  };

  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.xmlToBlocks = function (
    _name: string,
    xml: Element
  ) {
    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToBlockSpace(workspace, xml);
    return workspace.getTopBlocks(true);
  };

  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.blockSpaceToCode = function (
    name: string,
    opt_typeFilter?: string | string[]
  ) {
    let blocksToGenerate = blocklyWrapper.mainBlockSpace.getTopBlocks(
      true /* ordered */
    );
    if (blocklyWrapper.getHiddenDefinitionWorkspace()) {
      blocksToGenerate.push(
        ...(
          blocklyWrapper.getHiddenDefinitionWorkspace() as ExtendedWorkspaceSvg
        ).getTopBlocks(true)
      );
    }
    if (opt_typeFilter) {
      if (typeof opt_typeFilter === 'string') {
        opt_typeFilter = [opt_typeFilter];
      }
      blocksToGenerate = blocksToGenerate.filter(block =>
        (opt_typeFilter as string[]).includes(block.type)
      );
    }
    return blocklyWrapper.Generator.blocksToCode(name, blocksToGenerate);
  };

  // Used to generate code for an array of top blocks.
  blocklyWrapper.Generator.blocksToCode = function (
    name: string,
    blocksToGenerate: GoogleBlockly.Block[]
  ) {
    if (name !== 'JavaScript') {
      console.warn(
        `Can only generate code in JavaScript. ${name} is unsupported.`
      );
    }
    const generator =
      blocklyWrapper.getGenerator() as ExtendedJavascriptGenerator;
    if (blocklyWrapper.getMainWorkspace()) {
      generator.init(blocklyWrapper.getMainWorkspace());
    }
    generator.variableDB_ = generator.nameDB_;
    const code: (string | [string, number])[] = [];
    blocksToGenerate.forEach(block => {
      code.push(blocklyWrapper.JavaScript.blockToCode(block));
    });
    let result = code.join('\n');
    result = generator.finish(result);
    return result;
  };

  const originalBlockToCode = blocklyWrapper.Generator.prototype.blockToCode;
  blocklyWrapper.Generator.prototype.blockToCode = function (
    this: ExtendedCodeGenerator,
    block: GoogleBlockly.Block | null,
    opt_thisOnly?: boolean
  ) {
    if (!this.variableDB_) {
      this.variableDB_ = this.nameDB_;
    }
    // Skip disabled block check for non-rendered workspaces. Non-rendered workspaces
    // do not have an unused concept.
    if (block?.workspace?.rendered && !block?.isEnabled()) {
      return '';
    }
    return originalBlockToCode.call(
      this,
      block,
      (block as ExtendedBlock)?.skipNextBlockGeneration || opt_thisOnly
    );
  };

  blocklyWrapper.Generator.prefixLines = function (
    text: string,
    prefix: string
  ) {
    return blocklyWrapper.JavaScript.prefixLines(text, prefix);
  };

  blocklyWrapper.Generator.xmlToCode = function (
    name: string,
    domBlocks: Element
  ) {
    const blocksToGenerate = blocklyWrapper.Generator.xmlToBlocks(
      name,
      domBlocks
    );
    return blocklyWrapper.Generator.blocksToCode(name, blocksToGenerate);
  };
}
