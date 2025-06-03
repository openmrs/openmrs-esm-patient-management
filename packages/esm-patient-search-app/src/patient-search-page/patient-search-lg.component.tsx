import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@openmrs/esm-framework';
import type { SearchedPatient } from '../types';
import { EmptyState, ErrorState, LoadingState, PatientSearchResults } from './patient-search-views.component';
import Pagination from '../ui-components/pagination/pagination.component';
import styles from './patient-search-lg.scss';
import { inferModeFromSearchParams } from '../mpi/utils';
import { useSearchParams } from '../hooks/useSearchParams';
interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  searchResults: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error | null;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({
  query,
  stickyPagination,
  inTabletOrOverlay,
  searchResults,
  isLoading,
  fetchError,
}) => {
  const { t } = useTranslation();
  const resultsToShow = inTabletOrOverlay ? 15 : 20;
  const totalResults = searchResults.length;
  const searchParams = useSearchParams();
  const searchMode = inferModeFromSearchParams(searchParams);

  const { results, goTo, totalPages, currentPage, showNextButton, paginated } = usePagination(
    searchResults,
    resultsToShow,
  );

  useEffect(() => {
    goTo(1);
  }, [query, goTo]);

  const searchResultsView = useMemo(() => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (fetchError) {
      return <ErrorState />;
    }

    if (!isLoading && (!results || results.length === 0)) {
      return <EmptyState searchTerm={query} />;
    }

    return <PatientSearchResults searchResults={results} searchTerm={query} searchMode={searchMode} />;
  }, [query, isLoading, results, fetchError, searchMode]);

  return (
    <div
      className={classNames({
        [styles.searchResultsDesktop]: !inTabletOrOverlay,
        [styles.searchResultsTabletOrOverlay]: inTabletOrOverlay,
      })}>
      <div
        className={classNames({
          [styles.broadBottomMargin]: stickyPagination,
        })}>
        <h2
          className={classNames(styles.resultsHeader, styles.productiveHeading02, {
            [styles.leftPaddedResultHeader]: inTabletOrOverlay,
          })}>
          {isLoading
            ? t('searchingText', 'Searching...')
            : t('searchResultsCount', '{{count}} search result', {
                count: totalResults,
              })}
        </h2>
        {searchResultsView}
      </div>
      {paginated ? (
        <div
          className={classNames(styles.pagination, {
            [styles.stickyPagination]: stickyPagination,
          })}>
          <Pagination
            setCurrentPage={goTo}
            currentPage={currentPage}
            hasMore={showNextButton}
            totalPages={totalPages}
          />
        </div>
      ) : (
        <div className={styles.spacer} />
      )}
    </div>
  );
};

export default PatientSearchComponent;
