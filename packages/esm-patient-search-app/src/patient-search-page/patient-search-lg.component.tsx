import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import { Layer, Tile } from '@carbon/react';
import { interpolateString, navigate, useConfig } from '@openmrs/esm-framework';
import { usePatientSearchPaginated } from '../patient-search.resource';
import EmptyDataIllustration from '../ui-components/empty-data-illustration.component';
import Pagination from '../ui-components/pagination/pagination.component';
import PatientBanner, { PatientBannerSkeleton } from './patient-banner/banner/patient-banner.component';
import styles from './patient-search-lg.scss';

interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  onPatientSelect?: (patientUuid: string) => void;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({
  query,
  stickyPagination,
  onPatientSelect,
  inTabletOrOverlay,
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const resultsToShow = inTabletOrOverlay ? 15 : 5;
  const {
    isLoading,
    data: searchResults,
    fetchError,
    hasMore,
    totalResults,
  } = usePatientSearchPaginated(query, !!query, resultsToShow, currentPage);

  useEffect(() => {
    if (!isLoading) {
      setPages(Math.ceil(totalResults / resultsToShow));
    }
  }, [isLoading, totalResults, resultsToShow]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

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
    [config, onPatientSelect],
  );

  if (!query) {
    return (
      <>
        <h2 className={`${styles.resultsHeader} ${inTabletOrOverlay && styles.leftPaddedResultHeader}`}>
          <span className={styles.productiveHeading02}>0 {t('seachResultsSmall', 'search results')}</span>
        </h2>
        <Layer>
          <Tile
            className={`${styles.emptySearchResultsTile} ${inTabletOrOverlay && styles.paddedEmptySearchResultsTile}`}>
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
      </>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={`${styles.searchResults} ${stickyPagination && styles.broadBottomMargin}`}>
          <div>
            <h2
              className={`${styles.resultsHeader} ${styles.paddedResultsHeader} ${
                inTabletOrOverlay && styles.leftPaddedResultHeader
              }`}>
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
          <div className={`${styles.pagination} ${stickyPagination && styles.stickyPagination}`}>
            <Pagination
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              hasMore={hasMore}
              totalPages={pages}
            />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <Layer>
        <Tile
          className={`${styles.emptySearchResultsTile} ${inTabletOrOverlay && styles.paddedEmptySearchResultsTile}`}>
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
    );
  }

  if (isEmpty(searchResults)) {
    return (
      <>
        <h2 className={`${styles.resultsHeader} ${inTabletOrOverlay && styles.leftPaddedResultHeader}`}>
          <span className={styles.productiveHeading02}>0 {t('seachResultsSmall', 'search results')}</span>
        </h2>
        <Layer>
          <Tile
            className={`${styles.emptySearchResultsTile} ${inTabletOrOverlay && styles.paddedEmptySearchResultsTile}`}>
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
      </>
    );
  }

  return (
    <div>
      <div className={`${styles.searchResults} ${stickyPagination && styles.broadBottomMargin}`}>
        <h2 className={`${styles.resultsHeader} ${inTabletOrOverlay && styles.leftPaddedResultHeader}`}>
          <span className={styles.productiveHeading02}>
            {totalResults} {t('seachResultsSmall', 'search results')}
          </span>
        </h2>
        <div className={styles.results}>
          {searchResults.map((patient) => (
            <PatientBanner onPatientSelect={handlePatientSelection} patientUuid={patient.uuid} patient={patient} />
          ))}
        </div>
      </div>
      <div className={`${styles.pagination} ${stickyPagination && styles.stickyPagination}`}>
        <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} hasMore={hasMore} totalPages={pages} />
      </div>
    </div>
  );
};

export default PatientSearchComponent;
