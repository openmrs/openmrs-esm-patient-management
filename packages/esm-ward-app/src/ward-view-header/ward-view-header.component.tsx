import React from 'react';
import styles from './ward-view-header.scss';
import WardMetrics from './ward-metrics.component';

interface WardViewHeaderProps {
  location: string;
}
const WardViewHeader: React.FC<WardViewHeaderProps> = ({ location }) => {
  return (
    <div className={styles.wardViewHeader}>
      <h4 className={styles.location}>{location}</h4>
      <WardMetrics />
    </div>
  );
};

export default WardViewHeader;
