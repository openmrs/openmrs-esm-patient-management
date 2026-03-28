import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { useAppointmentsStore } from '../../store';
import { type CalendarView } from '../appointments-calendar-view.component';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentView, onViewChange }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  const handleBack = () => {
    navigate({
      to: `${spaHomePage}/appointments/${dayjs(selectedDate).format('YYYY-MM-DD')}`,
    });
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
      </div>
      <ContentSwitcher
        size="md"
        onChange={({ name }) => onViewChange(name as CalendarView)}
        selectedIndex={currentView === 'monthly' ? 0 : currentView === 'weekly' ? 1 : 2}>
        <Switch name="monthly" text={t('monthly', 'Monthly')} />
        <Switch name="weekly" text={t('weekly', 'Weekly')} />
        <Switch name="daily" text={t('daily', 'Daily')} />
      </ContentSwitcher>
    </div>
  );
};

export default CalendarHeader;
