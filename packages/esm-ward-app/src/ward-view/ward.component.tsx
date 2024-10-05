import { InlineNotification } from '@carbon/react';
import { useAppContext, useFeatureFlag } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { type ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import useWardLocation from '../hooks/useWardLocation';
import { type WardPatientGroupDetails } from '../types';
import styles from './ward-view.scss';

const Ward = ({ wardBeds, wardUnassignedPatients }: { wardBeds: ReactNode; wardUnassignedPatients: ReactNode }) => {
  const { location } = useWardLocation();
  const { t } = useTranslation();
  const isVertical = useFeatureFlag('ward-view-vertical-tiling');

  const wardPatientsGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { bedLayouts } = wardPatientsGrouping ?? {};
  const { isLoading: isLoadingAdmissionLocation, error: errorLoadingAdmissionLocation } =
    wardPatientsGrouping?.admissionLocationResponse ?? {};
  const {
    isLoading: isLoadingInpatientAdmissions,
    error: errorLoadingInpatientAdmissions,
    hasMore: hasMoreInpatientAdmissions,
    loadMore: loadMoreInpatientAdmissions,
  } = wardPatientsGrouping?.inpatientAdmissionResponse ?? {};
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  const scrollToLoadMoreTrigger = useRef<HTMLDivElement>(null);
  useEffect(
    function scrollToLoadMore() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (hasMoreInpatientAdmissions && !errorLoadingInpatientAdmissions && !isLoadingInpatientAdmissions) {
                loadMoreInpatientAdmissions();
              }
            }
          });
        },
        { threshold: 1 },
      );

      if (scrollToLoadMoreTrigger.current) {
        observer.observe(scrollToLoadMoreTrigger.current);
      }
      return () => {
        if (scrollToLoadMoreTrigger.current) {
          observer.unobserve(scrollToLoadMoreTrigger.current);
        }
      };
    },
    [scrollToLoadMoreTrigger, hasMoreInpatientAdmissions, errorLoadingInpatientAdmissions, loadMoreInpatientAdmissions],
  );

  if (!wardPatientsGrouping) return <></>;

  return (
    <div className={classNames(styles.wardViewMain, { [styles.verticalTiling]: isVertical })}>
      {wardBeds}
      {bedLayouts?.length == 0 && isBedManagementModuleInstalled && (
        <InlineNotification
          kind="warning"
          lowContrast={true}
          title={t('noBedsConfigured', 'No beds configured for this location')}
        />
      )}
      {wardUnassignedPatients}
      {(isLoadingAdmissionLocation || isLoadingInpatientAdmissions) && <EmptyBeds />}
      {errorLoadingAdmissionLocation && (
        <InlineNotification
          kind="error"
          lowContrast={true}
          title={t('errorLoadingWardLocation', 'Error loading ward location')}
          subtitle={
            errorLoadingAdmissionLocation?.message ??
            t('invalidWardLocation', 'Invalid ward location: {{location}}', { location: location.display })
          }
        />
      )}
      {errorLoadingInpatientAdmissions && (
        <InlineNotification
          kind="error"
          lowContrast={true}
          title={t('errorLoadingPatients', 'Error loading admitted patients')}
          subtitle={errorLoadingInpatientAdmissions?.message}
        />
      )}
      <div ref={scrollToLoadMoreTrigger}></div>
    </div>
  );
};

const EmptyBeds = () => {
  return (
    <>
      {Array(20)
        .fill(0)
        .map((_, i) => (
          <EmptyBedSkeleton key={i} />
        ))}
    </>
  );
};

export default Ward;
