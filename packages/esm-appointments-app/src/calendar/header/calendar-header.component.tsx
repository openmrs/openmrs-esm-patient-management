import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { useAppointmentsStore } from '../../store';
import type { CalendarViewMode } from '../appointments-calendar-view.component';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ viewMode, onViewModeChange }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  const handleBackClick = () => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(selectedDate).format('YYYY-MM-DD')}` });
  };

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.titleContainer}>
        <Button
          className={styles.backButton}
          iconDescription={t('back', 'Back')}
          kind="ghost"
          onClick={handleBackClick}
          renderIcon={ArrowLeft}
          size="lg">
          <span>{t('back', 'Back')}</span>
        </Button>
        <div className={styles.viewSwitcher}>
          <Button
            kind={viewMode === 'monthly' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => onViewModeChange('monthly')}>
            {t('month', 'Month')}
          </Button>
          <Button
            kind={viewMode === 'weekly' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => onViewModeChange('weekly')}>
            {t('week', 'Week')}
          </Button>
          <Button
            kind={viewMode === 'daily' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => onViewModeChange('daily')}>
            {t('day', 'Day')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
