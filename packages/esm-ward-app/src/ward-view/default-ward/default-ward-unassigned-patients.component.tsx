import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientGroupDetails } from '../../types';
import DefaultWardPatientCard from '../../ward-patient-card/default-ward/default-ward-patient-card.component';

/**
 * Renders a list of patients in the ward that are admitted but not assigned a bed
 * @returns
 */
function DefaultWardUnassignedPatients() {
  const wardPatientsGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { wardUnassignedPatientsList } = wardPatientsGrouping ?? {};

  const wardUnassignedPatients = wardUnassignedPatientsList?.map((inpatientAdmission) => {
    return (
      <DefaultWardPatientCard
        {...{
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
