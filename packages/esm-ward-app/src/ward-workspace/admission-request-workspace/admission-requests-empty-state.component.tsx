import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import styles from './admission-requests-empty-state.scss';

const AdmissionRequestsEmptyState: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useLayoutType() !== 'tablet';

  const handleAddPatient = () => {
    launchWorkspace('patient-search-workspace', {
      workspaceTitle: t('addPatientToWard', 'Add patient to ward'),
    });
  };

  return (
    <Layer>
      <Tile className={classNames(styles.emptyStateTile, { [styles.desktopTile]: isDesktop })}>
        <div className={styles.illustration}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>{t('noPendingAdmissionRequests', 'No pending admission requests')}</p>
        <p className={styles.helperText}>
          {t(
            'admissionRequestsEmptyHelperText',
            'Admission requests from other departments will appear here when patients are referred to this ward. You can also directly admit patients using the button below.',
          )}
        </p>
        <div className={styles.action}>
          <Button renderIcon={Add} kind="ghost" onClick={handleAddPatient}>
            {t('addPatientToWard', 'Add patient to ward')}
          </Button>
        </div>
      </Tile>
    </Layer>
  );
};

export default AdmissionRequestsEmptyState;
