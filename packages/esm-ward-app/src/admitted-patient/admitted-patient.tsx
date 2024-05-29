import React from 'react';
import AdmittedPatientHeader from './admitted-patient-header/admitted-patient-header';
import { type Patient } from '@openmrs/esm-framework';
import { Bed } from '../types';

export interface AdmittedPatientProps {
  patients: Patient[];
  bed: Bed | null;
}
const AdmittedPatient: React.FC<AdmittedPatientProps> = ({ patients, bed }) => {
  return (
    <>
      {patients.map(patient => <AdmittedPatientHeader patient={patient} bed={bed} />)}
    </>
  );
};

export default AdmittedPatient;
