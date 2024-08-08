import { type Patient } from '@openmrs/esm-framework';
import { type TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

const WardPatientGender: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { t } = useTranslation();

  return <div>{getGender(t, patient?.person?.gender)}</div>;
};

export const getGender = (t: TFunction, gender: string): string => {
  switch (gender) {
    case 'M':
      return t('male', 'Male');
    case 'F':
      return t('female', 'Female');
    case 'O':
      return t('other', 'Other');
    case 'unknown':
      return t('unknown', 'Unknown');
    default:
      return gender;
  }
};

export default WardPatientGender;
