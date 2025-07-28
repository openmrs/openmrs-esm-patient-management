import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'react-i18next';
import { type Encounter } from '@openmrs/esm-framework';

dayjs.extend(duration);

export interface WardPatientTimeOnWardProps {
  encounterAssigningToCurrentInpatientLocation: Encounter;
}

const WardPatientTimeOnWard: React.FC<WardPatientTimeOnWardProps> = ({
  encounterAssigningToCurrentInpatientLocation,
}) => {
  const { t } = useTranslation();

  if (!encounterAssigningToCurrentInpatientLocation?.encounterDatetime) {
    return null;
  }

  const dur = dayjs.duration(dayjs().diff(encounterAssigningToCurrentInpatientLocation.encounterDatetime));
  const days = Math.floor(dur.asDays());
  const hours = dur.hours();
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  const parts = [];

  if (days > 0) {
    parts.push(
      t('days', {
        count: days,
        defaultValue_one: '{{count}} day',
        defaultValue_other: '{{count}} days',
      }),
    );
  }
  if (hours > 0) {
    parts.push(
      t('hours', {
        count: hours,
        defaultValue_one: '{{count}} hour',
        defaultValue_other: '{{count}} hours',
      }),
    );
  }
  if (minutes > 0) {
    parts.push(
      t('minutes', {
        count: minutes,
        defaultValue_one: '{{count}} minute',
        defaultValue_other: '{{count}} minutes',
      }),
    );
  }
  if (seconds > 0 && parts.length === 0) {
    parts.push(
      t('seconds', {
        count: seconds,
        defaultValue_one: '{{count}} second',
        defaultValue_other: '{{count}} seconds',
      }),
    );
  }

  if (parts.length === 0) {
    return null;
  }

  return <div>{t('timeOnWard', 'Time on this ward: {{timeOnWard}}', { timeOnWard: parts.join(' ') })}</div>;
};

export default WardPatientTimeOnWard;
