import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import { interpolateString, navigate, useConfig } from '@openmrs/esm-framework';
import { usePatientSearchPaginated } from '../patient-search.resource';
import Pagination from '../ui-components/pagination/pagination.component';
import styles from './patient-search-lg.scss';
import {
  EmptyQueryIllustration,
  EmptySearchResultsIllustration,
  FetchErrorIllustration,
  LoadingSearchResults,
  PatientSearchResults,
} from './patient-search-views';

interface PatientSearchComponentProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  hidePanel?: () => void;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({
  query,
  stickyPagination,
  selectPatientAction,
  inTabletOrOverlay,
  hidePanel,
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

    if (isEmpty(searchResults)) {
      return <EmptySearchResultsIllustration inTabletOrOverlay={inTabletOrOverlay} />;
    }

    return <PatientSearchResults searchResults={searchResults} handlePatientSelection={handlePatientSelection} />;
  }, [query, isLoading, inTabletOrOverlay, searchResults, handlePatientSelection, fetchError]);

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
      {pages && (
        <div className={`${styles.pagination} ${stickyPagination && styles.stickyPagination}`}>
          <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} hasMore={hasMore} totalPages={pages} />
        </div>
      )}
    </div>
  );
};

export default PatientSearchComponent;
