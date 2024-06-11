import React from 'react';
import { useParams } from 'react-router-dom';
import type { WardPatientCardProps } from '../types';
import { usePatientCardElements } from './ward-patient-card-row.resources';

interface WardPatientCardElementProps extends WardPatientCardProps {
  className?: string;
}

/**
 * A patient card can have a list of patient card rows, and each patient card row 
 * can list any number of PatientCardElements, which contain attributes about the patient. 
 */
const WardPatientCardRow: React.FC<WardPatientCardElementProps> = ({ patient, bed, className }) => {
  const { locationUuid } = useParams();
  const patientCardElements = usePatientCardElements(locationUuid);

  return (
    <div className={className}>
      {patientCardElements.map((PatientCardElement, i) => (
        <PatientCardElement patient={patient} bed={bed} key={i} />
      ))}
    </div>
  );
};

export default WardPatientCardRow;
