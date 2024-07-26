import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';

const WardPatientName: WardPatientCardElement = ({ patient }) => {
  // TODO confirm "display" is based on name template?
  return <div className={styles.wardPatientName}>{patient?.person?.preferredName?.display}</div>;
};

export default WardPatientName;
