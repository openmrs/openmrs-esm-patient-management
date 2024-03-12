import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import styles from './calendar-header.scss';
import SelectedDateContext from '../../hooks/selectedDateContext';
import dayjs from 'dayjs';

const CalendarHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useContext(SelectedDateContext);
  const backButtonOnClick = () => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(selectedDate).format('YYYY-MM-DD')}` });
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
      </div>
    </div>
  );
};

export default CalendarHeader;
