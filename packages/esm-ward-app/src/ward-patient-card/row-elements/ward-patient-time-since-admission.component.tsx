import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDurationBetween } from '@openmrs/esm-framework';
import { type Encounter } from '../../types';

export interface WardPatientTimeSinceAdmissionProps {
  firstAdmissionOrTransferEncounter: Encounter;
}

const WardPatientTimeSinceAdmission: React.FC<WardPatientTimeSinceAdmissionProps> = ({
  firstAdmissionOrTransferEncounter,
}) => {
  const { t } = useTranslation();

  if (!firstAdmissionOrTransferEncounter) {
    return null;
  }

  const timeSinceAdmission = formatDurationBetween(firstAdmissionOrTransferEncounter.encounterDatetime, undefined, {
    formatOptions: { style: 'long' },
  });

  return <div>{t('timeSinceAdmission', 'Time since admission: {{timeSinceAdmission}}', { timeSinceAdmission })}</div>;
};

export default WardPatientTimeSinceAdmission;
