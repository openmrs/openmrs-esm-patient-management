import React, { useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Layer, Loading, Tile } from '@carbon/react';
import { EmptyCardIllustration } from '@openmrs/esm-framework';
import type { PatientSearchResponse } from '../types';
import CompactPatientBanner from './compact-patient-banner.component';
import Loader from './loader.component';
import styles from './patient-search.scss';
/**
 * RecentlySearchedPatients displays a list of patients the user has interacted with recently.
 *
 * It is rendered below the search bar (before a query is typed) to provide quick
 * access to recent contexts without needing to perform a full search.
 */
interface RecentlySearchedPatientsProps extends PatientSearchResponse {
  patientClickSideEffect?: (patientUuid: string, patient: fhir.Patient) => void;
}

const RecentlySearchedPatients = React.forwardRef<HTMLDivElement, RecentlySearchedPatientsProps>(
  ({ data: searchResults, fetchError, hasMore, isLoading, isValidating, setPage, patientClickSideEffect }, ref) => {
    const { t } = useTranslation();
    const observer = useRef(null);

    const loadingIconRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (isValidating) {
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
      [isValidating, hasMore, setPage],
    );

    useEffect(() => {
      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    }, []);

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
            <div className={styles.resultsText}>
              <span className={styles.resultsTextCount}>
                {t('recentSearchResultsCount', '{{count}} recent search result', {
                  count: searchResults.length,
                })}
              </span>
              {isValidating && (
                <span className={styles.validationIcon}>
                  <InlineLoading className={styles.spinner} />
                </span>
              )}
            </div>
            <CompactPatientBanner patients={searchResults} ref={ref} patientClickSideEffect={patientClickSideEffect} />
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
              <EmptyCardIllustration />
              <p className={styles.emptyResultText}>{t('noRecentlyViewedPatients', 'No recently viewed patients')}</p>
              <p className={styles.actionText}>
                <span>
                  {t('recentPatientsEmptyStateHint', 'Patients you select will appear here for quick access')}
                </span>
              </p>
            </Tile>
          </Layer>
        </div>
      </div>
    );
  },
);

export default RecentlySearchedPatients;
