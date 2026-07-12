import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { type WaitTimeThresholdConfig } from '../../config-schema';
import styles from './queue-duration.scss';

interface QueueDurationProps {
  startedAt: Date;
  endedAt?: Date;
  thresholds?: WaitTimeThresholdConfig[];
}

const QueueDuration: React.FC<QueueDurationProps> = ({ startedAt, endedAt, thresholds }) => {
  return <DurationString startedAt={startedAt} endedAt={endedAt} thresholds={thresholds} />;
};

// Returns the color of the highest threshold whose waitTimeInMinutes has been reached, or undefined if none apply.
function getWaitTimeColor(totalMinutes: number, thresholds: WaitTimeThresholdConfig[] = []) {
  return thresholds
    .filter((threshold) => totalMinutes >= threshold.waitTimeInMinutes)
    .sort((a, b) => b.waitTimeInMinutes - a.waitTimeInMinutes)[0]?.color;
}

function DurationString({ startedAt, endedAt, thresholds }: QueueDurationProps) {
  const { t } = useTranslation();

  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const handle = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(handle);
  }, []);

  const referenceTime = endedAt ? dayjs(endedAt) : currentTime;
  const totalMinutes = Math.max(0, referenceTime.diff(startedAt, 'minutes'));
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.trunc(totalMinutes % 60);

  const color = getWaitTimeColor(totalMinutes, thresholds);

  return (
    <span className={classNames(color && styles[color])}>
      {hours > 0
        ? t('hourAndMinuteFormatted', '{{hours}} hour(s) and {{minutes}} minute(s)', {
            hours,
            minutes,
          })
        : t('minuteFormatted', '{{minutes}} minute(s)', { minutes })}
    </span>
  );
}

export default QueueDuration;
