import React from 'react';
import styles from '../admitted-patient-details.scss';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';

const WardPatientSlotElementName: React.FC<AdmittedPatientHeaderProps> = ({ patient }) => {
  // TODO: make server return patient.display and use that instead
  const { givenName, familyName } = patient?.person?.preferredName;
  const name = `${givenName} ${familyName}`;
  return <div className={styles.admittedPatientName}>{name}</div>;
};

export default WardPatientSlotElementName;
