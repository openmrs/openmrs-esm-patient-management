import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { parseDate, toCalendar, createCalendar, type Calendar } from '@internationalized/date';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { useAppointmentsStore } from '../../store';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  calendar: Calendar;
}
const CalendarHeader: React.FC<CalendarHeaderProps> = ({ calendar }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  const handleClick = () => {
    const date = toCalendar(parseDate(selectedDate), calendar);
    navigate({ to: `${spaHomePage}/appointments/${encodeURI(date.toString())}` });
  };

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.titleContainer}>
        <Button
          className={styles.backButton}
          iconDescription={t('back', 'Back')}
          kind="ghost"
          onClick={handleClick}
          renderIcon={ArrowLeft}
          size="lg">
          <span>{t('back', 'Back')}</span>
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
