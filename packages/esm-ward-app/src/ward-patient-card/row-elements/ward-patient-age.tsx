import { age, type Patient } from '@openmrs/esm-framework';
import React from 'react';

const WardPatientAge: React.FC<{ patient: Patient }> = ({ patient }) => {
  return <div>{age(patient.person?.birthdate)}</div>;
};

export default WardPatientAge;
