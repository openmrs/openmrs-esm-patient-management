import { useConfig, usePagination } from '@openmrs/esm-framework';
import React, { useMemo, useState } from 'react';
import { usePatientSearch } from '../patient-search/patient-search.resource';
import styles from './patient-search-lg.scss';
import isEmpty from 'lodash-es/isEmpty';
import { Loading, Tile } from 'carbon-components-react';
import EmptyDataIllustration from '../patient-search/empty-data-illustration.component';
import { useTranslation } from 'react-i18next';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import Pagination from '../ui-components/pagination/pagination.component';
import { usePatientSearchFHIR } from '../patient-search.resource';

interface PatientSearchComponentProps {
  query: string;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({ query }) => {
  const { t } = useTranslation();
  const [currentPage, setPage] = useState(1);
  const resultsToShow = 5;
  const {
    isLoading,
    data: searchResults,
    fetchError,
    hasMore,
    loadingNewData,
    totalResults,
  } = usePatientSearchFHIR(query, !!query, resultsToShow, null, currentPage);

  const totalPages = useMemo(
    () => (totalResults ? Math.ceil(totalResults / resultsToShow) : 0),
    [totalResults, resultsToShow, Math.ceil],
  );

  if (isLoading || (loadingNewData && !searchResults)) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResults}>
          <div>
            <h2 className={styles.resultsHeader}>
              {totalResults
                ? `${totalResults} ${t('seachResultsSmall', 'search results')}`
                : t('searchingText', 'Searching...')}
            </h2>
            <div className={styles.results}>
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
            </div>
          </div>
          {!!totalResults && (
            <div className={styles.pagination}>
              <Pagination
                setPage={setPage}
                currentPage={currentPage}
                hasMore={hasMore}
                pages={totalPages}
                disableButtons
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.searchResultsContainer}>
      {!fetchError ? (
        !isEmpty(searchResults) ? (
          <div>
            <div className={styles.searchResults}>
              <h2 className={styles.resultsHeader}>
                {totalResults} {t('seachResultsSmall', 'search results')}
              </h2>
              <div className={styles.results}>
                {searchResults.map((patient) => (
                  <PatientBanner patientUuid={patient.id} patient={patient} />
                ))}
              </div>
            </div>
            <div className={styles.pagination}>
              <Pagination setPage={setPage} currentPage={currentPage} hasMore={hasMore} pages={totalPages} />
            </div>
          </div>
        ) : (
          <EmptySearchResultsTile />
        )
      ) : (
        <FetchErrorTile />
      )}
    </div>
  );
};

const EmptySearchResultsTile: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className={styles.resultsHeader}>0 {t('seachResultsSmall', 'search results')}</h2>
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
  );
};

const FetchErrorTile: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
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
  );
};

export default PatientSearchComponent;
