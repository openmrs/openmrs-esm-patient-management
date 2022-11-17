import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DaysOfweek.scss';

interface DaysOfWeekProp {
  dayOfWeek: string;
}
const DaysOfWeekCard: React.FC<DaysOfWeekProp> = ({ dayOfWeek }) => {
  const { t } = useTranslation();
  return (
    <div tabIndex={0} role="button" className={`${styles.tileContainer} `}>
      <div className={styles.tileHeader}>
        <label className={styles.headerLabel}>{dayOfWeek}</label>
      </div>
    </div>
  );
};
export default DaysOfWeekCard;
