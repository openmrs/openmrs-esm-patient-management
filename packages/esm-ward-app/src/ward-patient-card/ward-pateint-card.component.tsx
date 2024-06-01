import { Location, type Patient } from '@openmrs/esm-framework';
import React from 'react';
import { useCardSlots } from './slots/slots.resource';
import { useParams } from 'react-router-dom';
import { Bed } from '../types';

export interface WardPatientCardProps {
  patient: Patient;
  bed: Bed;
  status: "admitted" | "pending";
}
const WardPatientCard: React.FC<WardPatientCardProps> = ({ patient, bed, status }) => {

  const { locationUuid } = useParams();
  const wardPatientCardSlots = useCardSlots(locationUuid, status);

  return (
    <div>
      {wardPatientCardSlots.map((WardPatientCardSlot, i) => 
        <WardPatientCardSlot key={i} patient={patient} bed={bed} />
      )}
    </div>
  );
}

export default WardPatientCard;
