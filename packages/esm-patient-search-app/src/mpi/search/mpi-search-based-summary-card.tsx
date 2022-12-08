import React from 'react';
import { Layer, Tile, Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import styles from './mpi-search-based-summary-card.scss';
import { useTranslation } from 'react-i18next';
import EmptyDataIllustration from '../../ui-components/empty-data-illustration.component';
import { useConfig } from '@openmrs/esm-framework';

export function MPISearchBasedSummaryCard() {
  const { t } = useTranslation();

  return (
    <Layer>
      <Tile className={`${styles.emptySearchResultsTile}`}>
        <EmptyDataIllustration />
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
          <Button kind="ghost" renderIcon={Search}>
            {t('searchMPI', 'Search MPI')}
          </Button>
        </div>
      </Tile>
    </Layer>
  );
}
