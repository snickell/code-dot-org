import React from 'react';

import MazeVisualization from '@cdo/apps/maze/Visualization';

import moduleStyles from './neighborhood.module.scss';

interface NeighborhoodVisualizationProps {
  className?: string;
  isDarkMode: boolean;
  useProtectedDiv?: boolean;
}
const ICON_PATH = '/blockly/media/turtle/';

const NeighborhoodVisualization: React.FunctionComponent<
  NeighborhoodVisualizationProps
> = ({className, isDarkMode, useProtectedDiv = true}) => {
  const fullIconPath = isDarkMode
    ? ICON_PATH + 'icons_white.png'
    : ICON_PATH + 'icons.png';

  return (
    <div className={className}>
      <div
        className={moduleStyles.neighborhoodPreviewBackground}
        style={styles.neighborhoodBackground}
      >
        <MazeVisualization useProtectedDiv={useProtectedDiv} />
      </div>
      <svg
        id="slider"
        version="1.1"
        width="150"
        height="50"
        className={moduleStyles.slider}
      >
        {/* Slow icon. */}
        <clipPath id="slowClipPath">
          <rect width="26" height="12" x="5" y="14" />
        </clipPath>
        <image
          xlinkHref={fullIconPath}
          height="42"
          width="84"
          x="-21"
          y="-10"
          clipPath="url(#slowClipPath)"
        />
        {/* Fast icon. */}
        <clipPath id="fastClipPath">
          <rect width="26" height="16" x="120" y="10" />
        </clipPath>
        <image
          xlinkHref={fullIconPath}
          height="42"
          width="84"
          x="120"
          y="-11"
          clipPath="url(#fastClipPath)"
        />
      </svg>
    </div>
  );
};

const styles = {
  neighborhoodBackground: {
    // CSS Modules don't support loading webpack assets, so we have to use inline styles.
    backgroundImage: 'url("/blockly/media/javalab/Neighborhood.png")',
  },
};

export default NeighborhoodVisualization;
