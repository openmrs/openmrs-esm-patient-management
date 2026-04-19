import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import { useAppointmentsStore, type CalendarView } from '../../store';
import styles from './calendar-header.scss';

const CalendarHeader: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const { calendarView, setCalendarView } = useAppointmentsStore();

  const handleBack = () => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(selectedDate).format('YYYY-MM-DD')}` });
  };

  const views: CalendarView[] = ['monthly', 'weekly', 'daily'];
  const viewIndex = views.indexOf(calendarView);

  const handleViewChange = ({ index }: { index: number }) => {
    setCalendarView(views[index]);
  };

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.titleContainer}>
        <Button
          className={styles.backButton}
          iconDescription={t('back', 'Back')}
          kind="ghost"
          onClick={handleBack}
          renderIcon={ArrowLeft}
          size="lg">
          <span>{t('back', 'Back')}</span>
        </Button>
        <ContentSwitcher selectedIndex={viewIndex} onChange={handleViewChange} size="sm">
          <Switch name="monthly" text={t('monthly', 'Monthly')} />
          <Switch name="weekly" text={t('weekly', 'Weekly')} />
          <Switch name="daily" text={t('daily', 'Daily')} />
        </ContentSwitcher>
      </div>
    </div>
  );
};

export default CalendarHeader;
