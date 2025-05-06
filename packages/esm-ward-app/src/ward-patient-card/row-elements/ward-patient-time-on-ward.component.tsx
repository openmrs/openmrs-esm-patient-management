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
  // TODO: Fix translations to use the correct pluralization.
  // Keys and strings extracted from translations below don't use the correct plural suffixes.
  if (days > 0) {
    parts.push(t('days', '{{count}} days', { count: days }));
  }
  if (hours > 0) {
    parts.push(t('hours', '{{count}} hours', { count: hours }));
  }
  if (minutes > 0) {
    parts.push(t('minutes', '{{count}} minutes', { count: minutes }));
  }
  if (seconds > 0 && parts.length === 0) {
    parts.push(t('seconds', '{{count}} seconds', { count: seconds }));
  }

  if (parts.length === 0) {
    return null;
  }

  return <div>{t('timeOnWard', 'Time on this ward: {{timeOnWard}}', { timeOnWard: parts.join(' ') })}</div>;
};

export default WardPatientTimeOnWard;
