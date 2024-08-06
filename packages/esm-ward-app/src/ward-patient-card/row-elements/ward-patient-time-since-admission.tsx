import { age } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Encounter } from '../../types';

export interface WardPatientTimeSinceAdmissionProps {
  firstAdmissionOrTransferEncounter: Encounter;
}

const WardPatientTimeSinceAdmission: React.FC<WardPatientTimeSinceAdmissionProps> = ({
  firstAdmissionOrTransferEncounter,
}) => {
  const { t } = useTranslation();
  if (firstAdmissionOrTransferEncounter) {
    const timeSinceAdmission = age(firstAdmissionOrTransferEncounter.encounterDatetime);
    return <div>{t('timeSinceAdmission', 'Admitted: {{timeSinceAdmission}} ago', { timeSinceAdmission })}</div>;
  } else {
    return <></>;
  }
};

export default WardPatientTimeSinceAdmission;
