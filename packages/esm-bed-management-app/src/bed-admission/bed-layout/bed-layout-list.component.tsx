import React, { useState } from 'react';
import { Column, InlineLoading, Grid } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import BedLayout from './bed-layout.component';
import styles from './bed-layout.scss';
import EmptyState from '../../empty-state/empty-state.component';
import MinBedLayout from './min-bed-layout.component';
import { useAdmissionLocationBedLayout } from '../../summary/summary.resource';
import { type patientDetailsProps } from '../types';
interface BedLayoutListProps {
  locationUuid: string;
  handleClick: (e) => void;
  patientDetails: patientDetailsProps;
}

const BedLayoutList: React.FC<BedLayoutListProps> = React.memo(({ locationUuid, handleClick, patientDetails }) => {
  const { t } = useTranslation();
  const [selectedBed, setSelectedBed] = useState(null);
  const { data: bedData, isLoading, error } = useAdmissionLocationBedLayout(locationUuid);

  const getLayoutClass = (status: string) => (status === 'AVAILABLE' ? styles.available : styles.occupied);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading
          status="active"
          iconDescription={t('loading', 'Loading')}
          description={t('loading', 'Loading...')}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState headerTitle={t('errorFetchingbedInformation', 'Error fetching bed information')} error={error} />
      </div>
    );
  }

  if (!bedData?.length) {
    return (
      <div className={styles.errorContainer}>
        <EmptyState msg={t('noBedItems', 'No bed to display in this ward')} helper="" />
      </div>
    );
  }
  return (
    <>
      <MinBedLayout />
      <Grid>
        {bedData?.map((bed) => (
          <Column key={bed.bedNumber} lg={5} md={5} sm={5}>
            <BedLayout
              handleBedAssignment={() => {
                setSelectedBed(bed.bedId);
                handleClick(bed);
              }}
              bedPillowStyles={styles.pillow}
              layOutStyles={`${styles.bed} ${getLayoutClass(bed.status)}`}
              isBedSelected={selectedBed === bed.bedId}
              patientDetails={patientDetails}
              bedDetails={bed}
            />
          </Column>
        ))}
      </Grid>
    </>
  );
});

export default BedLayoutList;
