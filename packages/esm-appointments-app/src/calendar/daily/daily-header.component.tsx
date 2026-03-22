import { Button } from '@carbon/react';
import { formatDate, navigate } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { spaHomePage } from '../../constants';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from './daily-header.scss';

const DailyHeader: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();

  const goToPrevDay = () => {
    navigate({
      to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD')}`,
    });
  };

  const goToNextDay = () => {
    navigate({ to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD')}` });
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
