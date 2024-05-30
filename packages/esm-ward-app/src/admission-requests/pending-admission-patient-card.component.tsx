import { Patient } from '@openmrs/esm-framework';
import React from 'react';
import AdmittedPatientHeader from '../admitted-patient/admitted-patient-header/admitted-patient-header';

interface PendingAdmissionPatientCardProps {
  patient: Patient;
}
const PendingAdmissionPatientCard: React.FC<PendingAdmissionPatientCardProps> = ({patient}) => {

  return (
    <div>
      <AdmittedPatientHeader patient={patient} bed={null} />
      <div>
        Assign Bed
      </div>
    </div>
  )
}

export default PendingAdmissionPatientCard;