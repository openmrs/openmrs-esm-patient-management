import { InlineNotification } from '@carbon/react';
import { WorkspaceContainer, useFeatureFlag, type Location } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardBed from './ward-bed.component';
import { bedLayoutToBed, filterBeds } from './ward-view.resource';
import styles from './ward-view.scss';
import WardViewHeader from '../ward-view-header/ward-view-header.component';
import useWardLocation from '../hooks/useWardLocation';

const WardView = () => {
  const response = useWardLocation();
  const { isLoadingLocation, errorFetchingLocation, invalidLocation } = response;

  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  //TODO:Display patients with admitted status (based on their observations) that have no beds assigned
  if (!isBedManagementModuleInstalled || isLoadingLocation) {
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
      <WorkspaceContainer contextKey="ward" />
    </div>
  );
};

const WardViewByLocation = () => {
  const { location } = useWardLocation();
  const { admissionLocation, isLoading, error } = useAdmissionLocation(location?.uuid);
  const { t } = useTranslation();

  if (admissionLocation) {
    const bedLayouts = filterBeds(admissionLocation);

    return (
      <>
        {bedLayouts.map((bedLayout, i) => {
          const { patients } = bedLayout;
          const bed = bedLayoutToBed(bedLayout);

          // TODO: replace visit field with real value fetched from useAdmissionLocation (or replacement API)
          const patientInfos = patients.map((patient) => ({ patient, visit: null }));
          return <WardBed key={bed.uuid} bed={bed} patientInfos={patientInfos} />;
        })}
        {bedLayouts.length == 0 && (
          <InlineNotification
            kind="warning"
            lowContrast={true}
            title={t('noBedsConfigured', 'No beds configured for this location')}
          />
        )}
      </>
    );
  } else if (isLoading) {
    return (
      <>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <EmptyBedSkeleton key={i} />
          ))}
      </>
    );
  } else {
    return (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('errorLoadingWardLocation', 'Error loading ward location')}
        subtitle={
          error?.message ??
          t('invalidWardLocation', 'Invalid ward location: {{location}}', { location: location.display })
        }
      />
    );
  }
};

export default WardView;
