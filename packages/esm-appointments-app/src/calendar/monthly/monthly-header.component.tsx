import React from 'react';
import { getCalendarFormat } from '../calendar-utils';
import styles from './monthly-header.scss';

interface MonthlyHeaderProps {}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = () => {
  const { locale, calendar } = getCalendarFormat();
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(1970, 0, 4 + i);
    return new Intl.DateTimeFormat(locale, { weekday: 'short', calendar }).format(d);
  });

  return (
    <div className={styles.workLoadCard}>
      {dayNames.map((label, i) => (
        <div key={i} className={styles.dowCell}>
          {label.toUpperCase()}
        </div>
      ))}
    </div>
  );
};

export default MonthlyHeader;
