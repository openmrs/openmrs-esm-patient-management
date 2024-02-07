import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaBasePath } from '../../constants';
import type { CalendarType } from '../../types';
import styles from './calendar-header.scss';

enum CalendarView {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

interface CalendarHeaderProps {
  onChangeView: (view: CalendarView) => void;
  calendarView: CalendarType;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ onChangeView }) => {
  const { t } = useTranslation();
  const backButtonOnClick = () => {
    navigate({ to: `${spaBasePath}/appointments` });
  };

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.titleContainer}>
        <Button
          kind="ghost"
          onClick={backButtonOnClick}
          renderIcon={ArrowLeft}
          iconDescription={t('back', 'Back')}
          size="lg">
          <span>{t('back', 'Back')}</span>
        </Button>
        <p>{t('calendar', 'Calendar')}</p>
      </div>
      <div className={styles.titleContent}>
        <ContentSwitcher
          selectedIndex={2}
          size="md"
          style={{ maxWidth: '30rem' }}
          onChange={({ name }) => onChangeView(name as CalendarView)}>
          <Switch name={CalendarView.Daily} text={t('daily', 'Daily')} />
          <Switch name={CalendarView.Weekly} text={t('weekly', 'Weekly')} />
          <Switch name={CalendarView.Monthly} text={t('monthly', 'Monthly')} />
        </ContentSwitcher>
      </div>
    </div>
  );
};

export default CalendarHeader;
