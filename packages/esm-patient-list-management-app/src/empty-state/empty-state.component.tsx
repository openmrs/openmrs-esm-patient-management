import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Button, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import styles from './empty-state.scss';

export interface EmptyStateProps {
  listType: string;
  launchForm?(): void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ listType, launchForm }) => {
  const { t } = useTranslation();

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={styles.illo}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>
          {t('emptyStateText', 'There are no {{listType}} patient lists to display', {
            listType: listType.toLowerCase(),
          })}
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

export default EmptyState;
