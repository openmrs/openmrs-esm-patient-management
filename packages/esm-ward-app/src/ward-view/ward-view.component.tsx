import React from 'react';
import { InlineNotification } from '@carbon/react';
import { useLocations, useSession, type Location } from '@openmrs/esm-framework';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardBed from './ward-bed.component';
import { bedLayoutToBed } from './ward-view.resource';
import styles from './ward-view.scss';

const WardView = () => {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();
  const allLocations = useLocations();
  const { t } = useTranslation();
  const locationFromUrl = allLocations.find((l) => l.uuid === locationUuidFromUrl);

  if (locationUuidFromUrl && !locationFromUrl) {
    return (
      <div className={styles.wardView}>
        <div className={styles.wardViewMain}>
          <InlineNotification
            kind="error"
            lowContrast={true}
            title={t('invalidLocationSpecified', 'Invalid location specified')}
            subtitle={t('unknownLocationUuid', 'Unknown location uuid: {{locationUuidFromUrl}}', {
              locationUuidFromUrl,
            })}
          />
        </div>
      </div>
    );
  }

  const location = (locationFromUrl ?? sessionLocation) as any as Location;
  return <WardViewByLocation location={location} />;
};

const WardViewByLocation = ({ location }: { location: Location }) => {
  const { admissionLocation, isLoading, error } = useAdmissionLocation(location.uuid);
  const { t } = useTranslation();

  if (admissionLocation) {
    // admissionLocation.bedLayouts can contain row+column positions with no bed,
    // filter out layout positions with no real bed
    const bedLayouts = admissionLocation.bedLayouts.filter((bl) => bl.bedId);

    return (
      <div className={styles.wardView}>
        <div className={styles.wardViewHeader}>
          <h4>{location?.display}</h4>
        </div>
        <div className={styles.wardViewMain}>
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
        </div>
      </div>
    );
  } else if (isLoading) {
    // TODO: add WardBedSkeleton
    return <>Loading...</>;
  } else {
    return (
      <div className={styles.wardView}>
        <div className={styles.wardViewMain}>
          <InlineNotification
            kind="error"
            lowContrast={true}
            title={t('errorLoadingWardLocation', 'Error loading ward location')}
            subtitle={
              error?.message ??
              t('invalidWardLocation', 'Invalid ward location: {{location}}', { location: location.display })
            }
          />
        </div>
      </div>
    );
  }
};

export default WardView;
