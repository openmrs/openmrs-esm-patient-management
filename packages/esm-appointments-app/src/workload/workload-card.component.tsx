import React from 'react';
import classNames from 'classnames';
import styles from './workload.scss';

interface WorkloadCardProp {
  date: string;
  count: number;
  isActive: boolean;
}
const WorkloadCard: React.FC<WorkloadCardProp> = ({ date, count, isActive }) => {
  return (
    <div
      tabIndex={0}
      role="button"
      className={classNames(styles.tileContainer, {
        [styles.activeWorkloadCard]: isActive,
      })}>
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
