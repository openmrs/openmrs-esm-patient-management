import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@openmrs/esm-framework';
import type { SearchedPatient } from '../types';
import { EmptyState, ErrorState, LoadingState, PatientSearchResults } from './patient-search-views.component';
import Pagination from '../ui-components/pagination/pagination.component';
import styles from './patient-search-lg.scss';

interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  searchResults: Array<SearchedPatient>;
  /** True when the refine filters, not the query, left the results empty. */
  emptiedByFilters?: boolean;
  isLoading: boolean;
  fetchError: Error | null;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({
  query,
  stickyPagination,
  inTabletOrOverlay,
  searchResults,
  emptiedByFilters = false,
  isLoading,
  fetchError,
}) => {
  const { t } = useTranslation();
  const resultsToShow = inTabletOrOverlay ? 15 : 20;
  const totalResults = searchResults.length;

  const { results, goTo, totalPages, currentPage, showNextButton, paginated } = usePagination(
    searchResults,
    resultsToShow,
  );

  // `goTo` from `usePagination` is rebuilt whenever `totalPages` changes, and `totalPages` grows
  // as the infinite search appends server pages. Depending on `goTo` alone would therefore snap the
  // user back to page 1 every time another page of results lands.
  //
  // Reset on a new query, and whenever the selected page falls outside the result set: `usePagination`
  // holds its page in state and only clamps inside `goTo`, so a refine filter — which narrows the rows
  // on the client under an unchanged query — can leave the page pointing past the end, rendering the
  // empty state under a non-zero result count.
  const previousQueryRef = useRef(query);
  useEffect(() => {
    const queryChanged = previousQueryRef.current !== query;
    previousQueryRef.current = query;

    if (queryChanged || currentPage > totalPages) {
      goTo(1);
    }
  }, [query, currentPage, totalPages, goTo]);

  const searchResultsView = useMemo(() => {
    // Only show the full skeleton when there is nothing to show
    if (isLoading && !results?.length) {
      return <LoadingState />;
    }

    if (fetchError) {
      return <ErrorState />;
    }

    if (!isLoading && (!results || results.length === 0)) {
      return emptiedByFilters ? (
        <EmptyState
          title={t('noPatientsMatchFilters', 'No patients match these filters')}
          hint={t('adjustFiltersHint', 'Remove or change a filter to see more patients')}
        />
      ) : (
        <EmptyState />
      );
    }

    return <PatientSearchResults searchResults={results} />;
  }, [emptiedByFilters, fetchError, isLoading, results, t]);

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
