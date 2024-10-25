import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import musicI18n from '../locale';
import {ImageAttributionCopyright} from '../player/MusicLibrary';

import moduleStyles from './ImageAttributions.module.scss';

interface ImageAttributionsProps {
  attributions: ImageAttributionCopyright[];
}

const licenseLinks: {[version: number]: {name: string; url: string}} = {
  2: {
    name: 'CC BY 2.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
  },
  3: {
    name: 'CC BY 3.0',
    url: 'https://creativecommons.org/licenses/by/3.0/deed.en',
  },
  4: {
    name: 'CC BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
  },
};

// A small amount of attribution information that will be passed to the copyright
// dialog.
const ImageAttributions: React.FunctionComponent<ImageAttributionsProps> = ({
  attributions,
}) => {
  if (attributions.length === 0) {
    return null;
  }

  return (
    <div>
      <b>{musicI18n.imageAttributionHeading()}</b>
      {attributions.map((attribution, index) => (
        <div key={index}>
          <SafeMarkdown
            openExternalLinksInNewTab
            markdown={musicI18n.imageAttributionBody({
              artist: attribution.artist,
              srcUrl: attribution.src || '',
              author: attribution.author,
              licenseName: licenseLinks[attribution.licenseVersion]?.name,
              licenseUrl: licenseLinks[attribution.licenseVersion]?.url,
            })}
            className={moduleStyles.markdown}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageAttributions;
