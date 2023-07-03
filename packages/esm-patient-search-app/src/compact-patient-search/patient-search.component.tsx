import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Loading, Tile } from '@carbon/react';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import PatientSearchResults, { SearchResultSkeleton } from './compact-patient-banner.component';
import type { PatientSearchResponse, SearchedPatient } from '../types';
import styles from './patient-search.scss';

interface PatientSearchProps extends PatientSearchResponse {
  query: string;
  selectPatientAction?: (
    evt: React.MouseEvent<HTMLAnchorElement>,
    index: number,
    patients: Array<SearchedPatient>,
  ) => void;
}

const PatientSearch = React.forwardRef<HTMLDivElement, PatientSearchProps>(
  (
    { selectPatientAction, isLoading, data: searchResults, fetchError, loadingNewData, setPage, hasMore, totalResults },
    ref,
  ) => {
    const { t } = useTranslation();
    const observer = useRef(null);
    const loadingIconRef = useCallback(
      (node) => {
        if (loadingNewData) {
          return;
        }
        if (observer.current) {
          observer.current.disconnect();
        }
        observer.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore) {
              setPage((page) => page + 1);
            }
          },
          {
            threshold: 0.75,
          },
        );
        if (node) {
          observer.current.observe(node);
        }
      },
      [loadingNewData, hasMore, setPage],
    );

    if (isLoading) {
      return (
        <div className={styles.searchResultsContainer}>
          {[...Array(5)].map((_, index) => (
            <SearchResultSkeleton key={index} />
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
            <p className={styles.resultsText}>
              {t('searchResultsCount', '{count} search result{plural}', {
                count: searchResults.length,
                plural: searchResults.length === 0 || searchResults.length > 1 ? 's' : '',
              })}
            </p>
            <PatientSearchResults patients={searchResults} selectPatientAction={selectPatientAction} ref={ref} />
            {hasMore && (
              <div className={styles.loadingIcon} ref={loadingIconRef}>
                <Loading withOverlay={false} small />
              </div>
            )}
          </div>
        </div>
      );
    }

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
  },
);

export default PatientSearch;
