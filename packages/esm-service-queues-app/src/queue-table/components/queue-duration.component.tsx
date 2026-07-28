import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { formatDurationBetween } from '@openmrs/esm-framework';

interface QueueDurationProps {
  startedAt: Date;
  endedAt?: Date;
}

const QueueDuration: React.FC<QueueDurationProps> = ({ startedAt, endedAt }) => {
  return <DurationString startedAt={startedAt} endedAt={endedAt} />;
};

function DurationString({ startedAt, endedAt }: QueueDurationProps) {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const handle = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(handle);
  }, []);

  return (
    <span>
      {formatDurationBetween(startedAt, endedAt ?? currentTime.toDate(), {
        largestUnit: 'hour',
        smallestUnit: 'minute',
        formatOptions: { style: 'long', minutesDisplay: 'always' },
      })}
    </span>
  );
}

export default QueueDuration;
