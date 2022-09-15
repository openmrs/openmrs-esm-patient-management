import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './workload.scss';

interface WorkloadCardProp {
  date: string;
  count: number;
  isActive: boolean;
  onDateSelected: (selectedDate: string) => void;
}
const WorkloadCard: React.FC<WorkloadCardProp> = ({ date, count, isActive, onDateSelected }) => {
  const { t } = useTranslation();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDateSelected(date)}
      className={`${styles.tileContainer}  ${isActive && styles.activeWorkloadCard}`}>
      <div className={styles.tileHeader}>
        <label className={styles.headerLabel}>{dayjs(date).format('DD/MM')}</label>
      </div>
      <div>
        <label className={styles.totalsLabel}>{count}</label>
      </div>
    </div>
  );
};
export default WorkloadCard;
