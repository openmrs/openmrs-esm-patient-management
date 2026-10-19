import React from 'react';
import classNames from 'classnames';
import { BabyIcon, MotherIcon, type Patient } from '@openmrs/esm-framework';
import WardPatientAge from '../row-elements/ward-patient-age.component';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier.component';
import WardPatientLocation from '../row-elements/ward-patient-location.component';
import WardPatientName from '../row-elements/ward-patient-name.component';
import { type InpatientAdmission } from '../../types';
import styles from './ward-mother-or-child.scss';
import wardPatientCardStyles from '../ward-patient-card.scss';

interface MotherOrChildProp {
  otherPatient: Patient;
  otherPatientAdmission: InpatientAdmission;
  isOtherPatientTheMother: boolean;
  children?: React.ReactNode;
}

/**
 * A row element that displays a related patient (otherPatient) to the ward patient. The related patient
 * can either be the mother or child of the ward patient.
 * @returns
 */
const MotherOrChild: React.FC<MotherOrChildProp> = ({
  otherPatient,
  otherPatientAdmission,
  isOtherPatientTheMother,
  children,
}) => {
  const Icon = isOtherPatientTheMother ? MotherIcon : BabyIcon;

  return (
    <div key={otherPatient.uuid} className={wardPatientCardStyles.wardPatientCardRow}>
      {children}
      <div className={styles.motherOrBabyRow}>
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
    </div>
  );
};

export default MotherOrChild;
