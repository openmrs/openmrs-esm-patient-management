import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@openmrs/esm-framework';
import { type Encounter } from '../../types';

dayjs.extend(duration);

const relativeTimeUnits: Array<Intl.RelativeTimeFormatUnit> = ['year', 'month', 'week', 'day', 'hour', 'minute'];

/**
 * Formats how long ago a date was (e.g. "2 hours ago") in the session locale. The ward app's own
 * dayjs has no locale loaded, so its `fromNow()` always reads in English.
 */
export function formatTimeAgo(date: dayjs.ConfigType, now: dayjs.ConfigType = dayjs()) {
  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
  const then = dayjs(date);
  for (const unit of relativeTimeUnits) {
    const diff = then.diff(now, unit);
    if (diff !== 0) {
      return rtf.format(diff, unit);
    }
  }
  return rtf.format(then.diff(now, 'second'), 'second');
}

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

  const timeSinceAdmission = formatTimeAgo(firstAdmissionOrTransferEncounter.encounterDatetime);

  return <div>{t('timeSinceAdmission', 'Admitted: {{timeSinceAdmission}}', { timeSinceAdmission })}</div>;
};

export default WardPatientTimeSinceAdmission;
