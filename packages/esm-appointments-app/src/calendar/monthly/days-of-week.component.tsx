import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import styles from './days-of-week.scss';

// Translations for the days of the week
// t('MON', 'MON');
// t('TUE', 'TUE');
// t('WED', 'WED');
// t('THU', 'THU');
// t('FRI', 'FRI');
// t('SAT', 'SAT');
// t('SUN', 'SUN');

interface DaysOfWeekProps {
  dayOfWeek: string;
}

/* Static reference for mapping weekday labels to index positions */
const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DaysOfWeekCard: React.FC<DaysOfWeekProps> = ({ dayOfWeek }) => {
  /* Enable translation for weekday labels */
  const { t } = useTranslation();

  /* Get today's index (0–6) for comparison */
  const todayIndex = dayjs().day(); // 0 = Sunday

  /* Resolve index of current day label */
  const currentIndex = DAYS_IN_WEEK.indexOf(dayOfWeek);

  /* Determine if this card represents today */
  const isToday = todayIndex === currentIndex;

  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={classNames({ [styles.bold]: isToday })}>{t(dayOfWeek)}</span>
    </div>
  );
};

export default DaysOfWeekCard;
