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
import { type AdmittedPatient, type WardPatient } from '../types';
import { useAdmittedPatients } from '../hooks/useAdmittedPatients';
import useWardLocation from '../hooks/useWardLocation';
import UnassignedPatient from '../beds/unassigned-patient.component';

const WardView = () => {
  const response = useWardLocation();
  const { isLoadingLocation, errorFetchingLocation, invalidLocation } = response;

  const { t } = useTranslation();

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
        <WardViewByLocation />
      </div>
      <WorkspaceContainer overlay contextKey="ward" />
    </div>
  );
};

const WardViewByLocation = () => {
  const { location } = useWardLocation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const {
    admissionLocation,
    isLoading: isLoadingLocation,
    error: errorLoadingLocation,
  } = useAdmissionLocation(location?.uuid);
  const {
    admittedPatients,
    isLoading: isLoadingPatients,
    error: errorLoadingPatients,
  } = useAdmittedPatients(location.uuid);
  const { t } = useTranslation();
  const admittedPatientsByUuid = useMemo(() => {
    const map = new Map<string, AdmittedPatient>();
    for (const admittedPatient of admittedPatients ?? []) {
      map.set(admittedPatient.patient.uuid, admittedPatient);
    }
    return map;
  }, [admittedPatients]);

  if (admissionLocation != null && admittedPatients != null) {
    const bedLayouts = filterBeds(admissionLocation);

    const wardBeds = bedLayouts.map((bedLayout, i) => {
      const { patients } = bedLayout;
      const bed = bedLayoutToBed(bedLayout);
      const wardPatients: WardPatient[] = patients.map((patient) => {
        const admittedPatient = admittedPatientsByUuid.get(patient.uuid);

        if (admittedPatient) {
          // ideally, we can just use the patient object within admittedPatient
          // and not need the one from bedLayouts, however, the emr api
          // does not respect custom representation right now and does not return
          // all required fields for the patient object
          // TODO: change after this is done. https://openmrs.atlassian.net/browse/EA-192
          return { ...admittedPatient, patient, admitted: true };
        }

        // patient assigned a bed but *not* admitted
        // TODO: get the patient's visit and current location
        return {
          patient,
          visit: null,
          admitted: true,
          currentLocation: null,
          timeSinceAdmissionInMinutes: null,
          timeAtInpatientLocationInMinutes: null,
        };
      });
      return <WardBed key={bed.uuid} bed={bed} wardPatients={wardPatients} />;
    });

    const patientInBedsUuids = bedLayouts.flatMap((bedLayout) => bedLayout.patients.map((patient) => patient.uuid));
    const wardUnassignedPatients = admittedPatients
      .filter((admittedPatient) => !patientInBedsUuids.includes(admittedPatient.patient.uuid))
      .map((admittedPatient) => {
        // TODO: note that this might not display all the correct data until https://openmrs.atlassian.net/browse/EA-192 is done
        return (
          <UnassignedPatient wardPatient={{ ...admittedPatient, admitted: true }} key={admittedPatient.patient.uuid} />
        );
      });

    return (
      <>
        {wardBeds}
        {bedLayouts.length == 0 && isBedManagementModuleInstalled && (
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
    return (
      <>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <EmptyBedSkeleton key={i} />
          ))}
      </>
    );
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

export default WardView;
