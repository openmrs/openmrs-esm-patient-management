import { InlineNotification } from '@carbon/react';
import { WorkspaceContainer, useFeatureFlag, useLocations, useSession, type Location } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardBed from './ward-bed.component';
import { bedLayoutToBed, filterBeds } from './ward-view.resource';
import styles from './ward-view.scss';
import WardViewHeader from '../ward-view-header/ward-view-header.component';
import { type AdmittedPatient, type WardPatient } from '../types';
import { useAdmittedPatients } from '../hooks/useAdmittedPatients';

const WardView = () => {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();
  const allLocations = useLocations();
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const locationFromUrl = allLocations.find((l) => l.uuid === locationUuidFromUrl);
  const invalidLocation = Boolean(locationUuidFromUrl && !locationFromUrl);
  const location = (locationFromUrl ?? sessionLocation) as any as Location;
  //TODO:Display patients with admitted status (based on their observations) that have no beds assigned
  if (!isBedManagementModuleInstalled) {
    return <></>;
  }

  return invalidLocation ? (
    <InlineNotification
      kind="error"
      lowContrast={true}
      title={t('invalidLocationSpecified', 'Invalid location specified')}
      subtitle={t('unknownLocationUuid', 'Unknown location uuid: {{locationUuidFromUrl}}', {
        locationUuidFromUrl,
      })}
    />
  ) : (
    <div className={styles.wardView}>
      <WardViewHeader location={location} />
      <div className={styles.wardViewMain}>
        <WardViewByLocation location={location} />
      </div>
      <WorkspaceContainer contextKey="ward" />
    </div>
  );
};

const WardViewByLocation = ({ location }: { location: Location }) => {
  const {
    admissionLocation,
    isLoading: isLoadingLocation,
    error: errorLoadingLocation,
  } = useAdmissionLocation(location.uuid);
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
          return { ...admittedPatient, admitted: true };
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

    return (
      <>
        {wardBeds}
        {bedLayouts.length == 0 && (
          <InlineNotification
            kind="warning"
            lowContrast={true}
            title={t('noBedsConfigured', 'No beds configured for this location')}
          />
        )}
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
