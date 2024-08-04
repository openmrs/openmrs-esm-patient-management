import React, { useMemo } from 'react';
import { InlineNotification, PaginationNav } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { WorkspaceContainer, useFeatureFlag, ErrorState, usePagination } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardBed from './ward-bed.component';
import { bedLayoutToBed, filterBeds } from './ward-view.resource';
import styles from './ward-view.scss';
import WardViewHeader from '../ward-view-header/ward-view-header.component';
import { type AdmissionLocationFetchResponse, type InpatientAdmission, type WardPatient } from '../types';
import { useInpatientAdmission } from '../hooks/useInpatientAdmission';
import UnassignedPatient from '../beds/unassigned-patient.component';

const pageSize = 6;

const WardView = () => {
  const { inpatientAdmissions, isLoading: isLoadingPatients, error: errorLoadingPatients } = useInpatientAdmission();
  const {
    admissionLocation,
    isLoading: isLoadingAdmissionLocation,
    error: errorLoadingAdmissionLocation,
  } = useAdmissionLocation();
  const { t } = useTranslation();

  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  const { goTo, results } = usePagination(admissionLocation?.bedLayouts, pageSize);

  const paginatedAdmissionLocation: AdmissionLocationFetchResponse = {
    ...admissionLocation,
    bedLayouts: results,
  };

  if (isLoadingPatients || isLoadingAdmissionLocation) {
    return (
      <div className={styles.wardView}>
        <div className={styles.wardViewMain}>
          {Array(6)
            .fill(0)
            ?.map((_, i) => <EmptyBedSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (errorLoadingAdmissionLocation) {
    return (
      <div className={styles.wardView}>
        <ErrorState
          error={t('errorOccurredLoadingAdmissionLocations', 'An error occurred loading admission location')}
          headerTitle={t('errorLoadingAdmissionLocations', 'Error loading admission location')}
        />
      </div>
    );
  }

  // if (errorLoadingPatients) {
  //   return (
  //     <div className={styles.wardView}>
  //       <ErrorState
  //         error={t('anErrorOccurredPatients', 'An error occurred loading patients')}
  //         headerTitle={t('errorLoadingPatients', 'Error loading admitted patients')}
  //       />
  //     </div>
  //   );
  // }

  // if (!inpatientAdmissions) {
  //   return (
  //     <EmptyState displayText={'There are no current inpatient admissions'} headerTitle={'No Patient Admissions'} />
  //   );
  // }

  if (!admissionLocation) {
    <EmptyState displayText={'There are no current admission location'} headerTitle={'No admission Location'} />;
  }

  return (
    <div className={styles.wardView}>
      <div className={styles.wardViewHeaderWrapper}>
        <WardViewHeader />
        <PaginationNav
          itemsShown={5}
          totalItems={Math.ceil(admissionLocation.bedLayouts.length / pageSize)}
          onChange={(c: number) => goTo(c + 1)}
        />
      </div>
      <div className={styles.wardViewMain}>
        {isBedManagementModuleInstalled ? (
          <WardViewWithBedManagement admissionLocation={paginatedAdmissionLocation} />
        ) : (
          <WardViewWithoutBedManagement />
        )}
      </div>
      <WorkspaceContainer overlay contextKey="ward" />
    </div>
  );
};

// display to use if bed management is installed
const WardViewWithBedManagement = ({ admissionLocation }: { admissionLocation: AdmissionLocationFetchResponse }) => {
  const { inpatientAdmissions } = useInpatientAdmission();
  const { t } = useTranslation();

  const inpatientAdmissionsByPatientUuid = useMemo(() => {
    const map = new Map<string, InpatientAdmission>();
    for (const inpatientAdmission of inpatientAdmissions ?? []) {
      map.set(inpatientAdmission.patient.uuid, inpatientAdmission);
    }
    return map;
  }, [inpatientAdmissions]);

  const bedLayouts = admissionLocation && filterBeds(admissionLocation);

  if (bedLayouts?.length == 0) {
    return (
      <EmptyState displayText="No beds" headerTitle={t('noBedsConfigured', 'No beds configured for this location')} />
    );
  }

  // iterate over all beds
  const wardBeds = bedLayouts?.map((bedLayout) => {
    const { patients } = bedLayout;
    const bed = bedLayoutToBed(bedLayout);

    const wardPatients: WardPatient[] = patients?.map((patient) => {
      const inpatientAdmission = inpatientAdmissionsByPatientUuid.get(patient.uuid);

      if (inpatientAdmission) {
        return { patient: inpatientAdmission.patient, visit: inpatientAdmission.visit, admitted: true };
      } else {
        // for some reason this patient is in a bed but not in the list of admitted patients, so we need to use the patient data from the bed endpoint
        return { patient: patient, visit: null, admitted: false };
      }
    });

    return <WardBed key={bed.uuid} bed={bed} wardPatients={wardPatients} />;
  });

  const patientsInBedsUuids = bedLayouts?.flatMap((bedLayout) => bedLayout.patients?.map((patient) => patient.uuid));

  const wardUnassignedPatients =
    inpatientAdmissions &&
    inpatientAdmissions
      .filter(
        (inpatientAdmission) => !patientsInBedsUuids || !patientsInBedsUuids.includes(inpatientAdmission.patient.uuid),
      )
      ?.map((inpatientAdmission) => {
        return (
          <UnassignedPatient
            wardPatient={{ patient: inpatientAdmission.patient, visit: inpatientAdmission.visit, admitted: true }}
            key={inpatientAdmission.patient.uuid}
          />
        );
      });

  return (
    <>
      {wardBeds}
      {wardUnassignedPatients}
    </>
  );
};

// display to use if not using bed management
const WardViewWithoutBedManagement = () => {
  const { inpatientAdmissions } = useInpatientAdmission();

  const wardPatients = inpatientAdmissions?.map((inpatientAdmission) => {
    return (
      <UnassignedPatient
        wardPatient={{ patient: inpatientAdmission.patient, visit: inpatientAdmission.visit, admitted: true }}
        key={inpatientAdmission.patient.uuid}
      />
    );
  });

  return <>{wardPatients}</>;
};

export default WardView;
