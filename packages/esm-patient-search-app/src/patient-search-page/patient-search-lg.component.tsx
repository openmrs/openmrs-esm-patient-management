import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@openmrs/esm-framework';
import Pagination from '../ui-components/pagination/pagination.component';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PatientSearchResults,
  SearchResultsEmptyState,
} from './patient-search-views.component';
import type { SearchedPatient } from '../types';
import styles from './patient-search-lg.scss';
import { inferModeFromSearchParams } from '../mpi/utils';
import { useSearchParams } from '../hooks/useSearchParams';
interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  searchResults: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error;
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
    if (!query) {
      return <EmptyState inTabletOrOverlay={inTabletOrOverlay} searchTerm={query} />;
    }

    if (isLoading) {
      return <LoadingState inTabletOrOverlay={inTabletOrOverlay} searchTerm={query} />;
    }

    if (fetchError) {
      return <ErrorState inTabletOrOverlay={inTabletOrOverlay} searchTerm={query} />;
    }

    if (results?.length === 0) {
      return (
        <SearchResultsEmptyState inTabletOrOverlay={inTabletOrOverlay} searchTerm={query} searchMode={searchMode} />
      );
    }

    return <PatientSearchResults searchResults={results} searchTerm={query} searchMode={searchMode} />;
  }, [query, isLoading, inTabletOrOverlay, results, fetchError, searchMode]);

  return (
    <div
      className={classNames({
        [styles.searchResultsDesktop]: !inTabletOrOverlay,
        [styles.searchResultsTabletOrOverlay]: inTabletOrOverlay,
      })}>
      <div className={classNames(stickyPagination, styles.broadBottomMargin)}>
        <h2
          className={classNames(styles.resultsHeader, styles.productiveHeading02, {
            [styles.leftPaddedResultHeader]: inTabletOrOverlay,
          })}>
          {isLoading ? t('searchingText', 'Searching...') : null}
          {!isLoading
            ? t('searchResultsCount', '{{count}} search result', {
                count: totalResults,
              })
            : null}
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
