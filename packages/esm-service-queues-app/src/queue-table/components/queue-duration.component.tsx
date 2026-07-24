import React, { useEffect, useState } from 'react';
import { type TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface QueueDurationProps {
  startedAt: Date;
  endedAt?: Date;
}

export function getWaitTimeInMinutes(startedAt: Date, endedAt: Date | undefined, now: Date): number {
  const referenceTime = endedAt ? dayjs(endedAt) : dayjs(now);
  return Math.max(0, referenceTime.diff(startedAt, 'minutes'));
}

export function formatDuration(t: TFunction, totalMinutes: number): string {
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.trunc(totalMinutes % 60);
  const formattedMinutes = t('queueDurationMinutes', {
    count: minutes,
    defaultValue_one: '{{count}} minute',
    defaultValue_other: '{{count}} minutes',
  });

  if (hours === 0) {
    return formattedMinutes;
  }

  return t('queueDurationHoursAndMinutes', '{{hours}} and {{minutes}}', {
    hours: t('queueDurationHours', {
      count: hours,
      defaultValue_one: '{{count}} hour',
      defaultValue_other: '{{count}} hours',
    }),
    minutes: formattedMinutes,
  });
}

const QueueDuration: React.FC<QueueDurationProps> = ({ startedAt, endedAt }) => {
  return <DurationString startedAt={startedAt} endedAt={endedAt} />;
};

function DurationString({ startedAt, endedAt }: QueueDurationProps) {
  const { t } = useTranslation();

  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const handle = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(handle);
  }, []);

  const totalMinutes = getWaitTimeInMinutes(startedAt, endedAt, currentTime.toDate());

  return <span>{formatDuration(t, totalMinutes)}</span>;
}

export default QueueDuration;
