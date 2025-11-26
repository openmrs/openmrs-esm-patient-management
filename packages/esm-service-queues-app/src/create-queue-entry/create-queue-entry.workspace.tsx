import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, Stack } from '@carbon/react';
import {
  ArrowLeftIcon,
  ErrorState,
  ExtensionSlot,
  getPatientName,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
  usePatient,
  useVisit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { AddPatientToQueueContextProvider } from './add-patient-to-queue-context';
import ExistingVisitFormComponent from './existing-visit-form/existing-visit-form.component';
import styles from './create-queue-entry.scss';

interface CreateQueueEntryWorkspaceProps {
  selectedPatientUuid: string;
  currentServiceQueueUuid?: string;
}

/**
 *
 * This is the component that appears when clicking on a search result in the "Add patient to queue" workspace,
 */
const CreateQueueEntryWorkspace: React.FC<
  Workspace2DefinitionProps<
    CreateQueueEntryWorkspaceProps,
    {
      startVisitWorkspaceName: string;
    },
    {}
  >
> = ({
  closeWorkspace,
  workspaceProps: { selectedPatientUuid, currentServiceQueueUuid },
  windowProps: { startVisitWorkspaceName },
  launchChildWorkspace,
}) => {
  const { t } = useTranslation();
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit, isLoading, error } = useVisit(selectedPatientUuid);

  const [showContactDetails, setShowContactDetails] = useState(false);

  const handleToggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const patientName = patient && getPatientName(patient);

  if (!patient) {
    return null;
  }

  return (
    <Workspace2 title={t('addPatientToQueue', 'Add patient to queue')}>
      <div className={styles.patientSearchContainer}>
        <AddPatientToQueueContextProvider value={{ currentServiceQueueUuid }}>
          <div className={styles.patientBannerContainer}>
            <div className={styles.patientBanner}>
              <div className={styles.patientPhoto}>
                <PatientPhoto patientUuid={patient.id} patientName={patientName} />
              </div>
              <PatientBannerPatientInfo patient={patient} />
              <PatientBannerToggleContactDetailsButton
                className={styles.toggleContactDetailsButton}
                showContactDetails={showContactDetails}
                toggleContactDetails={handleToggleContactDetails}
              />
            </div>
            {showContactDetails ? (
              <PatientBannerContactDetails deceased={patient.deceasedBoolean} patientId={patient.id} />
            ) : null}
          </div>
          <div className={styles.backButton}>
            <Button
              className={styles.backButton}
              kind="ghost"
              renderIcon={(props) => <ArrowLeftIcon size={24} {...props} />}
              iconDescription={t('backToSearchResults', 'Back to search results')}
              size="sm"
              onClick={closeWorkspace}>
              <span>{t('backToSearchResults', 'Back to search results')}</span>
            </Button>
          </div>
          {isLoading ? (
            <DataTableSkeleton role="progressbar" />
          ) : error ? (
            <ErrorState headerTitle={t('errorFetchingVisit', 'Error fetching patient visit')} error={error} />
          ) : activeVisit ? (
            <ExistingVisitFormComponent closeWorkspace={closeWorkspace} visit={activeVisit} />
          ) : (
            <Stack gap={4}>
              <div>{t('visitRequiredToCreateQueueEntry', 'A visit is required to add patient to queue')}</div>
              <ExtensionSlot
                name="start-visit-button-slot2"
                state={{
                  patientUuid: patient.id,
                  launchChildWorkspace,
                  startVisitWorkspaceName,
                }}
              />
            </Stack>
          )}
        </AddPatientToQueueContextProvider>
      </div>
    </Workspace2>
  );
};

export default CreateQueueEntryWorkspace;
