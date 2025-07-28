import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import { type Encounter } from '../../types';

dayjs.extend(duration);
dayjs.extend(relativeTime);

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

  const timeSinceAdmission = dayjs(firstAdmissionOrTransferEncounter.encounterDatetime).fromNow();

  return <div>{t('timeSinceAdmission', 'Admitted: {{timeSinceAdmission}}', { timeSinceAdmission })}</div>;
};

export default WardPatientTimeSinceAdmission;
