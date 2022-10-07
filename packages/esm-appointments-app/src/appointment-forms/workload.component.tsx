import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './workload.scss';

interface WorkloadCardProp {
  date: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}
const WorkloadCard: React.FC<WorkloadCardProp> = ({ date, count, isActive, onClick }) => {
  const { t } = useTranslation();
  return (
    <div
      tabIndex={0}
      role="button"
      onClick={onClick}
      className={`${styles.tileContainer}  ${isActive && styles.activeWorkloadCard}`}>
      <div className={styles.tileHeader}>
        <label className={styles.headerLabel}>{date}</label>
      </div>
      <div>
        <label className={styles.totalsLabel}>{count}</label>
      </div>
    </div>
  );
};
export default WorkloadCard;
