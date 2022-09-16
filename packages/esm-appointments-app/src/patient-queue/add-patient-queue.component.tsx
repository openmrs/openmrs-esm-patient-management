import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

interface AddPatientToQueueProps {
  patientUuid: string;
}

const AddPatientToQueue: React.FC<AddPatientToQueueProps> = ({ patientUuid }) => {
  const state = { patientUuid: patientUuid, toggleSearchType: () => {}, closePanel: () => {}, mode: 'visit_form' };
  return <ExtensionSlot state={state} extensionSlotName="add-patient-to-queue-slot'" />;
};

export default AddPatientToQueue;
