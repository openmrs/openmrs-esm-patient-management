import React from 'react';
import styles from './ward-metrics.scss';
import { useBeds } from '../hooks/useBeds';
import { showNotification, useAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import {
  getWardMetricNameTranslation,
  getWardMetrics,
  getWardMetricValueTranslation,
} from '../ward-view/ward-view.resource';
import WardMetric from './ward-metric.component';
import type { WardPatientGroupDetails } from '../types';
import useWardLocation from '../hooks/useWardLocation';

const wardMetrics = [{ name: 'patients' }, { name: 'freeBeds' }, { name: 'capacity' }];

const WardMetrics = () => {
  const { location } = useWardLocation();
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const wardPatientGroup = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { admissionLocationResponse, inpatientAdmissionResponse, inpatientRequestResponse, bedLayouts } =
    wardPatientGroup || {};
  const { isLoading, error } = admissionLocationResponse ?? {};
  const isDataLoading =
    admissionLocationResponse?.isLoading ||
    inpatientAdmissionResponse?.isLoading ||
    inpatientRequestResponse?.isLoading;
  if (!wardPatientGroup) return <></>;

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error loading bed details'),
      description: error.message,
    });
  }

  const wardMetricValues = getWardMetrics(bedLayouts, wardPatientGroup);
  return (
    <div className={styles.metricsContainer}>
      {isBedManagementModuleInstalled ? (
        wardMetrics.map((wardMetric) => {
          return (
            <WardMetric
              metricName={getWardMetricNameTranslation(wardMetric.name, t)}
              metricValue={getWardMetricValueTranslation(wardMetric.name, t, wardMetricValues[wardMetric.name])}
              isLoading={!!isLoading || !!isDataLoading}
              key={wardMetric.name}
            />
          );
        })
      ) : (
        <WardMetric
          metricName={getWardMetricNameTranslation('patients', t)}
          metricValue={'--'}
          isLoading={false}
          key={'patients'}
        />
      )}
      {isBedManagementModuleInstalled && (
        <WardMetric
          metricName={getWardMetricNameTranslation('pendingOut', t)}
          metricValue={
            error
              ? '--'
              : getWardMetricValueTranslation('pendingOut', t, wardPatientGroup?.wardPatientPendingCount?.toString())
          }
          isLoading={!!isDataLoading}
          key="pending"
        />
      )}
    </div>
  );
};

export default WardMetrics;
