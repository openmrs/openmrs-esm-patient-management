import React from 'react';
import classNames from 'classnames';
import { Tile } from '@carbon/react';
import { EmptyCardIllustration } from '@openmrs/esm-framework';
import styles from './empty-state.scss';

interface EmptyStateProps {
  /** Border, padding and margin, which differ by where the tile sits. */
  className?: string;
  displayText: string;
}

/**
 * The illustration-and-message tile shown when a list has nothing in it. No Layer of its own: some
 * callers already sit inside one, where a second would shift the tile a layer token darker.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ className, displayText }) => {
  return (
    <Tile className={classNames(styles.emptyState, className)}>
      <EmptyCardIllustration />
      <p className={styles.content}>{displayText}</p>
    </Tile>
  );
};

export default EmptyState;
