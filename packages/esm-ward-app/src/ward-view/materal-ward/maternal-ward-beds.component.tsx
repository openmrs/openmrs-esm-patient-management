import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import WardBed from '../../beds/ward-bed.component';
import { type MotherChildRelationships, type WardPatient, type WardViewContext } from '../../types';
import { bedLayoutToBed } from '../ward-view.resource';
import MaternalWardPatientCard from './maternal-ward-patient-card.component';

const MaternalWardBeds: React.FC<MotherChildRelationships> = (motherChildRelationships) => {
  const { motherByChildUuid, isLoading: isLoadingMotherChildRelationships } = motherChildRelationships ?? {};
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { bedLayouts, wardAdmittedPatientsWithBed } = wardPatientGroupDetails ?? {};

  const wardBeds = bedLayouts?.map((bedLayout) => {
    const { patients: patientsInCurrentBed } = bedLayout;
    const bed = bedLayoutToBed(bedLayout);
    const childrenInSameBedByMotherUuid = new Map<string, WardPatient[]>();

    const wardPatients: WardPatient[] = patientsInCurrentBed
      .map((patient): WardPatient => {
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
      })
      .filter((wardPatient) => {
        // filter out any child patient whose mother is also assigned to the same bed
        // and put the child in childrenInSameBedByMotherUuid
        const patientUuid = wardPatient.patient.uuid;
        const { patient: mother } = motherByChildUuid?.get(patientUuid) ?? {};
        const motherInSameBed = patientsInCurrentBed.some((p) => p.uuid == mother?.uuid);
        if (motherInSameBed) {
          if (!childrenInSameBedByMotherUuid.has(mother.uuid)) {
            childrenInSameBedByMotherUuid.set(mother.uuid, []);
          }
          childrenInSameBedByMotherUuid.get(mother.uuid).push(wardPatient);
        }
        return !motherInSameBed;
      });

    const patientCards = wardPatients.map((wardPatient) => (
      <MaternalWardPatientCard
        key={wardPatient.patient.uuid}
        wardPatient={wardPatient}
        childrenOfWardPatientInSameBed={childrenInSameBedByMotherUuid.get(wardPatient.patient.uuid)}
      />
    ));

    return (
      <WardBed
        key={bed.uuid}
        bed={bed}
        patientCards={patientCards}
        isLoadingDivider={isLoadingMotherChildRelationships}
      />
    );
  });

  return <>{wardBeds}</>;
};

export default MaternalWardBeds;
