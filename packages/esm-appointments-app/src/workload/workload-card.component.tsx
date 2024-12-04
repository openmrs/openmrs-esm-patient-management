import React from 'react';
import classNames from 'classnames';
import styles from './workload.scss';

interface WorkloadCardProps {
  count: number;
  day: string;
  date: string;
  isActive: boolean;
}

const WorkloadCard = ({ count, day, date, isActive }: WorkloadCardProps) => {
  return (
    <div
      tabIndex={0}
      role="button"
      className={classNames(styles.tileContainer, {
        [styles.activeWorkloadCard]: isActive,
      })}>
      <div>
        <label className={styles.dayLabel}>{day}</label>
      </div>
      <div>
        <label className={styles.headerLabel}>{date}</label>
      </div>
      <div>
        <label className={styles.totalsLabel}>{count}</label>
      </div>
    </div>
  );
};

export default WorkloadCard;
