import React from 'react';
import { showToast, useLocations, useSession } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  const location = locationFromUrl ?? sessionLocation;

  return (
    <div>
      <h1 id="ward-location">{location?.display}</h1>
    </div>
  );
};

export default WardView;
