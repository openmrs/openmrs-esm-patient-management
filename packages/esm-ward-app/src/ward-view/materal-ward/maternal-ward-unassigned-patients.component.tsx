import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientGroupDetails } from '../../types';
import MaternalWardPatientCard from './maternal-ward-patient-card.component';

/**
 * Renders a list of patients in the ward that are admitted but not assigned a bed
 * @returns
 */
function MaternalWardUnassignedPatients() {
  const wardPatientsGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { wardUnassignedPatientsList } = wardPatientsGrouping ?? {};

  const wardUnassignedPatients = wardUnassignedPatientsList?.map((inpatientAdmission) => {
    return (
      <MaternalWardPatientCard
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

export default MaternalWardUnassignedPatients;
