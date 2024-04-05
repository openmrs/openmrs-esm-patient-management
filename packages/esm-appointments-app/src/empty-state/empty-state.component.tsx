import React from 'react';
import { Layer, Button, Tile } from '@carbon/react';
import { Trans, useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-state.scss';
import { Add } from '@carbon/react/icons';

export interface EmptyStateProps {
  displayText: string;
  headerTitle: string;
  launchForm?(): void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ headerTitle, displayText, launchForm }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{headerTitle}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>
          {t('emptyStateText', 'There are no {{displayText}} to display', { displayText })}
        </p>
      </Tile>
    </Layer>
  );
};
