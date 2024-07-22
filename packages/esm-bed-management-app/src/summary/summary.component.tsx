import React from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useAdmissionLocations } from './summary.resource';
import EmptyState from '../empty-state/empty-state.component';
import WardCard from '../ward-card/ward-card.component';
import styles from './summary.scss';
import { ErrorState } from '@openmrs/esm-patient-common-lib';

const Summary: React.FC = () => {
  const { t } = useTranslation();
  const { data: admissionLocations, isLoading, error } = useAdmissionLocations();

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <DataTableSkeleton role="progressbar" zebra />
      </div>
    );
  }

  if (admissionLocations?.length) {
    return (
      <div className={styles.cardContainer}>
        {admissionLocations.map((admissionLocation) => {
          const routeSegment = `${window.getOpenmrsSpaBase()}bed-management/location/${admissionLocation.ward.uuid}`;

          return (
            <WardCard
              headerLabel={admissionLocation.ward.display}
              label={t('beds', 'Beds')}
              value={admissionLocation?.totalBeds}>
              {admissionLocation?.totalBeds && (
                <div className={styles.link}>
                  <ConfigurableLink className={styles.link} to={routeSegment}>
                    {t('viewBeds', 'View beds')}
                  </ConfigurableLink>
                  <ArrowRight size={16} />
                </div>
              )}
            </WardCard>
          );
        })}
      </div>
    );
  }

  if (!isLoading && admissionLocations?.length === 0 && !error) {
    return <EmptyState msg="No data to display" helper={''} />;
  }

  if (error) {
    return (
      <ErrorState headerTitle={t('errorFetchingbedInformation', 'Error fetching bed information')} error={error} />
    );
  }
};

export default Summary;
