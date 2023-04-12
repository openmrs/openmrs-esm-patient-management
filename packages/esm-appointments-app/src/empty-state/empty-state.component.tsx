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
  scheduleType: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ headerTitle, displayText, launchForm, scheduleType }) => {
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
          <Trans i18nKey="emptyStateText" values={{ displayText: displayText }}>
            There are no {displayText} to display
          </Trans>
        </p>
        {scheduleType === 'Scheduled' || scheduleType === 'CameEarly' ? (
          <p className={styles.action}>
            {launchForm && (
              <span>
                <Button renderIcon={Add} kind="ghost" onClick={() => launchForm()}>
                  {t('createAppointment', 'Create appointment')}
                </Button>
              </span>
            )}
          </p>
        ) : null}
      </Tile>
    </Layer>
  );
};
