import React, { useMemo } from 'react';
import { InlineNotification } from '@carbon/react';
import { useLocations, useSession, type Location } from '@openmrs/esm-framework';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardBed from './ward-bed.component';
import { bedLayoutToBed, checkIfBedManagementInstalled } from './ward-view.resource';
import styles from './ward-view.scss';
import EmptyBedSkeleton from '../empty-beds/empty-bed-skeleton';
import { useInstalledModules } from '../hooks/useInstalledModules';

const WardView = () => {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();
  const allLocations = useLocations();
  const { t } = useTranslation();
  const locationFromUrl = allLocations.find((l) => l.uuid === locationUuidFromUrl);
  const { installedBackendModules, isLoading, error } = useInstalledModules();
  const isBedManagementModuleInstalled = useMemo(() => {
    return checkIfBedManagementInstalled(installedBackendModules);
  }, [installedBackendModules]);
  const invalidLocation = locationUuidFromUrl && !locationFromUrl;
  const location = (locationFromUrl ?? sessionLocation) as any as Location;

  if (isLoading) {
    return (
      <div className={styles.wardViewMain}>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <EmptyBedSkeleton key={i} />
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        lowContrast={true}
        title={t('errorLoadingBackendModules', 'Error loading Backend Modules')}
        subtitle={error?.message ?? t('cannotLoadBackendModules', 'Could not load Backend Modules')}
      />
    );
  }

  if (!isBedManagementModuleInstalled) return <></>;
  return (
    <div className={styles.wardView}>
      <div className={styles.wardViewHeader}>
        <h4>{location?.display}</h4>
      </div>
      <div className={styles.wardViewMain}>
        {invalidLocation ? (
          <InlineNotification
            kind="error"
            lowContrast={true}
            title={t('invalidLocationSpecified', 'Invalid location specified')}
            subtitle={t('unknownLocationUuid', 'Unknown location uuid: {{locationUuidFromUrl}}', {
              locationUuidFromUrl,
            })}
          />
        ) : (
          <WardViewByLocation location={location} />
        )}
      </div>
    </div>
  );
};

const WardViewByLocation = ({ location }: { location: Location }) => {
  const { admissionLocation, isLoading, error } = useAdmissionLocation(location.uuid);
  const { t } = useTranslation();

  if (admissionLocation) {
    // admissionLocation.bedLayouts can contain row+column positions with no bed,
    // filter out layout positions with no real bed
    let collator = new Intl.Collator([], { numeric: true });
    const bedLayouts = admissionLocation.bedLayouts
      .filter((bl) => bl.bedId)
      .sort((bedA, bedB) => collator.compare(bedA.bedNumber, bedB.bedNumber));

    return (
      <>
        {bedLayouts.map((bedLayout, i) => {
          const { patient } = bedLayout;
          const bed = bedLayoutToBed(bedLayout);
          return <WardBed key={bed.uuid} bed={bed} patients={patient ? [patient] : null} />;
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
