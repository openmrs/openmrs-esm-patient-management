import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { type CreateAdmissionEncounterWorkspaceProps } from '../create-admission-encounter/create-admission-encounter.workspace';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import styles from './admission-requests-empty-state.scss';

const AdmissionRequestsEmptyState: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useLayoutType() !== 'tablet';

  // TODO: this is an attempt to save the previous search term for the
  // "Back to patient search" button, but it doesn't work. See:
  // https://openmrs.atlassian.net/browse/O3-4300
  const [searchTerm, setSearchTerm] = useState<string>('');

  const launchSearchWorkspace = () => {
    // See PatientSearchWorkspaceProps in patient-search-app
    const workspaceProps = {
      initialQuery: searchTerm,
      nonNavigationSelectPatientAction: async (patientUuid: string) => {
        launchWorkspace<CreateAdmissionEncounterWorkspaceProps>('create-admission-encounter-workspace', {
          patientUuid,
          handleReturnToSearchList: launchSearchWorkspace,
        });
      },
      handleSearchTermUpdated: (value: string) => {
        setSearchTerm(value);
      },
    };

    launchWorkspace('patient-search-workspace', {
      ...workspaceProps,
      workspaceTitle: t('addPatientToWard', 'Add patient to ward'),
    });
  };

  const handleAddPatient = () => {
    launchSearchWorkspace();
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
