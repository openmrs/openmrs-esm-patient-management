import React, { useCallback, useContext } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../../constants';
import DaysOfWeekCard from './days-of-week.component';
import SelectedDateContext from '../../hooks/selectedDateContext';
import styles from './monthly-header.scss';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const MonthlyHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);

  const handleSelectPrevMonth = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).subtract(1, 'month').format(omrsDateFormat));
  }, [selectedDate, setSelectedDate]);

  const handleSelectNextMonth = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).add(1, 'month').format(omrsDateFormat));
  }, [selectedDate, setSelectedDate]);

  return (
    <>
      <div className={styles.container}>
        <Button
          aria-label={t('previousMonth', 'Previous month')}
          kind="tertiary"
          onClick={handleSelectPrevMonth}
          size="sm">
          {t('prev', 'Prev')}
        </Button>
        <span>{formatDate(new Date(selectedDate), { day: false, time: false, noToday: true })}</span>
        <Button aria-label={t('nextMonth', 'Next month')} kind="tertiary" onClick={handleSelectNextMonth} size="sm">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.workLoadCard}>
        {DAYS_IN_WEEK.map((day) => (
          <DaysOfWeekCard key={day} dayOfWeek={day} />
        ))}
      </div>
    </>
  );
};

export default MonthlyHeader;
