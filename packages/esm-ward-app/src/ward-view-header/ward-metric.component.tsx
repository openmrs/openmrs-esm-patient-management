import React from 'react';
import styles from './ward-metric.scss';
import { SkeletonPlaceholder } from '@carbon/react';
import {useTranslation } from 'react-i18next';
import classNames from 'classnames';

interface WardMetricProps {
  metricName: string;
  metricValue: string;
  isLoading: boolean;
}
const WardMetric: React.FC<WardMetricProps> = ({ metricName, metricValue, isLoading }) => {
  const { i18n } = useTranslation();
   const isLtr=i18n.dir()=="ltr";
   const field1=isLtr?metricName:metricValue;
   const field2=isLtr?metricValue:metricName;
  return (
    <div className={styles.metric}>
     <span className={
        classNames({[styles.metricName]:isLtr,[styles.metricValue]:!isLtr})}>{field1}</span>
      {isLoading ? (
        <SkeletonPlaceholder className={styles.skeleton} />
      ) : (
        <span className={classNames({[styles.metricValue]:isLtr,[styles.metricName]:!isLtr})}>{field2}</span>
      )}
    </div>
  );
};

export default WardMetric;
