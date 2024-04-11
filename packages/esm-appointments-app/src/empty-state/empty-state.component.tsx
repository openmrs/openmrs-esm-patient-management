import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { Trans } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-state.scss';

export interface EmptyStateProps {
  displayText: string;
  headerTitle: string;
  launchForm?(): void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ headerTitle, displayText, launchForm }) => {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{headerTitle}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>
          <Trans i18nKey="emptyStateText" displayText={displayText}>
            There are no <span className={styles.displayText}>{{ displayText } as any}</span> to display
          </Trans>
        </p>
      </Tile>
    </Layer>
  );
};
