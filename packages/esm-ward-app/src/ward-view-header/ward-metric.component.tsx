import React from 'react';
import styles from './ward-metric.scss';
import { SkeletonPlaceholder } from '@carbon/react';

interface WardMetricProps {
  metricName: string;
  metricValue: string;
  isLoading: boolean;
}
const WardMetric: React.FC<WardMetricProps> = ({ metricName, metricValue, isLoading }) => {
  return (
    <div className={styles.metric}>
      <span className={styles.metricName}>{metricName}</span>
      {isLoading ? (
        <SkeletonPlaceholder className={styles.skeleton} />
      ) : (
        <span className={styles.metricValue}>{metricValue}</span>
      )}
    </div>
  );
};

export default WardMetric;
