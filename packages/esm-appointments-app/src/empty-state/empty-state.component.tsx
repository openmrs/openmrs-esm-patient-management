import React from 'react';
import { Layer, Tile } from '@carbon/react';
import styles from './empty-state.scss';
import EmptyDataIllustration from './empty-icon.component';
import { useLayoutType } from '@openmrs/esm-framework';

interface EmptyStateProps {
  headerTitle: string;
  displayMessage: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ headerTitle, displayMessage }) => {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{headerTitle}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>{displayMessage}</p>
      </Tile>
    </Layer>
  );
};

export default EmptyState;
