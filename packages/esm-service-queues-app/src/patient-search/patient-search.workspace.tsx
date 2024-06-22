import React, { useEffect, useState } from 'react';
import { Button, DataTableSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  getPatientName,
  ArrowLeftIcon,
  ErrorState,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';
import { SearchTypes } from '../types';
import ExistingVisitFormComponent from './visit-form/existing-visit-form.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import VisitForm from './visit-form/visit-form.component';
import usePatientData from './hooks/usePatientData';
import styles from './patient-search.scss';

interface PatientSearchProps extends DefaultWorkspaceProps {
  selectedPatientUuid: string;
  currentServiceQueueUuid?: string;
  handleBackToSearchList?: () => void;
}

export const AddPatientToQueueContext = React.createContext({
  currentServiceQueueUuid: '',
});

const PatientSearch: React.FC<PatientSearchProps> = ({
  closeWorkspace,
  selectedPatientUuid,
  currentServiceQueueUuid,
  handleBackToSearchList,
}) => {
  const { t } = useTranslation();
  const { patient, activeVisit, appointments, isLoading, isError, searchType, setSearchType, hasAppointments } =
    usePatientData(selectedPatientUuid);
  const [showContactDetails, setContactDetails] = useState(false);

  const backButtonDescription =
    searchType === SearchTypes.VISIT_FORM && hasAppointments
      ? t('backToScheduledVisits', 'Back to scheduled visits')
      : t('backToSearchResults', 'Back to search results');

  const handleBackToAction = () => {
    if (searchType === SearchTypes.VISIT_FORM && hasAppointments) {
      setSearchType(SearchTypes.SCHEDULED_VISITS);
    } else {
      setSearchType(SearchTypes.SEARCH_RESULTS);
    }
  };

  useEffect(() => {
    if (searchType === SearchTypes.SEARCH_RESULTS) {
      handleBackToSearchList && handleBackToSearchList();
    }
  }, [searchType, handleBackToSearchList]);

  const patientName = patient && getPatientName(patient);

  return patient ? (
    <AddPatientToQueueContext.Provider value={{ currentServiceQueueUuid }}>
      <div className={styles.patientBannerContainer}>
        <div className={styles.patientBanner}>
          <div className={styles.patientPhoto}>
            <PatientPhoto patientUuid={patient.id} patientName={patientName} />
          </div>
          <PatientBannerPatientInfo patient={patient} />
          <PatientBannerToggleContactDetailsButton
            showContactDetails={showContactDetails}
            toggleContactDetails={() => setContactDetails(!showContactDetails)}
          />
        </div>
        {showContactDetails ? (
          <PatientBannerContactDetails patientId={patient.id} deceased={patient.deceasedBoolean} />
        ) : null}
      </div>
      <div className={styles.backButton}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeftIcon size={24} {...props} />}
          iconDescription={backButtonDescription}
          size="sm"
          onClick={handleBackToAction}>
          <span>{backButtonDescription}</span>
        </Button>
      </div>
      <div>
        {activeVisit ? (
          <ExistingVisitFormComponent visit={activeVisit} closeWorkspace={closeWorkspace} />
        ) : (
          <>
            {isError ? (
              <ErrorState headerTitle={t('errorFetchingAppointments', 'Error fetching appointments')} error={isError} />
            ) : null}
            {isLoading && !isError ? (
              <DataTableSkeleton role="progressbar" />
            ) : searchType === SearchTypes.SCHEDULED_VISITS && hasAppointments ? (
              <PatientScheduledVisits
                appointments={appointments}
                patientUuid={selectedPatientUuid}
                toggleSearchType={setSearchType}
                closeWorkspace={closeWorkspace}
              />
            ) : searchType === SearchTypes.VISIT_FORM ? (
              <VisitForm patientUuid={selectedPatientUuid} closeWorkspace={closeWorkspace} />
            ) : null}
          </>
        )}
      </div>
    </AddPatientToQueueContext.Provider>
  ) : null;
};

export default PatientSearch;
