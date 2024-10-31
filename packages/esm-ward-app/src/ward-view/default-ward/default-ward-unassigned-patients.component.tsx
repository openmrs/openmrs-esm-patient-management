import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { type WardViewContext } from '../../types';
import DefaultWardPatientCard from './default-ward-patient-card.component';

/**
 * Renders a list of patients in the ward that are admitted but not assigned a bed
 * @returns
 */
function DefaultWardUnassignedPatients() {
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { wardUnassignedPatientsList } = wardPatientGroupDetails ?? {};

  const wardUnassignedPatients = wardUnassignedPatientsList?.map((inpatientAdmission) => {
    return (
      <DefaultWardPatientCard
        wardPatient={{
          patient: inpatientAdmission.patient,
          visit: inpatientAdmission.visit,
          bed: null,
          inpatientAdmission,
          inpatientRequest: inpatientAdmission.currentInpatientRequest,
        }}
        key={inpatientAdmission.patient.uuid}
      />
    );
  });

  return <>{wardUnassignedPatients}</>;
}

export default DefaultWardUnassignedPatients;
