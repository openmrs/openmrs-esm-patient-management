import React, { useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import type { SearchedPatient } from '../types';
import CompactPatientBanner from './compact-patient-banner.component';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import Loader from './loader.component';
import styles from './patient-search.scss';

interface RecentPatientSearchProps {
  data: SearchedPatient[];
  fetchError: any;
  isLoading: boolean;
}

const RecentlySearchedPatients = React.forwardRef<HTMLDivElement, RecentPatientSearchProps>(
  ({ data: searchResults, fetchError, isLoading }, ref) => {
    const { t } = useTranslation();

    if (!searchResults && isLoading) {
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
              <EmptyDataIllustration />
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
            <div className={styles.resultsText}>
              <span className={styles.resultsTextCount}>
                {t('recentSearchResultsCount', '{{count}} recent search result', {
                  count: searchResults.length,
                })}
              </span>
            </div>
            <CompactPatientBanner patients={searchResults} ref={ref} />
          </div>
        </div>
      );
    }

    if (searchResults?.length === 0) {
      return (
        <div className={styles.searchResultsContainer}>
          <div className={styles.searchResults}>
            <Layer>
              <Tile className={styles.emptySearchResultsTile}>
                <EmptyDataIllustration />
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
    }
  },
);

export default RecentlySearchedPatients;