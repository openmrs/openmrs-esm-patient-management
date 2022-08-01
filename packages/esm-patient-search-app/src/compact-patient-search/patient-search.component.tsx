import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Loading, Tile } from '@carbon/react';
import isEmpty from 'lodash-es/isEmpty';
import { useConfig } from '@openmrs/esm-framework';
import { usePatientSearchInfinite } from '../patient-search.resource';
import PatientSearchResults, { SearchResultSkeleton } from './compact-patient-banner.component';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import styles from './patient-search.scss';

interface PatientSearchProps {
  hidePanel?: () => void;
  query: string;
  selectPatientAction?: (patientUuid: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ hidePanel, query = '', selectPatientAction }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const {
    isLoading,
    data: searchResults,
    fetchError,
    loadingNewData,
    setPage,
    hasMore,
    totalResults,
  } = usePatientSearchInfinite(query, config.includeDead, !!query);

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
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.searchResultsContainer}>
      {!fetchError ? (
        !isEmpty(searchResults) ? (
          <div
            className={styles.searchResults}
            style={{
              maxHeight: '22rem',
            }}>
            <p className={styles.resultsText}>
              {totalResults} {t('searchResultsText', 'search result(s)')}
            </p>
            <PatientSearchResults
              hidePanel={hidePanel}
              patients={searchResults}
              selectPatientAction={selectPatientAction}
            />
            {hasMore && (
              <div className={styles.loadingIcon} ref={loadingIconRef}>
                <Loading withOverlay={false} small />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.searchResults}>
            <Layer>
              <Tile className={styles.emptySearchResultsTile}>
                <EmptyDataIllustration />
                <p className={styles.emptyResultText}>
                  {t('noPatientChartsFoundMessage', 'Sorry, no patient charts have been found')}
                </p>
                <p className={styles.actionText}>
                  <span>{t('trySearchWithPatientUniqueID', "Try searching with the patient's unique ID number")}</span>
                  <br />
                  <span>{t('orPatientName', "OR the patient's name(s)")}</span>
                </p>
              </Tile>
            </Layer>
          </div>
        )
      ) : (
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
      )}
    </div>
  );
};

export default PatientSearch;
