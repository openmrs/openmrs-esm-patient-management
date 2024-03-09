import React from 'react';
import styles from '../active-visits/active-visits-table.scss';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface QueueDurationProps {
  startedAt: Date;
  endedAt?: Date;
}

const QueueDuration: React.FC<QueueDurationProps> = ({ startedAt, endedAt = new Date() }) => {
  return <span className={styles.statusContainer}>{durationString(startedAt, endedAt)}</span>;
};

function durationString(startedAt: Date, endedAt: Date) {
  const { t } = useTranslation();
  const waitTimeMinutes = dayjs().diff(startedAt, 'minutes');
  const hours = waitTimeMinutes / 60;
  const fullHours = Math.floor(hours);
  const minutes = (hours - fullHours) * 60;
  const fullMinutes = Math.round(minutes);
  if (fullHours > 0) {
    return fullHours + ' ' + `${t('hoursAnd', 'hours and ')}` + fullMinutes + ' ' + `${t('minutes', 'minutes')}`;
  } else {
    return fullMinutes + ' ' + `${t('minutes', 'minutes')}`;
  }
}

export default QueueDuration;
