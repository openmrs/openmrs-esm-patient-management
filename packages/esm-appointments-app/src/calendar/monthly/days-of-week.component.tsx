import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import styles from './days-of-week.scss';

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
  const isToday = dayjs(new Date()).format('ddd').toUpperCase() === dayOfWeek;
  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={classNames({ [styles.bold]: isToday })}>{t(dayOfWeek)}</span>
    </div>
  );
};
export default DaysOfWeekCard;
