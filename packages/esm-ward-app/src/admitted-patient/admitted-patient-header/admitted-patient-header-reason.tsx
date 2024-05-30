import React from 'react';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';
import styles from '../admitted-patient-details.scss';

const AdmittedPatienttHeaderReason: React.FC<AdmittedPatientHeaderProps> = () => {
  return <div className={styles.admittedPatientField}>REASON: Induction of Labour</div>;
};

export default AdmittedPatienttHeaderReason;
