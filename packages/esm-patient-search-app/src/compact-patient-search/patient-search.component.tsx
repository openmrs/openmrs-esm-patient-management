import React, { useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Loading, Tile } from '@carbon/react';
import { EmptyCardIllustration } from '@openmrs/esm-framework';
import { type PatientSearchResponse } from '../types';
import CompactPatientBanner from './compact-patient-banner.component';
import Loader from './loader.component';
import styles from './patient-search.scss';

interface PatientSearchProps extends PatientSearchResponse {
  query: string;
}

const PatientSearch = React.forwardRef<HTMLDivElement, PatientSearchProps>(
  ({ data: searchResults, fetchError, hasMore, isLoading, isValidating, setPage, totalResults }, ref) => {
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

    if (isLoading) {
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
            <CompactPatientBanner patients={searchResults} ref={ref} />
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
