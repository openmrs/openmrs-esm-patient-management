import React from 'react';
import { WardPatientCardBentoElement } from '../../types';
import styles from '../admitted-patient-details.scss';

const AdmittedPatientHeaderTime: WardPatientCardBentoElement = () => {
  return <div className={styles.timeLapsed}>ADMITTED: 30 hours ago</div>;
};

export default AdmittedPatientHeaderTime;
