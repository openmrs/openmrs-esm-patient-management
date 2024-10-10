import { showNotification, useAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WardViewContext } from '../types';
import {
  getWardMetricNameTranslation,
  getWardMetrics,
  getWardMetricValueTranslation,
} from '../ward-view/ward-view.resource';
import WardMetric from './ward-metric.component';
import styles from './ward-metrics.scss';

const wardMetrics = [{ name: 'patients' }, { name: 'freeBeds' }, { name: 'capacity' }];

const WardMetrics = () => {
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { admissionLocationResponse, inpatientAdmissionResponse, inpatientRequestResponse, bedLayouts } =
    wardPatientGroupDetails || {};
  const { isLoading, error } = admissionLocationResponse ?? {};
  const isDataLoading =
    admissionLocationResponse?.isLoading ||
    inpatientAdmissionResponse?.isLoading ||
    inpatientRequestResponse?.isLoading;
  if (!wardPatientGroupDetails) return <></>;

  if (error) {
    showNotification({
      kind: 'error',
      title: t('errorLoadingBedDetails', 'Error loading bed details'),
      description: error.message,
    });
  }

  const wardMetricValues = getWardMetrics(bedLayouts, wardPatientGroupDetails);
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
              : getWardMetricValueTranslation(
                  'pendingOut',
                  t,
                  wardPatientGroupDetails?.wardPatientPendingCount?.toString(),
                )
          }
          isLoading={!!isDataLoading}
          key="pending"
        />
      )}
    </div>
  );
};

export default WardMetrics;
