import React from 'react';
import { LOCALE_MAP, CALENDAR_OPTIONS } from '../calendar-utils';
import styles from './monthly-header.scss';

interface MonthlyHeaderProps {
  calKey?: string;
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({ calKey = 'gregory' }) => {
  const locale = LOCALE_MAP[calKey] ?? 'en-US';
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(1970, 0, 4 + i);
    return new Intl.DateTimeFormat(locale, { weekday: 'short', calendar: calKey }).format(d);
  });

  return (
    <div className={styles.workLoadCard}>
      {dayNames.map((label, i) => (
        <div key={i} className={styles.dowCell}>
          {label}
        </div>
      ))}
    </div>
  );
};

export default MonthlyHeader;
