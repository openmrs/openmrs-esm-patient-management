import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface QueueDurationProps {
  startedAt: Date;
  endedAt?: Date;
}

const QueueDuration: React.FC<QueueDurationProps> = ({ startedAt, endedAt }) => {
  return <DurationString startedAt={startedAt} endedAt={endedAt} />;
};

function DurationString({ startedAt, endedAt }: { startedAt: Date; endedAt: Date }) {
  const { t } = useTranslation();

  const endedTime = endedAt ? dayjs(endedAt) : dayjs();
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const handle = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(handle);
  }, []);

  const totalMinutes = dayjs(endedTime ?? currentTime).diff(startedAt, 'minutes');
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.trunc(totalMinutes % 60);

  return (
    <span>
      {Math.abs(hours) > 0
        ? t('hourAndMinuteFormatted', '{{hours}} hour(s) and {{minutes}} minute(s)', {
            hours,
            minutes: Math.abs(minutes),
          })
        : t('minuteFormatted', '{{minutes}} minute(s)', { minutes })}
    </span>
  );
}

export default QueueDuration;
