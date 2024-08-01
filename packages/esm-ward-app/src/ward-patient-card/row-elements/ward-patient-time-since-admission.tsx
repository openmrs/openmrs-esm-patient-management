import { age } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientCardElement } from '../../types';
import { useTranslation } from 'react-i18next';

const WardPatientTimeSinceAdmission: WardPatientCardElement = ({ firstAdmissionOrTransferEncounter }) => {
  const { t } = useTranslation();
  if (firstAdmissionOrTransferEncounter) {
    const timeSinceAdmission = age(firstAdmissionOrTransferEncounter.encounterDatetime);
    return <div>{t('timeSinceAdmission', 'Admited: {{timeSinceAdmission}} ago', { timeSinceAdmission })}</div>;
  } else {
    return <></>;
  }
};

export default WardPatientTimeSinceAdmission;
