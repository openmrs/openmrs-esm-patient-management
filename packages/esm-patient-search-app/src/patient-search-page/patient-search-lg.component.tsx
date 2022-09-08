import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import { interpolateString, navigate, useConfig, usePagination } from '@openmrs/esm-framework';
import Pagination from '../ui-components/pagination/pagination.component';
import styles from './patient-search-lg.scss';
import {
  EmptyQueryIllustration,
  EmptySearchResultsIllustration,
  FetchErrorIllustration,
  LoadingSearchResults,
  PatientSearchResults,
} from './patient-search-views';
import { SearchedPatient } from '../types';

interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  hidePanel?: () => void;
  searchResults: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({
  query,
  stickyPagination,
  selectPatientAction,
  inTabletOrOverlay,
  hidePanel,
  searchResults,
  isLoading,
  fetchError,
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const resultsToShow = inTabletOrOverlay ? 15 : 5;
  const totalResults = searchResults.length;

  const { results, goTo, totalPages, currentPage, showNextButton, showPreviousButton, paginated } = usePagination(
    searchResults,
    resultsToShow,
  );

  useEffect(() => {
    goTo(1);
  }, [query, goTo]);

  const handlePatientSelection = useCallback(
    (evt, patientUuid: string) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patientUuid);
      } else {
        navigate({
          to: `${interpolateString(config.search.patientResultUrl, {
            patientUuid: patientUuid,
          })}/${encodeURIComponent(config.search.redirectToPatientDashboard)}`,
        });
      }
      if (hidePanel) {
        hidePanel();
      }
    },
    [config, selectPatientAction, hidePanel],
  );

  const searchResultsView = useMemo(() => {
    if (!query) {
      return <EmptyQueryIllustration inTabletOrOverlay={inTabletOrOverlay} />;
    }

    if (isLoading) {
      return <LoadingSearchResults />;
    }

    if (fetchError) {
      return <FetchErrorIllustration inTabletOrOverlay={inTabletOrOverlay} />;
    }

    if (isEmpty(results)) {
      return <EmptySearchResultsIllustration inTabletOrOverlay={inTabletOrOverlay} />;
    }

    return <PatientSearchResults searchResults={results} handlePatientSelection={handlePatientSelection} />;
  }, [query, isLoading, inTabletOrOverlay, results, handlePatientSelection, fetchError]);

  return (
    <div className={`${!inTabletOrOverlay ? styles.searchResultsDesktop : styles.searchResultsTabletOrOverlay}`}>
      <div className={`${stickyPagination && styles.broadBottomMargin}`}>
        <h2
          className={`${styles.resultsHeader} ${styles.productiveHeading02} ${
            inTabletOrOverlay && styles.leftPaddedResultHeader
          }`}>
          {!isLoading
            ? `${totalResults ?? 0} ${t('seachResultsSmall', 'search results')}`
            : t('searchingText', 'Searching...')}
        </h2>
        {searchResultsView}
      </div>
      {paginated && (
        <div className={`${styles.pagination} ${stickyPagination && styles.stickyPagination}`}>
          <Pagination
            setCurrentPage={goTo}
            currentPage={currentPage}
            hasMore={showNextButton}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default PatientSearchComponent;
