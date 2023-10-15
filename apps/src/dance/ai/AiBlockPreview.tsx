import {BlockSvg, Workspace, WorkspaceSvg} from 'blockly';
import React, {useEffect, useRef, useState} from 'react';
import moduleStyles from './ai-block-preview.module.scss';

interface AiBlockPreviewProps {
  fadeIn: boolean;
  generateBlocksFromResult: (workspace: Workspace) => [BlockSvg, BlockSvg];
  onComplete: () => void;
}

/**
 * Previews the blocks generated by the AI block in Dance Party.
 */
const AiBlockPreview: React.FunctionComponent<AiBlockPreviewProps> = ({
  fadeIn,
  generateBlocksFromResult,
  onComplete,
}) => {
  const blockPreviewContainerRef = useRef<HTMLSpanElement>(null);
  const refTimer = useRef<number | null>(null);

  const [done, setDone] = useState<boolean>(false);

  // Update currentTick using a timer.
  useEffect(() => {
    refTimer.current = window.setTimeout(
      () => {
        setDone(true);
        onComplete();
        if (refTimer.current) {
          clearTimeout(refTimer.current);
        }
      },
      fadeIn ? 5000 : 2500
    );

    return () => {
      if (refTimer.current) {
        clearTimeout(refTimer.current);
      }
    };
  }, [onComplete, fadeIn]);

  // Build out the blocks.
  useEffect(() => {
    if (!done) {
      const emptyBlockXml = Blockly.utils.xml.textToDom('<xml></xml>');
      const previewWorkspace: Workspace =
        Blockly.BlockSpace.createReadOnlyBlockSpace(
          blockPreviewContainerRef.current,
          emptyBlockXml,
          {}
        );

      const blocksSvg = generateBlocksFromResult(previewWorkspace);
      blocksSvg.forEach((blockSvg: BlockSvg) => {
        blockSvg.initSvg();
        blockSvg.render();
      });
      Blockly.svgResize(previewWorkspace as WorkspaceSvg);
    }
  }, [blockPreviewContainerRef, generateBlocksFromResult, done]);

  return (
    <div id={fadeIn ? 'fade-in' : undefined}>
      <span ref={blockPreviewContainerRef} className={moduleStyles.container} />
    </div>
  );
};

export default AiBlockPreview;
