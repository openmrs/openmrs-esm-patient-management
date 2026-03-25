import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft, Hospital } from '@carbon/react/icons';
import { isDesktop, navigate, useLayoutType } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { launchCreateAppointmentForm } from '../../helpers';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from './calendar-header.scss';

const CalendarHeader: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'md';

  const handleClick = () => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(selectedDate).format('YYYY-MM-DD')}` });
  };

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.titleContent}>
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
        {/* # Alphabase UI updates */}
        <div className={styles.actions}>
          <Button
            kind="primary"
            renderIcon={(props) => <Hospital size={32} {...props} />}
            size={responsiveSize}
            onClick={() => launchCreateAppointmentForm(t)}>
            {t('createNewAppointment', 'Create new appointment')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
