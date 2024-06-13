import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatientCardElement } from '../../types';

const WardPatientAge: WardPatientCardElement = ({ patient }) => {
  const { t } = useTranslation();
  // TODO: BED-10
  // make the backend return patient.person.birthdate so we can use the age() function to calculate age
  return (
    <div>
      {t('yearsOld', '{{age}} yrs', {
        age: patient?.person?.age,
      })}
    </div>
  );
};

export default WardPatientAge;
