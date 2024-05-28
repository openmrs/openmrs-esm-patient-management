import React from 'react';
import AdmittedPatientHeader from './admitted-patient-header';
import { type Patient } from '@openmrs/esm-framework';

export interface AdmittedPatientProps {
  patient?: Patient;
}
const AdmittedPatient: React.FC<AdmittedPatientProps> = ({ patient }) => {
  return (
    <>
      <AdmittedPatientHeader patient={patient} />
    </>
  );
};

export default AdmittedPatient;
