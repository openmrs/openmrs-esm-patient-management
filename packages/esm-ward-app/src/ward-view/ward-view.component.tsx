import React, { useMemo } from 'react';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { WorkspaceContainer, useFeatureFlag } from '@openmrs/esm-framework';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardBed from './ward-bed.component';
import { bedLayoutToBed, filterBeds } from './ward-view.resource';
import styles from './ward-view.scss';
import WardViewHeader from '../ward-view-header/ward-view-header.component';
import { type InpatientAdmission, type WardPatient } from '../types';
import { useInpatientAdmission } from '../hooks/useInpatientAdmission';
import useWardLocation from '../hooks/useWardLocation';
import UnassignedPatient from '../beds/unassigned-patient.component';

const WardView = () => {
  const response = useWardLocation();
  const { isLoadingLocation, invalidLocation } = response;
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  if (isLoadingLocation) {
    return <></>;
  }

  if (invalidLocation) {
    return <InlineNotification kind="error" title={t('invalidLocationSpecified', 'Invalid location specified')} />;
  }

  return (
    <div className={styles.wardView}>
      <WardViewHeader />
      <div className={styles.wardViewMain}>
        {isBedManagementModuleInstalled ? <WardViewWithBedManagement /> : <WardViewWithoutBedManagement />}
      </div>
      <WorkspaceContainer overlay contextKey="ward" />
    </div>
  );
};

// display to use if bed management is installed
const WardViewWithBedManagement = () => {
  const { location } = useWardLocation();
  const { admissionLocation, isLoading: isLoadingLocation, error: errorLoadingLocation } = useAdmissionLocation();
  const { inpatientAdmissions, isLoading: isLoadingPatients, error: errorLoadingPatients } = useInpatientAdmission();
  const { t } = useTranslation();
  const inpatientAdmissionsByPatientUuid = useMemo(() => {
    const map = new Map<string, InpatientAdmission>();
    for (const inpatientAdmission of inpatientAdmissions ?? []) {
      map.set(inpatientAdmission.patient.uuid, inpatientAdmission);
    }
    return map;
  }, [inpatientAdmissions]);

  if (admissionLocation != null || inpatientAdmissions != null) {
    const bedLayouts = admissionLocation && filterBeds(admissionLocation);
    // iterate over all beds
    const wardBeds = bedLayouts?.map((bedLayout) => {
      const { patients } = bedLayout;
      const bed = bedLayoutToBed(bedLayout);
      const wardPatients: WardPatient[] = patients.map((patient) => {
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

    const patientsInBedsUuids = bedLayouts?.flatMap((bedLayout) => bedLayout.patients.map((patient) => patient.uuid));
    const wardUnassignedPatients =
      inpatientAdmissions &&
      inpatientAdmissions
        .filter(
          (inpatientAdmission) =>
            !patientsInBedsUuids || !patientsInBedsUuids.includes(inpatientAdmission.patient.uuid),
        )
        .map((inpatientAdmission) => {
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
        {bedLayouts?.length == 0 && (
          <InlineNotification
            kind="warning"
            lowContrast={true}
            title={t('noBedsConfigured', 'No beds configured for this location')}
          />
        )}
        {wardUnassignedPatients}
      </>
    );
  } else if (isLoadingLocation || isLoadingPatients) {
    return <EmptyBeds />;
  } else if (errorLoadingLocation) {
    return (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('errorLoadingWardLocation', 'Error loading ward location')}
        subtitle={
          errorLoadingLocation?.message ??
          t('invalidWardLocation', 'Invalid ward location: {{location}}', { location: location.display })
        }
      />
    );
  } else {
    return (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('errorLoadingPatients', 'Error loading admitted patients')}
        subtitle={errorLoadingPatients?.message}
      />
    );
  }
};

// display to use if not using bed management
const WardViewWithoutBedManagement = () => {
  const { inpatientAdmissions, isLoading: isLoadingPatients, error: errorLoadingPatients } = useInpatientAdmission();
  const { t } = useTranslation();

  if (inpatientAdmissions) {
    const wardPatients = inpatientAdmissions?.map((inpatientAdmission) => {
      return (
        <UnassignedPatient
          wardPatient={{ patient: inpatientAdmission.patient, visit: inpatientAdmission.visit, admitted: true }}
          key={inpatientAdmission.patient.uuid}
        />
      );
    });
    return <>{wardPatients}</>;
  } else if (isLoadingPatients) {
    return <EmptyBeds />;
  } else {
    return (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('errorLoadingPatients', 'Error loading admitted patients')}
        subtitle={errorLoadingPatients?.message}
      />
    );
  }
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
