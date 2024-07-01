import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';

const WardPatientName: WardPatientCardElement = ({ patient }) => {
  // TODO: BED-10
  // make server return patient.display and use that instead
  const { givenName, familyName } = patient?.person?.preferredName;
  const name = `${givenName} ${familyName}`;
  return <div className={styles.wardPatientName}>{name}</div>;
};

export default WardPatientName;
