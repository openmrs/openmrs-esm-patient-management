import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import { useConfig } from '@openmrs/esm-framework';
import { Loading, Tile } from 'carbon-components-react';
import EmptyDataIllustration from './empty-data-illustration.component';
import PatientSearchResults, { SearchResultSkeleton } from '../patient-search-result/patient-search-result.component';
import styles from './patient-search.scss';
import { usePatientSearch } from './patient-search.resource';

const resultsPerPage = 5;

const customRepresentation =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(name)))';

interface PatientSearchProps {
  hidePanel?: () => void;
  query: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ hidePanel, query = '' }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const {
    isLoading,
    data: searchResults,
    fetchError,
    loadingNewData,
    setPage,
    hasMore,
  } = usePatientSearch(query, customRepresentation, config.includeDead, !!query);

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

  console.log(fetchError as Error);

  return (
    <div className={styles.searchResultsContainer}>
      {!fetchError ? (
        !isEmpty(searchResults) ? (
          <div
            className={styles.searchResults}
            style={{
              maxHeight: '20rem',
            }}>
            <PatientSearchResults hidePanel={hidePanel} patients={searchResults} />
            {hasMore && (
              <div className={styles.loadingIcon} ref={loadingIconRef}>
                <Loading withOverlay={false} small />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.searchResults}>
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
          </div>
        )
      ) : (
        <div className={styles.searchResults}>
          {/* <p className={styles.labelText}>{t('errorText', 'An error occurred while performing search')}</p> */}
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
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
