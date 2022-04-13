import React from 'react';
import styles from './empty-state.scss';
import { Tile } from 'carbon-components-react';
import { Trans, useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useLayoutType } from '@openmrs/esm-framework';

export interface EmptyStateProps {
  headerTitle: string;
  displayText: string;
}

export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Tile light className={styles.tile}>
      <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
        <h4>{props.headerTitle}</h4>
      </div>
      <EmptyDataIllustration />
      <p className={styles.content}>There are no {props.displayText.toLowerCase()} to display for this patient</p>
      {/* <Trans i18nKey="emptyStateText" values={{ displayText: props.displayText.toLowerCase() }}>
        There are no {props.displayText.toLowerCase()} to display for this patient
      </Trans> */}
    </Tile>
  );
};
