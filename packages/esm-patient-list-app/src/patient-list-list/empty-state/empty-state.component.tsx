import React from 'react';
import { Layer, Button, Tile } from '@carbon/react';
import { Trans, useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import styles from './empty-state.scss';
import { Add } from '@carbon/react/icons';

export interface EmptyStateProps {
  listType: string;
  launchForm?(): void;
}

export const PatientListEmptyState: React.FC<EmptyStateProps> = ({ listType, launchForm }) => {
  const { t } = useTranslation();

  return (
    <Layer>
      <Tile className={styles.tile}>
        <EmptyDataIllustration />
        <p className={styles.content}>
          <Trans i18nKey="emptyStateText" values={{ listType: listType.toLowerCase() }}>
            There are no {listType.toLowerCase()} patient lists to display
          </Trans>
        </p>
        <p className={styles.action}>
          {launchForm && (
            <span>
              <Button renderIcon={Add} kind="ghost" onClick={() => launchForm()}>
                {t('createPatientList', 'Create patient list')}
              </Button>
            </span>
          )}
        </p>
      </Tile>
    </Layer>
  );
};
