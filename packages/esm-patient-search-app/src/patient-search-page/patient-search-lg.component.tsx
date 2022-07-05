import React, { useCallback, useMemo, useState } from 'react';
import styles from './patient-search-lg.scss';
import isEmpty from 'lodash-es/isEmpty';
import { Dropdown, Tile } from 'carbon-components-react';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import { useTranslation } from 'react-i18next';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import Pagination from '../ui-components/pagination/pagination.component';
import { usePatientSearchFHIR } from '../patient-search.resource';
import { interpolateString, navigate, useConfig } from '@openmrs/esm-framework';

interface PatientSearchComponentProps {
  query: string;
  resultsToShow?: number;
  stickyPagination?: boolean;
  onPatientSelect?: (patientUuid: string) => void;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({
  query,
  resultsToShow,
  stickyPagination,
  onPatientSelect,
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const [currentPage, setPage] = useState(1);
  const sortingOptions = [
    {
      text: t('sortByFirstName(a-z)', 'First name (a-z)'),
      key: 'given',
    },
    {
      text: t('sortByLastName(a-z)', 'Last name (a-z)'),
      key: 'family',
    },
    {
      text: t('sortByAge', 'Oldest first'),
      key: 'birthDate',
    },
  ];
  const [sortBy, setSortBy] = useState(sortingOptions[0]);
  const {
    isLoading,
    data: searchResults,
    fetchError,
    hasMore,
    totalResults,
  } = usePatientSearchFHIR(query, !!query, resultsToShow, sortBy.key, currentPage);

  const totalPages = useMemo(
    () => (totalResults ? Math.ceil(totalResults / resultsToShow) : 0),
    [totalResults, resultsToShow, Math.ceil],
  );

  const handleSortingChange = ({ selectedItem }) => {
    setSortBy(selectedItem);
  };

  const handlePatientSelection = useCallback(
    (evt, patientUuid: string) => {
      evt.preventDefault();
      if (onPatientSelect) {
        onPatientSelect(patientUuid);
      } else {
        navigate({
          to: interpolateString(config.search.patientResultUrl, {
            patientUuid: patientUuid,
          }),
        });
      }
    },
    [navigate, interpolateString, config, onPatientSelect],
  );

  if (!query) {
    return <></>;
  }

  if (isLoading) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={`${styles.searchResults} ${stickyPagination && styles.broadBottomMargin}`}>
          <div>
            <h2 className={styles.resultsHeader}>
              <span className={styles.productiveHeading02}>
                {totalResults
                  ? `${totalResults} ${t('seachResultsSmall', 'search results')}`
                  : t('searchingText', 'Searching...')}
              </span>
            </h2>
            <div className={styles.results}>
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
              <PatientBannerSkeleton />
            </div>
          </div>
          {totalResults !== 1 && (
            <div className={`${styles.pagination} ${stickyPagination && styles.stickyPagination}`}>
              <Pagination setPage={setPage} currentPage={currentPage} hasMore={hasMore} totalPages={totalPages} />
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
            <div className={`${styles.searchResults} ${stickyPagination && styles.broadBottomMargin}`}>
              <h2 className={styles.resultsHeader}>
                <span className={styles.productiveHeading02}>
                  {totalResults} {t('seachResultsSmall', 'search results')}
                </span>
                <Dropdown
                  label={`${t('sortBy', 'Sort by')}:`}
                  titleText={`${t('sortBy', 'Sort by')}:`}
                  id="sort-patient-by-query"
                  defaultValue="given"
                  items={sortingOptions}
                  itemToString={(item) => item.text}
                  onChange={handleSortingChange}
                  type="inline"
                  selectedItem={sortBy}
                  style={{
                    rowGap: 0,
                  }}
                />
              </h2>
              <div className={styles.results}>
                {searchResults.map((patient) => (
                  <PatientBanner onPatientSelect={handlePatientSelection} patientUuid={patient.id} patient={patient} />
                ))}
              </div>
            </div>
            {totalPages !== 1 && (
              <div className={`${styles.pagination} ${stickyPagination && styles.stickyPagination}`}>
                <Pagination setPage={setPage} currentPage={currentPage} hasMore={hasMore} totalPages={totalPages} />
              </div>
            )}
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
      <h2 className={styles.resultsHeader}>
        <span className={styles.productiveHeading02}>0 {t('seachResultsSmall', 'search results')}</span>
      </h2>
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
