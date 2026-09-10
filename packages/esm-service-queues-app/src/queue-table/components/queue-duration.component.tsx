import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { formatDurationBetween } from '@openmrs/esm-framework';
import { useCurrentTime } from '../../hooks/useCurrentTime';
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
  const currentTime = useCurrentTime();

  const referenceTime = endedAt ?? currentTime;
  const color = getWaitTimeColor(dayjs(referenceTime).diff(startedAt, 'minutes'), thresholds);

  return (
    <span className={classNames(color && styles[color])}>
      {formatDurationBetween(startedAt, referenceTime, {
        largestUnit: 'day',
        smallestUnit: 'minute',
        formatOptions: { style: 'long', minutesDisplay: 'always' },
      })}
    </span>
  );
}

export default QueueDuration;
