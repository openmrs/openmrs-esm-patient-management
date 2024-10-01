import { InlineNotification } from '@carbon/react';
import { useAppContext, useDefineAppContext, useFeatureFlag, WorkspaceContainer } from '@openmrs/esm-framework';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import UnassignedPatient from '../beds/unassigned-patient.component';
import useWardLocation from '../hooks/useWardLocation';
import { useWardPatientGrouping } from '../hooks/useWardPatientGrouping';
import { type WardPatient, type WardPatientGroupDetails } from '../types';
import WardViewHeader from '../ward-view-header/ward-view-header.component';
import WardBed from './ward-bed.component';
import { bedLayoutToBed } from './ward-view.resource';
import styles from './ward-view.scss';
import classNames from 'classnames';

const WardView = () => {
  const response = useWardLocation();
  const { isLoadingLocation, invalidLocation } = response;
  const { t } = useTranslation();

  const wardPatientsGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardPatientGroupDetails>('ward-patients-group', wardPatientsGroupDetails);
  const isVertical = useFeatureFlag('ward-view-vertical-tiling');

  if (isLoadingLocation) {
    return <></>;
  }

  if (invalidLocation) {
    return <InlineNotification kind="error" title={t('invalidLocationSpecified', 'Invalid location specified')} />;
  }

  return (
    <>
      <div className={classNames(styles.wardView, { [styles.verticalTiling]: isVertical })}>
        <WardViewHeader />
        <WardViewMain />
      </div>
      <WorkspaceContainer overlay contextKey="ward" />
    </>
  );
};

const WardViewMain = () => {
  const { location } = useWardLocation();
  const { t } = useTranslation();
  const isVertical = useFeatureFlag('ward-view-vertical-tiling');

  const wardPatientsGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { bedLayouts, wardAdmittedPatientsWithBed, wardUnassignedPatientsList } = wardPatientsGrouping ?? {};
  const { isLoading: isLoadingAdmissionLocation, error: errorLoadingAdmissionLocation } =
    wardPatientsGrouping?.admissionLocationResponse ?? {};
  const {
    isLoading: isLoadingInpatientAdmissions,
    error: errorLoadingInpatientAdmissions,
    hasMore: hasMoreInpatientAdmissions,
    loadMore: loadMoreInpatientAdmissions,
  } = wardPatientsGrouping?.inpatientAdmissionResponse ?? {};

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

  const wardBeds = bedLayouts?.map((bedLayout) => {
    const { patients } = bedLayout;
    const bed = bedLayoutToBed(bedLayout);
    const wardPatients: WardPatient[] = patients.map((patient): WardPatient => {
      const inpatientAdmission = wardAdmittedPatientsWithBed.get(patient.uuid);
      if (inpatientAdmission) {
        const { patient, visit, currentInpatientRequest } = inpatientAdmission;
        return { patient, visit, bed, inpatientAdmission, inpatientRequest: currentInpatientRequest || null };
      } else {
        // for some reason this patient is in a bed but not in the list of admitted patients, so we need to use the patient data from the bed endpoint
        return {
          patient: patient,
          visit: null,
          bed,
          inpatientAdmission: null, // populate after BED-13
          inpatientRequest: null,
        };
      }
    });
    return <WardBed key={bed.uuid} bed={bed} wardPatients={wardPatients} />;
  });

  const wardUnassignedPatients = wardUnassignedPatientsList?.map((inpatientAdmission) => {
    return (
      <UnassignedPatient
        wardPatient={{
          patient: inpatientAdmission.patient,
          visit: inpatientAdmission.visit,
          bed: null,
          inpatientAdmission,
          inpatientRequest: null,
        }}
        key={inpatientAdmission.patient.uuid}
      />
    );
  });

  return (
    <div className={classNames(styles.wardViewMain, { [styles.verticalTiling]: isVertical })}>
      {wardBeds}
      {bedLayouts?.length == 0 && (
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

export default WardView;
