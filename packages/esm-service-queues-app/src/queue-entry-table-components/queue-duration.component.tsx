import React, { useEffect, useState } from 'react';
import styles from '../active-visits/active-visits-table.scss';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface QueueDurationProps {
  startedAt: Date;
  endedAt?: Date;
}

const QueueDuration: React.FC<QueueDurationProps> = ({ startedAt, endedAt }) => {
  return <span className={styles.statusContainer}>{durationString(startedAt, endedAt)}</span>;
};

function durationString(startedAt: Date, endedAt: Date) {
  const { t } = useTranslation();

  const endedTime = endedAt ? dayjs(endedAt) : dayjs();
  const [currentTime, setCurrentTime] = useState(dayjs());

  // update currentTime every minute if there is no fixed endedTime
  useEffect(() => {
    const handle = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(handle);
  }, []);

  const totalMinutes = dayjs(endedTime ?? currentTime).diff(startedAt, 'minutes');
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.trunc(totalMinutes % 60);

  return hours > 0
    ? t('hourAndMinuteFormatted', '{{hours}} hour(s) and {{minutes}} minute(s)', { hours, minutes })
    : t('minuteFormatted', '{{minutes}} minute(s)', { minutes });
}

export default QueueDuration;
