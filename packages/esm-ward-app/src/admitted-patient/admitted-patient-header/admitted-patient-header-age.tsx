import React from 'react';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';
import styles from '../admitted-patient-details.scss';

const AdmittedPatientHeaderAge: React.FC<AdmittedPatientHeaderProps> = ({ patient }) => {
  return <div className={styles.admittedPatientField}>{patient?.person?.age} yrs</div>;
};

export default AdmittedPatientHeaderAge;
