import { InlineNotification } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useEmrConfiguration from '../hooks/useEmrConfiguration';
import useWardLocation from '../hooks/useWardLocation';
import { isAdmissionLocation, useWardConfig } from './ward-view.resource';
import styles from './ward-view.scss';

const WardView: React.FC<{}> = () => {
  const response = useWardLocation();
  const { isLoadingLocation, invalidLocation, location } = response;
  const { t } = useTranslation();
  const { emrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();

  const locationUuid = location?.uuid;
  const wardConfig = useWardConfig(locationUuid);

  if (isLoadingLocation || isLoadingEmrConfiguration) {
    return <></>;
  }

  if (invalidLocation) {
    return <InlineNotification kind="error" title={t('invalidLocationSpecified', 'Invalid location specified')} />;
  }

  if (location && emrConfiguration && !isAdmissionLocation(location, emrConfiguration.supportsAdmissionLocationTag)) {
    return (
      <div className={classNames(styles.wardView, styles.verticalTiling)}>
        <h2>{location.display}</h2>
        <p>{t('locationDoesNotAllowAdmissions', 'This location does not allow admissions')}</p>
      </div>
    );
  }

  const wardId = wardConfig.id;

  return (
    <div className={classNames(styles.wardView, styles.verticalTiling)}>
      <ExtensionSlot name={wardId} />
    </div>
  );
};

export default WardView;
