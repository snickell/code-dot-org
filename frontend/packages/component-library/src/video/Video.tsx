import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import moduleStyles from './video.module.scss';
import LinkButton from '../button/LinkButton';

export interface VideoProps extends HTMLAttributes<HTMLElement> {
  /** Video Title */
  videoTitle?: string;
  /** Video YouTube ID */
  youTubeId?: string;
  /** Video fallback */
  videoFallback?: string;
  /** Show caption */
  showCaption?: boolean;
  /** Video custom className */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✘) implementation of component approved by design team;
 * * (✘) has storybook, covered with stories and documentation;
 * * (✘) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Video.test.tsx)
 * * (✘) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Video Component. This component is used to display a video from YouTube with the option to download it if an externally hosted fallback is provided. The video can also be displayed with a caption and works with responsive screen sizes.
 */

export const Video: React.FC<VideoProps> = ({
  youTubeId,
  videoTitle,
  videoFallback,
  showCaption,
  className,
}: VideoProps) => (
  <figure className={moduleStyles.video}>
    <div className={moduleStyles.videoWrapper}>
      <iframe
        className={classNames(className)}
        src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
        title={videoTitle}
        allowFullScreen
      />
    </div>
    <div className={moduleStyles.footer}>
      {showCaption && (
        <figcaption className={moduleStyles.caption}>{videoTitle}</figcaption>
      )}
      {videoFallback && (
        <LinkButton
          className={moduleStyles.download}
          color="gray"
          href={videoFallback}
          iconLeft={{
            iconName: 'download',
            iconStyle: 'solid',
          }}
          size="xs"
          text="Download"
          type="secondary"
        />
      )}
    </div>
  </figure>
);
