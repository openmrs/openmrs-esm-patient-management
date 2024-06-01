import { Patient } from '@openmrs/esm-framework';
import React from 'react';
import WardPatientCard from '../ward-patient-card/ward-pateint-card.component';

interface PendingAdmissionPatientCardProps {
  patient: Patient;
}
const PendingAdmissionPatientCard: React.FC<PendingAdmissionPatientCardProps> = ({patient}) => {

  return (
    <div>
      <WardPatientCard patient={patient} bed={null} status={"pending"} />
      <div>
        Assign Bed
      </div>
    </div>
  )
}

export default PendingAdmissionPatientCard;