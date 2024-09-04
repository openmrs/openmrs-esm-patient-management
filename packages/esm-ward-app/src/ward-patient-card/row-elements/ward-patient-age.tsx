import { age, type Patient } from '@openmrs/esm-framework';
import React from 'react';

export interface WardPatientAgeProps {
  patient: Patient;
}

const WardPatientAge: React.FC<WardPatientAgeProps> = ({ patient }) => {
  return patient.person?.birthdate ? <div>{age(patient.person.birthdate)}</div> : null;
};

export default WardPatientAge;
