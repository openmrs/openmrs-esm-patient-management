import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatientCardBentoElement } from '../../types';

const WardPatientAge: WardPatientCardBentoElement = ({ patient }) => {
  const { t } = useTranslation();
  return (
    <div>
      {t('yearsOld', '{{age}} yrs', {
        age: patient?.person?.age,
      })}
    </div>
  );
};

export default WardPatientAge;
