import React, { useEffect, useState } from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(dayjs());

  // update currentTime every minute
  useEffect(() => {
    const handle = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(handle);
  }, []);

  const totalMinutes = currentTime.diff(dayjs(queueEntry.startedAt), 'minutes');
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.trunc(totalMinutes % 60);

  const text =
    hours > 0
      ? t('hourAndMinuteFormatted', '{{hours}} hour(s) and {{minutes}} minute(s)', { hours, minutes })
      : t('minuteFormatted', '{{minutes}} minute(s)', { minutes });

  return <>{text}</>;
};

export const queueTableWaitTimeColumn: QueueTableColumn = {
  headerI18nKey: 'waitTime',
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
};
