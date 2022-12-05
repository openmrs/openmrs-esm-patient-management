import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { ArrowRight, Filter } from '@carbon/react/icons';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  onChangeView: (CalendarView) => void;
  calendarView: string | any;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ onChangeView, calendarView }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.titleContainer}>
        <p>{t('calendar', 'Calendar')}</p>
        <Button size="md" kind="ghost" renderIcon={ArrowRight}>
          {t('addNewClinicDay', 'Add new clinic day')}
        </Button>
      </div>
      <div className={styles.titleContent}>
        <Button size="md" renderIcon={Filter} kind="ghost">
          {t('filter', 'Filter')}
        </Button>
        <ContentSwitcher
          selectedIndex={2}
          size="md"
          style={{ maxWidth: '30rem' }}
          onChange={({ name }) => onChangeView(name)}>
          <Switch name={'daily'} text={t('daily', 'Daily')} />
          <Switch name={'weekly'} text={t('weekly', 'Weekly')} />
          <Switch name={'monthly'} text={t('monthly', 'Monthly')} />
        </ContentSwitcher>
      </div>
    </div>
  );
};

export default CalendarHeader;
