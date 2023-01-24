import React, { useCallback } from 'react';
import { Layer, Tile, Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import styles from './mpi-search-based-feature-card.scss';
import { useTranslation } from 'react-i18next';
import { doMPISearch } from '../../utils';
import { MPIConfig } from '../../../types';
import MPIEmptyDataIllustration from '../empty-data-illustration/mpi-empty-data-illustration';

export const MPISearchBasedFeatureCard: React.FC<{ searchTerm: string; mpiConfig: MPIConfig }> = ({
  searchTerm,
  mpiConfig,
}) => {
  const { t } = useTranslation();
  const { title } = mpiConfig;
  const handleMPISearchEvent = useCallback(
    (e) => {
      e.preventDefault();
      doMPISearch(searchTerm);
    },
    [searchTerm],
  );

  return (
    <Layer>
      <Tile className={`${styles.emptySearchResultsTile}`}>
        <MPIEmptyDataIllustration />
        <p className={styles.emptyResultText}>{t('mpiSummaryCardTitle', 'Search against the MPI')}</p>
        <div className={styles.actionText}>
          <div>
            <span>
              {t(
                'mpiSummaryCardDescription',
                'You can create a new Patient Record from an existing external record by searching the MPI database right here.',
              )}
            </span>
          </div>
          <br />
          <Button kind="ghost" renderIcon={Search} onClick={handleMPISearchEvent} disabled={mpiConfig.disableSearch}>
            {`${t('search', 'Search')} ${title}`}
          </Button>
        </div>
      </Tile>
    </Layer>
  );
};
