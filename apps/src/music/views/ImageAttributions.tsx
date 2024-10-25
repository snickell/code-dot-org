import React from 'react';

import {ImageAttributionCopyright} from '../player/MusicLibrary';

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
  return (
    <div>
      <b>Music Lab thumbnail photos</b>
      {attributions.map((attribution, index) => (
        <div key={index}>
          {attribution.artist}{' '}
          <a href={attribution.src} target="_blank" rel="noreferrer">
            photo
          </a>{' '}
          by {attribution.author} is licensed under{' '}
          <a
            href={licenseLinks[attribution.licenseVersion]?.url}
            target="_blank"
            rel="noreferrer"
          >
            {licenseLinks[attribution.licenseVersion]?.name}.
          </a>
        </div>
      ))}
    </div>
  );
};

export default ImageAttributions;
