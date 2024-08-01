import { age } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientCardElement } from '../../types';

const WardPatientAge: WardPatientCardElement = ({ patient }) => {
  return <div>{age(patient.person?.birthdate)}</div>;
};

export default WardPatientAge;
