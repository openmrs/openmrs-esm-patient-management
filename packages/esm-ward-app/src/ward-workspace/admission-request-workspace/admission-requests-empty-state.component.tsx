import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  EmptyCardIllustration,
  useLayoutType,
  useWorkspace2Context,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import styles from './admission-requests-empty-state.scss';

const AdmissionRequestsEmptyState: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useLayoutType() !== 'tablet';
  const { launchChildWorkspace } = useWorkspace2Context();

  const handleAddPatient = () => {
    launchChildWorkspace('ward-app-patient-search-workspace', {
      workspaceTitle: t('addPatientToWard', 'Add patient to ward'),
      onPatientSelected(
        patientUuid: string,
        patient: fhir.Patient,
        launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
        closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
      ) {
        launchChildWorkspace('create-admission-encounter-workspace', {
          selectedPatientUuid: patient.id,
        });
      },
    });
  };

  return (
    <Layer>
      <Tile className={classNames(styles.emptyStateTile, { [styles.desktopTile]: isDesktop })}>
        <div className={styles.illustration}>
          <EmptyCardIllustration />
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
