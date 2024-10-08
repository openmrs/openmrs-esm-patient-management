import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import WardBed from '../../beds/ward-bed.component';
import { MotherAndChild, type WardPatient, type WardPatientGroupDetails } from '../../types';
import { bedLayoutToBed } from '../ward-view.resource';
import MaternalWardPatientCard from './maternal-ward-patient-card.component';

interface MaternalWardBedsProps {
  motherChildrenRelationshipsByPatient: Map<string, MotherAndChild[]>;
}

const MaternalWardBeds : React.FC<MaternalWardBedsProps> = ({motherChildrenRelationshipsByPatient}) => {
  const wardPatientsGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { bedLayouts, wardAdmittedPatientsWithBed } = wardPatientsGrouping ?? {};

  const wardBeds = bedLayouts?.map((bedLayout) => {
    const { patients: patientsInCurrentBed } = bedLayout;
    const bed = bedLayoutToBed(bedLayout);
    const wardPatients: WardPatient[] = patientsInCurrentBed.map((patient): WardPatient => {
      const inpatientAdmission = wardAdmittedPatientsWithBed?.get(patient.uuid);
      if (inpatientAdmission) {
        const { patient, visit, currentInpatientRequest } = inpatientAdmission;
        return { patient, visit, bed, inpatientAdmission, inpatientRequest: currentInpatientRequest || null };
      } else {
        // for some reason this patient is in a bed but not in the list of admitted patients, 
        // so we need to use the patient data from the bed endpoint
        return {
          patient: patient,
          visit: null,
          bed,
          inpatientAdmission: null,
          inpatientRequest: null,
        };
      }
    }).filter((wardPatient) => {
      // filter out any child patient whose mother is also assigned to the same bed
      // (the child patient will instead have a sub-card rendered in the mother's patient card)
      const patientUuid = wardPatient.patient.uuid;
      for(const relationship of motherChildrenRelationshipsByPatient?.get(patientUuid) ?? []) {
        if(relationship.child.uuid == patientUuid) {
          if(patientsInCurrentBed.some((patient) => patient.uuid == relationship.mother.uuid)) {
            return false;
          }
        }
      }
      return true;
    });
    const patientCards = wardPatients.map(wardPatient => (
      <MaternalWardPatientCard 
        key={wardPatient.patient.uuid}
        {...wardPatient} />
    ));

    return <WardBed key={bed.uuid} bed={bed} patientCards={patientCards} />;
  });

  return <>{wardBeds}</>;
}

export default MaternalWardBeds;
