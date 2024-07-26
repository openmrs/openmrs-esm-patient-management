import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';

const WardPatientName: WardPatientCardElement = ({ patient }) => {
  return <div className={styles.wardPatientName}>{patient?.person?.preferredName?.display}</div>;
};

export default WardPatientName;
