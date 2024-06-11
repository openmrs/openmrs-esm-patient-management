import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatientCardBentoElement } from '../../types';

const WardPatientAge: WardPatientCardBentoElement = ({ patient }) => {
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
