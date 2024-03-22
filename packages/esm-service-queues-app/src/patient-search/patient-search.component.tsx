import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchTypes } from '../types';
import Overlay from '../overlay.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import QueueServiceForm from '../queue-services/queue-service-form.component';
import QueueRoomForm from '../queue-rooms/queue-room-form.component';
import VisitForm from './visit-form/visit-form.component';
import { ExtensionSlot, usePatient, useVisit } from '@openmrs/esm-framework';
import ExistingVisitFormComponent from './visit-form/existing-visit-form.component';

interface PatientSearchProps {
  closePanel: () => void;
  viewState: {
    selectedPatientUuid?: string;
  };
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closePanel, viewState }) => {
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
      <Overlay header={t('addPatientToQueue', 'Add patient to queue')} closePanel={closePanel}>
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
            <ExistingVisitFormComponent visit={activeVisit} closePanel={closePanel} />
          ) : searchType === SearchTypes.SCHEDULED_VISITS ? (
            <PatientScheduledVisits
              patientUuid={selectedPatientUuid}
              toggleSearchType={toggleSearchType}
              closePanel={closePanel}
            />
          ) : searchType === SearchTypes.VISIT_FORM ? (
            <VisitForm
              patientUuid={selectedPatientUuid}
              toggleSearchType={toggleSearchType}
              closePanel={closePanel}
              mode={newVisitMode}
            />
          ) : null}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
