import React from 'react';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';
import styles from '../admitted-patient-details.scss';

const AdmittedPatientHeaderTime: React.FC<AdmittedPatientHeaderProps> = () => {
  return <div className={styles.timeLapsed}>ADMITTED: 30 hours ago</div>;
};

export default AdmittedPatientHeaderTime;
