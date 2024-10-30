import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import WardBed from '../../beds/ward-bed.component';
import { type WardPatient, type WardViewContext } from '../../types';
import { bedLayoutToBed } from '../ward-view.resource';
import DefaultWardPatientCard from './default-ward-patient-card.component';

function DefaultWardBeds() {
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { bedLayouts, wardAdmittedPatientsWithBed } = wardPatientGroupDetails ?? {};

  const wardBeds = bedLayouts?.map((bedLayout) => {
    const { patients } = bedLayout;
    const bed = bedLayoutToBed(bedLayout);
    const wardPatients: WardPatient[] = patients.map((patient): WardPatient => {
      const inpatientAdmission = wardAdmittedPatientsWithBed?.get(patient.uuid);
      if (inpatientAdmission) {
        const { patient, visit, currentInpatientRequest } = inpatientAdmission;
        return { patient, visit, bed, inpatientAdmission, inpatientRequest: currentInpatientRequest || null };
      } else {
        // for some reason this patient is in a bed but not in the list of admitted patients, so we need to use the patient data from the bed endpoint
        return {
          patient: patient,
          visit: null,
          bed,
          inpatientAdmission: null, // populate after BED-13
          inpatientRequest: null,
        };
      }
    });
    const patientCards = wardPatients.map((wardPatient) => (
      <DefaultWardPatientCard key={wardPatient.patient.uuid} {...{ wardPatient }} />
    ));
    return <WardBed key={bed.uuid} bed={bed} patientCards={patientCards} />;
  });

  return <>{wardBeds}</>;
}

export default DefaultWardBeds;
