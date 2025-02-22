import React from 'react';

import styles from './card.module.scss';

interface CardProps {
  children: React.ReactNode;
  'data-testid': string;
}

export const Card = ({children, ...props}: CardProps) => {
  return (
    // eslint-disable-next-line react/forbid-dom-props
    <div className={styles.cardContainer} data-testid={props['data-testid']}>
      {children}
    </div>
  );
};
