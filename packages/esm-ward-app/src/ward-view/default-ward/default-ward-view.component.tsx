import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDefineAppContext } from '@openmrs/esm-framework';
import { Loading, InlineNotification } from '@carbon/react';
import { type WardViewContext } from '../../types';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useLocations from '../../hooks/useLocations';
import useWardLocation from '../../hooks/useWardLocation';
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

  const { emrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();
  const { location } = useWardLocation();

  const filterCriteria = useMemo(() => {
    const tag = emrConfiguration?.supportsAdmissionLocationTag?.name;
    return tag ? [['_tag', tag]] : [];
  }, [emrConfiguration]);

  const { data: admissionLocations, isLoading: isLoadingAdmissionLocations } = useLocations(
    filterCriteria,
    15,
    !emrConfiguration,
  );

  const locationHasAllowAdmissionsTag = admissionLocations?.some((loc) => loc.id === location?.uuid) ?? false;

  if (isLoadingEmrConfiguration || isLoadingAdmissionLocations) {
    return (
      <div className={styles.loaderContainer}>
        <Loading withOverlay={false} />
      </div>
    );
  }

  return (
    <>
      <WardViewHeader
        wardPendingPatients={<DefaultWardPendingPatients />}
        wardMetrics={<WardMetrics />}
        locationAllowsAdmissions={locationHasAllowAdmissionsTag}
      />
      {!locationHasAllowAdmissionsTag && (
        <InlineNotification
          className={styles.noAdmissionsNotification}
          kind="warning"
          hideCloseButton={true}
          lowContrast={true}
          title={t('locationDoesNotAllowAdmissions', 'This location does not allow admissions.')}
        />
      )}
      <Ward wardBeds={<DefaultWardBeds />} wardUnassignedPatients={<DefaultWardUnassignedPatients />} />
    </>
  );
};

export default DefaultWardView;
