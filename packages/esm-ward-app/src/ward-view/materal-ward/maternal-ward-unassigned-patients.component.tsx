import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { type WardViewContext } from '../../types';
import MaternalWardPatientCard from './maternal-ward-patient-card.component';

/**
 * Renders a list of patients in the ward that are admitted but not assigned a bed
 * @returns
 */
function MaternalWardUnassignedPatients() {
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { wardUnassignedPatientsList } = wardPatientGroupDetails ?? {};

  const wardUnassignedPatients = wardUnassignedPatientsList?.map((inpatientAdmission) => {
    return (
      <MaternalWardPatientCard
        wardPatient={{
          patient: inpatientAdmission.patient,
          visit: inpatientAdmission.visit,
          bed: null,
          inpatientAdmission,
          inpatientRequest: inpatientAdmission.currentInpatientRequest,
        }}
        childrenOfWardPatientInSameBed={[]}
        key={inpatientAdmission.patient.uuid}
      />
    );
  });

  return <>{wardUnassignedPatients}</>;
}

export default MaternalWardUnassignedPatients;
