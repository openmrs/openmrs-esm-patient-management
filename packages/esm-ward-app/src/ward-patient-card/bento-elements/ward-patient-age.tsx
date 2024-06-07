import React from 'react';
import { WardPatientCardBentoElement } from '../../types';
import styles from '../admitted-patient-details.scss';

const AdmittedPatientHeaderAge: WardPatientCardBentoElement = ({ patient }) => {
  return <div className={styles.admittedPatientField}>{patient?.person?.age} yrs</div>;
};

export default AdmittedPatientHeaderAge;
