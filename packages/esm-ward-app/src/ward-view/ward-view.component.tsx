import { InlineNotification } from '@carbon/react';
import { useDefineAppContext, useFeatureFlag, WorkspaceContainer } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../hooks/useWardLocation';
import { useWardPatientGrouping } from '../hooks/useWardPatientGrouping';
import { type WardPatientGroupDetails } from '../types';
import WardViewHeader from '../ward-view-header/ward-view-header.component';
import DefaultWard from './default-ward/default-ward.component';
import styles from './ward-view.scss';

const WardView = () => {
  const response = useWardLocation();
  const { isLoadingLocation, invalidLocation } = response;
  const { t } = useTranslation();

  const wardPatientsGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardPatientGroupDetails>('ward-patients-group', wardPatientsGroupDetails);
  const isVertical = useFeatureFlag('ward-view-vertical-tiling');

  if (isLoadingLocation) {
    return <></>;
  }

  if (invalidLocation) {
    return <InlineNotification kind="error" title={t('invalidLocationSpecified', 'Invalid location specified')} />;
  }

  return (
    <>
      <div className={classNames(styles.wardView, { [styles.verticalTiling]: isVertical })}>
        <WardViewHeader />
        <DefaultWard />
      </div>
      <WorkspaceContainer overlay contextKey="ward" />
    </>
  );
};

export default WardView;
