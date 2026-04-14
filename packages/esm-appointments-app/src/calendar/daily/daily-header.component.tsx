import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../../constants';
import { setSelectedDate, useAppointmentsStore } from '../../store';
import styles from './daily-header.scss';

const DailyHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  const goToPrevDay = () => {
    setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format(omrsDateFormat));
  };

  const goToNextDay = () => {
    setSelectedDate(dayjs(selectedDate).add(1, 'day').format(omrsDateFormat));
  };

  return (
    <div className={styles.container}>
      <Button kind="tertiary" size="sm" onClick={goToPrevDay} aria-label={t('previousDay', 'Previous day')}>
        {t('prev', 'Prev')}
      </Button>
      <span className={styles.dateLabel}>
        {formatDate(new Date(selectedDate), { day: true, time: false, noToday: false })}
      </span>
      <Button kind="tertiary" size="sm" onClick={goToNextDay} aria-label={t('nextDay', 'Next day')}>
        {t('next', 'Next')}
      </Button>
    </div>
  );
};

export default DailyHeader;
