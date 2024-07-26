import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatientCardElement } from '../../types';
import { age } from '@openmrs/esm-framework';

const WardPatientAge: WardPatientCardElement = ({ patient }) => {
  return <div>{age(patient.person?.birthdate)}</div>;
};

export default WardPatientAge;
