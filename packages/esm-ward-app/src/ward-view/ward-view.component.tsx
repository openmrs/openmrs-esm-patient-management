import { InlineNotification } from '@carbon/react';
import { ExtensionSlot, useFeatureFlag } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../hooks/useWardLocation';
import { useWardConfig } from './ward-view.resource';
import styles from './ward-view.scss';

const WardView: React.FC<{}> = () => {
  const response = useWardLocation();
  const { isLoadingLocation, invalidLocation, location } = response;
  const { t } = useTranslation();

  const locationUuid = location?.uuid;
  const wardConfig = useWardConfig(locationUuid);

  if (isLoadingLocation) {
    return <></>;
  }

  if (invalidLocation) {
    return <InlineNotification kind="error" title={t('invalidLocationSpecified', 'Invalid location specified')} />;
  }

  const wardId = wardConfig.id;

  return (
    <div className={classNames(styles.wardView, styles.verticalTiling)}>
      <ExtensionSlot name={wardId} />
    </div>
  );
};

export default WardView;
