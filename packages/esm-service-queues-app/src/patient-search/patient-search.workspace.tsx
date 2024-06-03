import React, { useState } from 'react';
import { SearchTypes } from '../types';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import VisitForm from './visit-form/visit-form.component';
import {
  ArrowLeftIcon,
  type DefaultWorkspaceProps,
  displayName,
  ErrorState,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import ExistingVisitFormComponent from './visit-form/existing-visit-form.component';
import styles from './patient-search.scss';
import { Button, DataTableSkeleton } from '@carbon/react';
import { useScheduledVisits } from './hooks/useScheduledVisits';
import isNil from 'lodash-es/isNil';

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
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit } = useVisit(selectedPatientUuid);
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.SCHEDULED_VISITS);
  const [showContactDetails, setContactDetails] = useState(false);
  const { appointments, isLoading, isError } = useScheduledVisits(selectedPatientUuid);
  const hasAppointments = useMemo(
    () => !(isNil(appointments?.futureVisits) && isNil(appointments?.recentVisits)),
    [appointments],
  );

  const backButtonDescription = useMemo(() => {
    if (searchType === SearchTypes.VISIT_FORM && hasAppointments) {
      return t('backToScheduledVisits', 'Back to scheduled visits');
    }
    return t('backToSearchResults', 'Back to search results');
  }, [activeVisit, searchType, hasAppointments]);

  const toggleSearchType = useCallback((searchType: SearchTypes) => {
    setSearchType(searchType);
  }, []);

  const handleBackToAction = () => {
    if (searchType === SearchTypes.VISIT_FORM && hasAppointments) {
      setSearchType(SearchTypes.SCHEDULED_VISITS);
    } else {
      setSearchType(SearchTypes.SEARCH_RESULTS);
    }
  };

  useEffect(() => {
    if (searchType === SearchTypes.SCHEDULED_VISITS && appointments && !hasAppointments) {
      setSearchType(SearchTypes.VISIT_FORM);
    }
  }, [hasAppointments, appointments]);

  useEffect(() => {
    if (searchType === SearchTypes.SEARCH_RESULTS) {
      handleBackToSearchList && handleBackToSearchList();
    }
  }, [searchType, handleBackToSearchList]);

  const patientName = patient && displayName(patient);
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
          onClick={() => handleBackToAction()}>
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
                toggleSearchType={toggleSearchType}
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
