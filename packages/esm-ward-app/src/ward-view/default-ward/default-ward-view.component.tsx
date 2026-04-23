import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDefineAppContext } from '@openmrs/esm-framework';
import { type WardViewContext } from '../../types';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useWardLocation from '../../hooks/useWardLocation';
import { isAdmissionLocation } from '../ward-view.resource';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import DefaultWardBeds from './default-ward-beds.component';
import DefaultWardPatientCardHeader from './default-ward-patient-card-header.component';
import DefaultWardPendingPatients from './default-ward-pending-patients.component';
import DefaultWardUnassignedPatients from './default-ward-unassigned-patients.component';
import Ward from '../ward.component';
import WardViewHeader from '../../ward-view-header/ward-view-header.component';
import WardMetrics from '../../ward-view-header/ward-metrics.component';
import styles from './default-ward-view.scss';

const DefaultWardView = () => {
  const { t } = useTranslation();
  const wardPatientGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardViewContext>('ward-view-context', {
    wardPatientGroupDetails,
    WardPatientHeader: DefaultWardPatientCardHeader,
  });

  const { emrConfiguration } = useEmrConfiguration();
  const { location } = useWardLocation();
  const locationSupportsAdmission = isAdmissionLocation(location, emrConfiguration);

  if (!locationSupportsAdmission) {
    return (
      <div className={styles.nonAdmissionView}>
        <h2>{location?.display}</h2>
        <p className={styles.nonAdmissionSubtitle}>
          {t('locationDoesNotAllowAdmissions', 'This location does not allow admissions.')}
        </p>
      </div>
    );
  }

  return (
    <>
      <WardViewHeader wardPendingPatients={<DefaultWardPendingPatients />} wardMetrics={<WardMetrics />} />
      <Ward wardBeds={<DefaultWardBeds />} wardUnassignedPatients={<DefaultWardUnassignedPatients />} />
    </>
  );
};

export default DefaultWardView;
