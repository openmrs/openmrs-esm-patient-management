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
  view?: string;
  viewState: {
    selectedPatientUuid?: string;
  };
  headerTitle?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closePanel, view, viewState, headerTitle }) => {
  const { t } = useTranslation();
  const { selectedPatientUuid } = viewState;
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit } = useVisit(selectedPatientUuid);
  const [searchType, setSearchType] = useState<SearchTypes>(
    view === 'queue_service_form'
      ? SearchTypes.QUEUE_SERVICE_FORM
      : view === 'queue_room_form'
        ? SearchTypes.QUEUE_ROOM_FORM
        : SearchTypes.SCHEDULED_VISITS,
  );
  const [newVisitMode, setNewVisitMode] = useState<boolean>(false);

  const toggleSearchType = (searchType: SearchTypes, mode: boolean = false) => {
    setSearchType(searchType);
    setNewVisitMode(mode);
  };

  return (
    <>
      <Overlay header={headerTitle} closePanel={closePanel}>
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
            <ExistingVisitFormComponent
              toggleSearchType={toggleSearchType}
              visit={activeVisit}
              closePanel={closePanel}
            />
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
          ) : searchType === SearchTypes.QUEUE_SERVICE_FORM ? (
            <QueueServiceForm toggleSearchType={toggleSearchType} closePanel={closePanel} />
          ) : searchType === SearchTypes.QUEUE_ROOM_FORM ? (
            <QueueRoomForm toggleSearchType={toggleSearchType} closePanel={closePanel} />
          ) : null}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
