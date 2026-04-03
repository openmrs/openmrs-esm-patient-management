import React from 'react';
import { useAppContext } from '@openmrs/esm-framework';
import { type MaternalWardViewContext } from '../../types';
import { type MaternalWardPatientCardProps } from '../../ward-view/maternal-ward/maternal-ward-patient-card.component';
import MotherOrChild from '../row-elements/ward-mother-or-child.component';

/**
 * This component displays the mother or children of the patient in the patient card. The patient's child is
 * not displayed if it is in the same bed as the patient
 *
 * @param param0
 * @returns
 */
const MotherChildRow: React.FC<MaternalWardPatientCardProps> = ({ wardPatient, childrenOfWardPatientInSameBed }) => {
  const { patient } = wardPatient;

  const { motherChildRelationships } = useAppContext<MaternalWardViewContext>('maternal-ward-view-context') ?? {};

  const { childrenByMotherUuid, motherByChildUuid } = motherChildRelationships ?? {};

  const motherOfPatient = motherByChildUuid?.get(patient.uuid);
  const childrenOfPatient = childrenByMotherUuid?.get(patient.uuid);
  const childrenOfPatientNotInSameBed = childrenOfPatient?.filter((child) => {
    return !childrenOfWardPatientInSameBed?.some((childInSameBed) => childInSameBed.patient.uuid == child.patient.uuid);
  });

  return (
    <>
      {motherOfPatient && (
        <MotherOrChild
          otherPatient={motherOfPatient.patient}
          otherPatientAdmission={motherOfPatient.currentAdmission}
          isOtherPatientTheMother={true}
        />
      )}
      {childrenOfPatientNotInSameBed?.map((childOfPatient) => (
        <MotherOrChild
          key={childOfPatient.patient.uuid}
          otherPatient={childOfPatient.patient}
          otherPatientAdmission={childOfPatient.currentAdmission}
          isOtherPatientTheMother={false}
        />
      ))}
    </>
  );
};

export default MotherChildRow;
