import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
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
import { SearchedPatient, SearchMode } from '../types';
import { MPISearchBasedFeatureCard } from '../mpi/components/mpi-search-drawer/mpi-search-based-feature-card';
import { EmptySearchResultsIllustrationAlt } from '../mpi/components/empty-state/empty-state-illustration';

interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  hidePanel?: () => void;
  searchResults: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error;
  searchMode: SearchMode;
}

interface PatientSearchStatusProps {
  type: 'INTERNAL' | 'EXTERNAL';
  isLoading: boolean;
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
  searchMode,
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const resultsToShow = inTabletOrOverlay ? 15 : 5;
  const totalResults = searchResults.length;
  const searchResultsText = useMemo(
    () =>
      searchMode == 'External'
        ? t('externalSeachResults', 'external search results')
        : t('seachResultsSmall', 'search results'),
    [searchMode],
  );

  const { results, goTo, totalPages, currentPage, showNextButton, paginated } = usePagination(
    searchResults,
    resultsToShow,
  );

  useEffect(() => {
    goTo(1);
  }, [query]);

  const showMPISearchDrawer = useMemo(
    () => searchMode == 'Internal' && !inTabletOrOverlay && !isLoading && totalResults > 0,
    [searchMode, inTabletOrOverlay, isLoading, totalResults],
  );

  const handlePatientSelection = useCallback(
    (evt, patientUuid: string) => {
      evt.preventDefault();

      if (searchMode == 'External') {
        // Chances are high that this is none existing patient.
        // Just return
        return;
      }
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
    [config, selectPatientAction, hidePanel, searchMode],
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
      return (
        <EmptySearchResultsIllustration
          inTabletOrOverlay={inTabletOrOverlay}
          searchMode={searchMode}
          searchTerm={query}
          mpiConfig={config?.MPI}
        />
      );
    }

    return (
      <>
        <PatientSearchResults
          searchResults={results}
          handlePatientSelection={handlePatientSelection}
          searchMode={searchMode}
          mpiConfig={config.MPI}
        />
      </>
    );
  }, [query, isLoading, inTabletOrOverlay, results, handlePatientSelection, fetchError, searchMode]);

  return (
    <div className={`${!inTabletOrOverlay ? styles.searchResultsDesktop : styles.searchResultsTabletOrOverlay}`}>
      <div className={`${stickyPagination && styles.broadBottomMargin}`}>
        <h2
          className={`${styles.resultsHeader} ${styles.productiveHeading02} ${
            inTabletOrOverlay && styles.leftPaddedResultHeader
          }`}>
          {!isLoading ? `${totalResults ?? 0} ${searchResultsText}` : t('searchingText', 'Searching...')}
        </h2>
        {searchResultsView}
        {showMPISearchDrawer && (
          <div style={{ marginTop: '1rem' }}>
            <MPISearchBasedFeatureCard searchTerm={query} mpiConfig={config.MPI} />
          </div>
        )}
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
