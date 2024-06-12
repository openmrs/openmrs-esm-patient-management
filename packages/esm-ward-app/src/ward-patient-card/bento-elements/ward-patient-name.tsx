import React from 'react';
import { WardPatientCardBentoElement } from '../../types';
import styles from '../admitted-patient-details.scss';

const WardPatientName: WardPatientCardBentoElement = ({ patient }) => {
  // TODO: make server return patient.display and use that instead
  const { givenName, familyName } = patient?.person?.preferredName;
  const name = `${givenName} ${familyName}`;
  return <div className={styles.admittedPatientName}>{name}</div>;
};

export default WardPatientName;
