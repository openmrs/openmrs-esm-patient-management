import React from 'react';
import styles from './ward-metric.scss';
import { SkeletonPlaceholder } from '@carbon/react';
import {useTranslation } from 'react-i18next';

interface WardMetricProps {
  metricName: string;
  metricValue: string;
  isLoading: boolean;
}
const WardMetric: React.FC<WardMetricProps> = ({ metricName, metricValue, isLoading }) => {
  const { i18n } = useTranslation();
   const dir=i18n.dir?i18n.dir():"ltr";
   const field1=dir=="ltr"?metricName:metricValue;
   const field2=dir=="ltr"?metricValue:metricName;
  return (
    <div className={styles.metric}>
      <span>{dir}</span>
      <span className={styles.metricName}>{field1}</span>
      {isLoading ? (
        <SkeletonPlaceholder className={styles.skeleton} />
      ) : (
        <span className={styles.metricValue}>{field2}</span>
      )}
    </div>
  );
};

export default WardMetric;
