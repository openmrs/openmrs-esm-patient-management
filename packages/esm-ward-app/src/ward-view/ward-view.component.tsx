import React from 'react';
import { showToast, useLocations, useSession } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WardBed from './ward-bed.component';
import styles from './ward-view.scss';
import { useBeds } from '../hooks/useBeds';
import { type Location } from '@openmrs/esm-framework';

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
  const { beds } = useBeds({ locationUuid: location.uuid });

  return (
    <div className={styles.wardView}>
      <div className={styles.wardViewHeader}>
        <div className={styles.wardViewHeaderLocation}>{location?.display}</div>
      </div>
      <div className={styles.wardViewMain}>
        {beds.map((bed, i) => {
          // TODO: fetch patients from server
          return <WardBed key={bed.uuid} bed={bed} patients={null} />;
        })}
      </div>
    </div>
  );
};

export default WardView;
