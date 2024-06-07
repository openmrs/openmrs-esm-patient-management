import { Location, type Patient } from '@openmrs/esm-framework';
import React from 'react';
import { useCardSlots } from './ward-patient-card.resources';
import { useParams } from 'react-router-dom';
import { WardPatientStatus, type Bed } from '../types';

export interface WardPatientCardProps {
  patient: Patient;
  bed: Bed;
  status: WardPatientStatus;
}
const WardPatientCard: React.FC<WardPatientCardProps> = ({ patient, bed }) => {
  const { locationUuid } = useParams();
  const wardPatientCardSlots = useCardSlots(locationUuid);

  return (
    <div>
      {wardPatientCardSlots.map((WardPatientCardSlot, i) => (
        <WardPatientCardSlot key={i} patient={patient} bed={bed} />
      ))}
    </div>
  );
};

export default WardPatientCard;
