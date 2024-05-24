import React from 'react';
import { showToast, useLocations, useSession } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WardBed from './ward-bed.component';
import styles from './ward-view.scss';
import { type Location } from '@openmrs/esm-framework';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import { Bed } from '../types';
import { bedLayoutToBed } from './ward-view.resource';

const WardView = () => {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();
  const allLocations = useLocations();
  const { t } = useTranslation();
  const locationFromUrl = allLocations.find((l) => l.uuid === locationUuidFromUrl);

  if (locationUuidFromUrl && !locationFromUrl) {
    showToast({
      title: t('invalidLocationSpecified', 'Invalid location specified'),
      kind: 'warning',
      description: t('unknownLocationUuid', 'Unknown location uuid: {{locationUuidFromUrl}}', { locationUuidFromUrl }),
    });

    return <></>;
  }

  const location = (locationFromUrl ?? sessionLocation) as any as Location;
  return <WardViewByLocation location={location} />;
};

const WardViewByLocation = ({ location }: { location: Location }) => {
  const blah = useAdmissionLocation(location.uuid);
  const { admissionLocations, isLoading, error } = blah;

  if (admissionLocations?.length > 0) {
    const { bedLayouts } = admissionLocations[0];

    return (
      <div className={styles.wardView}>
        <div className={styles.wardViewHeader}>
          <div className={styles.wardViewHeaderLocation}>{location?.display}</div>
        </div>
        <div className={styles.wardViewMain}>
          {bedLayouts.map((bedLayout, i) => {
            const { patient } = bedLayout;
            const bed = bedLayoutToBed(bedLayout);
            return <WardBed key={bed.uuid} bed={bed} patients={patient ? [patient] : null} />;
          })}
          {bedLayouts.length == 0 && <>No beds configured for this location</>}
        </div>
      </div>
    );
  } else if (isLoading) {
    return <>Loading...</>;
  } else {
    if (error) {
      return <>{error}</>;
    } else {
      return <>No bed location found</>;
    }
  }
};

export default WardView;
