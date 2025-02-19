import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton } from '@carbon/react';
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
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';
import ExistingVisitFormComponent from './existing-visit-form/existing-visit-form.component';
import styles from './create-queue-entry.scss';

interface PatientSearchProps extends DefaultWorkspaceProps {
  selectedPatientUuid: string;
  currentServiceQueueUuid?: string;
  handleBackToSearchList?: () => void;
}

export const AddPatientToQueueContext = React.createContext({
  currentServiceQueueUuid: '',
});

/**
 *
 * This is the component that appears when clicking on a search result in the "Add patient to queue" workspace,
 */
const CreateQueueEntryWorkspace: React.FC<PatientSearchProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  selectedPatientUuid,
  currentServiceQueueUuid,
  handleBackToSearchList,
}) => {
  const { t } = useTranslation();
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit, isLoading, error } = useVisit(selectedPatientUuid);

  const [showContactDetails, setShowContactDetails] = useState(false);

  const handleToggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const patientName = patient && getPatientName(patient);

  return patient ? (
    <div className={styles.patientSearchContainer}>
      <AddPatientToQueueContext.Provider value={{ currentServiceQueueUuid }}>
        <div className={styles.patientBannerContainer}>
          <div className={styles.patientBanner}>
            <div className={styles.patientPhoto} role="img">
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
            onClick={() => handleBackToSearchList?.()}>
            <span>{t('backToSearchResults', 'Back to search results')}</span>
          </Button>
        </div>
        {isLoading ? (
          <DataTableSkeleton role="progressbar" />
        ) : error ? (
          <ErrorState headerTitle={t('errorFetchingVisit', 'Error fetching patient visit')} error={error} />
        ) : activeVisit ? (
          <ExistingVisitFormComponent visit={activeVisit} closeWorkspace={closeWorkspace} />
        ) : (
          <ExtensionSlot
            name="start-visit-workspace-form-slot"
            state={{
              patientUuid: selectedPatientUuid,
              closeWorkspace,
              promptBeforeClosing,
              openedFrom: 'service-queues-add-patient',
            }}
          />
        )}
      </AddPatientToQueueContext.Provider>
    </div>
  ) : null;
};

export default CreateQueueEntryWorkspace;
