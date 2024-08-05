import { age } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientCardElement } from '../../types';
import { useTranslation } from 'react-i18next';

const WardPatientTimeOnWard: WardPatientCardElement = ({ encounterAssigningToCurrentInpatientLocation }) => {
  const { t } = useTranslation();
  if (encounterAssigningToCurrentInpatientLocation) {
    const timeOnWard = age(encounterAssigningToCurrentInpatientLocation.encounterDatetime);
    return <div>{t('timeOnWard', 'Time on this ward: {{timeOnWard}}', { timeOnWard })}</div>;
  } else {
    return <></>;
  }
};

export default WardPatientTimeOnWard;
