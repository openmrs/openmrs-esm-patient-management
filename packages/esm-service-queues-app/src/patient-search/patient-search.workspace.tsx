import React, { useState } from 'react';
import { SearchTypes } from '../types';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import VisitForm from './visit-form/visit-form.component';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  usePatient,
  useVisit,
  PatientBannerPatientInfo,
  PatientPhoto,
  PatientBannerToggleContactDetailsButton,
  PatientBannerContactDetails,
} from '@openmrs/esm-framework';
import ExistingVisitFormComponent from './visit-form/existing-visit-form.component';
import styles from './patient-search.scss';

interface PatientSearchProps extends DefaultWorkspaceProps {
  viewState: {
    selectedPatientUuid?: string;
  };
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closeWorkspace, viewState }) => {
  const { selectedPatientUuid } = viewState;
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit } = useVisit(selectedPatientUuid);
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.SCHEDULED_VISITS);
  const [newVisitMode, setNewVisitMode] = useState<boolean>(false);
  const [showContactDetails, setContactDetails] = useState(false);

  const toggleSearchType = (searchType: SearchTypes, mode: boolean = false) => {
    setSearchType(searchType);
    setNewVisitMode(mode);
  };

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;
  return patient ? (
    <>
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
      <div>
        {activeVisit ? (
          <ExistingVisitFormComponent visit={activeVisit} closePanel={closeWorkspace} />
        ) : searchType === SearchTypes.SCHEDULED_VISITS ? (
          <PatientScheduledVisits
            patientUuid={selectedPatientUuid}
            toggleSearchType={toggleSearchType}
            closeWorkspace={closeWorkspace}
          />
        ) : searchType === SearchTypes.VISIT_FORM ? (
          <VisitForm
            patientUuid={selectedPatientUuid}
            toggleSearchType={toggleSearchType}
            closePanel={closeWorkspace}
            mode={newVisitMode}
          />
        ) : null}
      </div>
    </>
  ) : null;
};

export default PatientSearch;
