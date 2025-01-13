import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import moduleStyles from './divider.module.scss';

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  /** Divider Color*/
  color?: 'primary' | 'strong';
  /** Margin */
  margin?: 'none' | 'small' | 'medium' | 'large' | 'extra-large';
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/Divider.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for Dev```
 *
 * Design System: Divider Component.
 * Used to render a section divider line. Can be used to break up the page or section content.
 */

export const Divider: React.FC<DividerProps> = ({
  color = 'primary',
  margin = 'none',
}: DividerProps) => (
  <hr
    className={classNames(
      moduleStyles.divider,
      moduleStyles[`divider-color-${color}`],
      moduleStyles[`divider-margin-${margin}`],
    )}
  />
);
