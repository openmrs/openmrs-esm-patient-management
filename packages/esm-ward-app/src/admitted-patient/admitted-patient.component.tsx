import React from 'react';
import AdmittedPatientHeader from './admitted-patient-header.component';
import AdmittedPatientFooter from './admitted-patient-footer';
import { type Bed } from '../types';
import { type Patient } from '@openmrs/esm-framework';
import styles from './admitted-patient.scss';

export interface AdmittedPatientHeaderProps {
  bed: Bed;
  patient: Patient;
}

const AdmittedPatient = ({ bed, patient }: AdmittedPatientHeaderProps) => {
  return (
    <div className={styles.admittedPatientContainer}>
      <AdmittedPatientHeader bed={bed} patient={patient} />
      <AdmittedPatientFooter />
    </div>
  );
};

export default AdmittedPatient;
