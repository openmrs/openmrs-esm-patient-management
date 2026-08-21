import React, { forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { EmptyCardIllustration } from '@openmrs/esm-framework';
import { type PatientSearchResponse } from '../types';
import CompactPatientBanner, { type CompactPatientBannerHandle } from './compact-patient-banner.component';
import Loader from './loader.component';
import styles from './patient-search.scss';
import { SWRConfig } from 'swr';

interface PatientSearchProps extends PatientSearchResponse {
  query: string;
}

const PatientSearch = forwardRef<CompactPatientBannerHandle, PatientSearchProps>(
  ({ data: searchResults, fetchError, hasMore, isLoading, isValidating, setPage, totalResults }, ref) => {
    const { t } = useTranslation();

    const fetchMore = useCallback(() => setPage((page) => page + 1), [setPage]);

    // Only show the full skeleton when there is nothing to show
    if (isLoading && !searchResults?.length) {
      return (
        <div className={styles.searchResultsContainer} role="progressbar">
          {[...Array(5)].map((_, index) => (
            <Loader key={index} />
          ))}
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className={styles.searchResults}>
          <Layer>
            <Tile className={styles.emptySearchResultsTile}>
              <EmptyCardIllustration />
              <div>
                <p className={styles.errorMessage}>{t('error', 'Error')}</p>
                <p className={styles.errorCopy}>
                  {t(
                    'errorCopy',
                    'Sorry, there was an error. You can try to reload this page, or contact the site administrator and quote the error code above.',
                  )}
                </p>
              </div>
            </Tile>
          </Layer>
        </div>
      );
    }

    if (searchResults?.length) {
      return (
        <div className={styles.searchResultsContainer}>
          <div className={styles.searchResults}>
            <p className={styles.resultsText}>
              {t('searchResultsCount', '{{count}} search result', {
                count: totalResults,
              })}
            </p>
            {/* Set SWRConfig to minimize revalidations of, e.g., the patient photo */}
            <SWRConfig
              value={{
                revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                dedupingInterval: 180_000, // 3 minutes
              }}>
              <CompactPatientBanner
                ref={ref}
                patients={searchResults}
                hasMore={hasMore}
                isValidating={isValidating}
                fetchMore={fetchMore}
              />
            </SWRConfig>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResults}>
          <Layer>
            <Tile className={styles.emptySearchResultsTile}>
              <EmptyCardIllustration />
              <p className={styles.emptyResultText}>
                {t('noPatientChartsFoundMessage', 'Sorry, no patient charts were found')}
              </p>
              <p className={styles.actionText}>
                <span>
                  {t('trySearchWithPatientUniqueID', "Try to search again using the patient's unique ID number")}
                </span>
              </p>
            </Tile>
          </Layer>
        </div>
      </div>
    );
  },
);

export default PatientSearch;
