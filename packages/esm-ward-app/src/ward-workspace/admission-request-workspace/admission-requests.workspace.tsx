import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification } from '@carbon/react';
import { useAppContext, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type WardViewContext } from '../../types';
import AdmissionRequestsEmptyState from './admission-requests-empty-state.component';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import styles from './admission-requests-workspace.scss';
import { Add } from '@carbon/react/icons';

export interface AdmissionRequestsWorkspaceProps {
  wardPendingPatients: ReactNode;
}

const AdmissionRequestsWorkspace: React.FC<Workspace2DefinitionProps<AdmissionRequestsWorkspaceProps>> = ({
  workspaceProps: { wardPendingPatients },
  launchChildWorkspace,
}) => {
  const { t } = useTranslation();
  const { errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { inpatientRequests, isLoading } = wardPatientGroupDetails?.inpatientRequestResponse ?? {};

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
    <Workspace2 title={t('admissionRequests', 'Admission requests')}>
      <div className={styles.admissionRequestsWorkspaceContainer}>
        {errorFetchingEmrConfiguration && (
          <div className={styles.formError}>
            <InlineNotification
              kind="error"
              title={t('somePartsOfTheFormDidntLoad', "Some parts of the form didn't load")}
              subtitle={t(
                'fetchingEmrConfigurationFailed',
                'Fetching EMR configuration failed. Try refreshing the page or contact your system administrator.',
              )}
              lowContrast
              hideCloseButton
            />
          </div>
        )}
        {!isLoading &&
          (inpatientRequests?.length === 0 ? (
            <AdmissionRequestsEmptyState />
          ) : (
            <div className={styles.addPatientToWardButtonContainer}>
              <Button renderIcon={Add} kind="ghost" onClick={handleAddPatient}>
                {t('addPatientToWard', 'Add patient to ward')}
              </Button>
            </div>
          ))}
        <div className={styles.content}>{wardPendingPatients}</div>
      </div>
    </Workspace2>
  );
};

export default AdmissionRequestsWorkspace;
