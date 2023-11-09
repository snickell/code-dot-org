import {BlockSvg, Workspace, WorkspaceSvg} from 'blockly';
import React, {useEffect, useRef} from 'react';
import moduleStyles from './ai-block-preview.module.scss';
import {generateBlocksFromResult} from './utils';

interface AiBlockPreviewProps {
  resultJson: string;
}

/**
 * Previews the blocks generated by the AI block in Dance Party.
 */
const AiBlockPreview: React.FunctionComponent<AiBlockPreviewProps> = ({
  resultJson,
}) => {
  const blockPreviewContainerRef = useRef<HTMLSpanElement>(null);
  const refTimer = useRef<number | null>(null);
  const workspaceRef = useRef<Workspace | null>(null);

  // Create the workspace once the container has been rendered.
  useEffect(() => {
    if (!blockPreviewContainerRef.current) {
      return;
    }

    const emptyBlockXml = Blockly.utils.xml.textToDom('<xml></xml>');
    workspaceRef.current = Blockly.BlockSpace.createReadOnlyBlockSpace(
      blockPreviewContainerRef.current,
      emptyBlockXml,
      {}
    );
  }, [blockPreviewContainerRef]);

  // Build out the blocks.
  useEffect(() => {
    if (!blockPreviewContainerRef.current || !workspaceRef.current) {
      return;
    }
    const blocksSvg = generateBlocksFromResult(
      workspaceRef.current,
      resultJson
    );
    blocksSvg.forEach((blockSvg: BlockSvg) => {
      blockSvg.initSvg();
      blockSvg.render();
    });
    Blockly.svgResize(workspaceRef.current as WorkspaceSvg);

    return () => {
      workspaceRef.current?.clear();
    };
  }, [blockPreviewContainerRef, resultJson]);

  // Dispose of the workspace on unmount.
  useEffect(() => () => workspaceRef.current?.dispose(), []);

  return (
    <span ref={blockPreviewContainerRef} className={moduleStyles.container} />
  );
};

export default AiBlockPreview;
