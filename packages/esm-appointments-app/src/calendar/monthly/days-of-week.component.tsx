import React from 'react';
import classNames from 'classnames';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useTranslation } from 'react-i18next';
import styles from './days-of-week.scss';
import { getLocale } from '@openmrs/esm-framework';

// Translations for the days of the week
// t('MON', 'MON');
// t('TUE', 'TUE');
// t('WED', 'WED');
// t('THUR', 'THUR');
// t('FRI', 'FRI');
// t('SAT', 'SAT');
// t('SUN', 'SUN');

interface DaysOfWeekProps {
  dayOfWeek: string;
}

const DaysOfWeekCard: React.FC<DaysOfWeekProps> = ({ dayOfWeek }) => {
  const { t } = useTranslation();
  const todayDate = today(getLocalTimeZone());
  const isToday =
    new Intl.DateTimeFormat(getLocale(), { weekday: 'short' })
      .format(todayDate.toDate(getLocalTimeZone()))
      .toUpperCase() === dayOfWeek;
  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={classNames({ [styles.bold]: isToday })}>{t(dayOfWeek)}</span>
    </div>
  );
};
export default DaysOfWeekCard;
