import { BabyIcon, MotherIcon, type Patient, useAppContext } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { type InpatientAdmission, type MaternalWardViewContext } from '../../types';
import { type MaternalWardPatientCardProps } from '../../ward-view/materal-ward/maternal-ward-patient-card.component';
import WardPatientAge from '../row-elements/ward-patient-age';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier';
import WardPatientLocation from '../row-elements/ward-patient-location';
import WardPatientName from '../row-elements/ward-patient-name';
import wardPatientCardStyles from '../ward-patient-card.scss';
import styles from './mother-child-row.scss';

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

interface MotherOrChildProp {
  otherPatient: Patient;
  otherPatientAdmission: InpatientAdmission;
  isOtherPatientTheMother: boolean;
}

const MotherOrChild: React.FC<MotherOrChildProp> = ({
  otherPatient,
  otherPatientAdmission,
  isOtherPatientTheMother,
}) => {
  const Icon = isOtherPatientTheMother ? MotherIcon : BabyIcon;

  return (
    <div
      key={otherPatient.uuid}
      className={classNames(styles.motherOrBabyRow, wardPatientCardStyles.wardPatientCardRow)}>
      <div className={styles.motherOrBabyIconDiv}>
        <Icon className={styles.motherOrBabyIcon} size={24} />
      </div>
      <div className={classNames(styles.motherOrBabyRowElementsDiv, wardPatientCardStyles.dotSeparatedChildren)}>
        <WardPatientName patient={otherPatient} />
        <WardPatientIdentifier id="patient-identifier" patient={otherPatient} />
        <WardPatientAge patient={otherPatient} />
        <WardPatientLocation inpatientAdmission={otherPatientAdmission} />
      </div>
    </div>
  );
};

export default MotherChildRow;
