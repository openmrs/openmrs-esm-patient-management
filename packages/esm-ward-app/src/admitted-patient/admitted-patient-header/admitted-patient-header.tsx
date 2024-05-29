import { ExtensionSlot, Patient } from '@openmrs/esm-framework';
import React from 'react';
import { Bed } from '../../types';
import styles from './admitted-patient-header.scss';

export interface AdmittedPatientHeaderProps {
  patient: Patient;
  bed: Bed | null;
}

const AdmittedPatientHeader: React.FC<AdmittedPatientHeaderProps> = ({ patient, bed }) => {
  return (
    <div className={styles.admittedPatientHeader}>
      <ExtensionSlot 
        name="ward-admitted-patient-header-slot" 
        state={{patient, bed}}
      />
    </div>
  );
};

export default AdmittedPatientHeader;
