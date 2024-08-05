import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import styles from '../ward-patient-card.scss';

const WardPatientName: React.FC<{ patient: Patient }> = ({ patient }) => {
  // TODO confirm "display" is based on name template?
  return <div className={styles.wardPatientName}>{patient?.person?.preferredName?.display}</div>;
};

export default WardPatientName;
