import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchTypes } from '../types';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import VisitForm from './visit-form/visit-form.component';
import { type DefaultWorkspaceProps, ExtensionSlot, usePatient, useVisit } from '@openmrs/esm-framework';
import ExistingVisitFormComponent from './visit-form/existing-visit-form.component';

interface PatientSearchProps extends DefaultWorkspaceProps {
  viewState: {
    selectedPatientUuid?: string;
  };
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closeWorkspace, viewState }) => {
  const { t } = useTranslation();
  const { selectedPatientUuid } = viewState;
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit } = useVisit(selectedPatientUuid);
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.SCHEDULED_VISITS);
  const [newVisitMode, setNewVisitMode] = useState<boolean>(false);

  const toggleSearchType = (searchType: SearchTypes, mode: boolean = false) => {
    setSearchType(searchType);
    setNewVisitMode(mode);
  };

  return (
    <>
      {patient && (
        <ExtensionSlot
          name="patient-header-slot"
          state={{
            patient,
            patientUuid: selectedPatientUuid,
            hideActionsOverflow: true,
          }}
        />
      )}
      <div className="omrs-main-content">
        {activeVisit ? (
          <ExistingVisitFormComponent visit={activeVisit} closePanel={closeWorkspace} />
        ) : searchType === SearchTypes.SCHEDULED_VISITS ? (
          <PatientScheduledVisits
            patientUuid={selectedPatientUuid}
            toggleSearchType={toggleSearchType}
            closePanel={closeWorkspace}
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
  );
};

export default PatientSearch;
