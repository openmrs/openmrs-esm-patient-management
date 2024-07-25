import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';

const WardPatientName: WardPatientCardElement = ({ patient }) => {
  // TODO display should be based on name template, not hardcoded
  const { givenName, familyName } = patient?.person?.preferredName || {};
  return <div className={styles.wardPatientName}>{`${givenName} ${familyName}`}</div>;
};

export default WardPatientName;
