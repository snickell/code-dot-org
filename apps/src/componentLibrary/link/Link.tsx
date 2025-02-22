import classNames from 'classnames';
import React, {HTMLAttributes} from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import moduleStyles from './link.module.scss';

export interface LinkBaseProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Link id */
  id?: string;
  /** Custom class name */
  className?: string;
  /** Does the link go to an external source? */
  external?: boolean;
  /** Should the link open in a new tab? */
  openInNewTab?: boolean;
  /** Link destination */
  href?: string;
  /** Is the link disabled? */
  disabled?: boolean;
  /** Callback for click event */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Size of link */
  size?: ComponentSizeXSToL;
  /** Type of link */
  type?: 'primary' | 'secondary';
  /** Role of link */
  role?: string;
}

export type LinkWithChildren = LinkBaseProps & {
  /** Link content */
  children: React.ReactNode;
  text?: never;
};

export type LinkWithText = LinkBaseProps & {
  /** Link text content */
  text: string;
  children?: never;
};

export type LinkProps = LinkWithChildren | LinkWithText;

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/LinkTest.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Link Component.
 * Used for internal or external links. Shortcut for general <a> HTML tag (with DSCO styles applied).
 * Can be opened in new tab, have custom onClick, also can be disabled.
 */
const Link: React.FunctionComponent<LinkProps> = ({
  children,
  text,
  id,
  className,
  external,
  openInNewTab,
  href = '#',
  disabled,
  onClick,
  size = 'm',
  type = 'primary',
  role,
  ...HTMLAttributes
}) => (
  <a
    className={classNames(
      moduleStyles.link,
      moduleStyles[`link-${type}`],
      moduleStyles[`link-${size}`],
      className
    )}
    href={!disabled ? href : undefined}
    id={id}
    onClick={!disabled ? onClick : undefined}
    rel={openInNewTab || external ? 'noopener noreferrer' : undefined}
    target={(openInNewTab || undefined) && '_blank'}
    role={role}
    {...(disabled ? {'aria-disabled': true} : {})}
    {...HTMLAttributes}
  >
    {text || children}
  </a>
);

export default Link;
