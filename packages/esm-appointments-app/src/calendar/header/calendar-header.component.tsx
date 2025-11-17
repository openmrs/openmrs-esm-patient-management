import React from 'react';
import { parseDate, toCalendar, createCalendar } from '@internationalized/date';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { getDefaultCalendar, getLocale, navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { useAppointmentsStore } from '../../store';
import styles from './calendar-header.scss';

const CalendarHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  const handleClick = () => {
    const date = toCalendar(parseDate(selectedDate), createCalendar(getDefaultCalendar(getLocale())));
    navigate({ to: `${spaHomePage}/appointments/${date.toString()}` });
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
