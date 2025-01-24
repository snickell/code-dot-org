import {useState, useEffect, HTMLAttributes} from 'react';
import classNames from 'classnames';

import moduleStyles from './video.module.scss';
import LinkButton from '../button/LinkButton';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import {BodyTwoText, BodyThreeText, Figcaption} from '@/typography';

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
 * Design System: Video Component. This component is used to display a video from YouTube with a fallback HTML video player, and the option to download it, if an externally hosted fallback is provided. The video can also be displayed with a caption and works with responsive screen sizes.
 */

export const Video: React.FC<VideoProps> = ({
  youTubeId,
  videoTitle,
  videoFallback,
  showCaption,
  className,
}: VideoProps) => {
  const [isYouTubeBlocked, setIsYouTubeBlocked] = useState(false);
  const posterThumbnail = `//i.ytimg.com/vi/${youTubeId}/mqdefault.jpg`;

  // Check to see if YouTube is blocked.
  // If it is, we'll use the fallback video player.
  useEffect(() => {
    const checkIfYouTubeIsBlocked = (url: string): Promise<boolean> => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(false);
        img.onerror = () => resolve(true);
        img.src = `${url}?_=${Math.random()}`;
      });
    };

    const checkYouTubeUrls = async () => {
      const isYouTubeBlocked = await checkIfYouTubeIsBlocked(
        'https://www.youtube.com/favicon.ico',
      );
      const isYouTubeNoCookieBlocked = await checkIfYouTubeIsBlocked(
        'https://www.youtube-nocookie.com/favicon.ico',
      );

      setIsYouTubeBlocked(isYouTubeBlocked || isYouTubeNoCookieBlocked);
    };

    checkYouTubeUrls();
  }, []);

  return (
    <figure className={moduleStyles.video}>
      <div className={moduleStyles.videoWrapper}>
        {isYouTubeBlocked ? (
          videoFallback ? (
            // Disabling this eslint rule since we don't support captions on all of our videos.
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              className={classNames(className)}
              controls
              poster={posterThumbnail}
            >
              <source src={videoFallback} type="video/mp4" />
            </video>
          ) : (
            <div className={classNames(moduleStyles.blockedPlaceholder)}>
              <div className={classNames(moduleStyles.wrapper)}>
                <FontAwesomeV6Icon
                  iconName="exclamation-circle"
                  iconStyle="solid"
                />
                <BodyTwoText visualAppearance="strong">
                  Video unavailable
                </BodyTwoText>
                <BodyThreeText>
                  This video is blocked on your network, learn more here.
                </BodyThreeText>
              </div>
            </div>
          )
        ) : (
          <iframe
            className={classNames(className)}
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
            title={videoTitle}
            allowFullScreen
          />
        )}
      </div>
      <div className={moduleStyles.footer}>
        {showCaption && (
          <Figcaption className={moduleStyles.caption}>{videoTitle}</Figcaption>
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
};
