import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, interpolateString, useConfig, useSession, useDebounce, showSnackbar } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { type SearchedPatient } from '../types';
import { useRecentlyViewedPatients, useInfinitePatientSearch, useRestPatients } from '../patient-search.resource';
import { PatientSearchContext } from '../patient-search-context';
import useArrowNavigation from '../hooks/useArrowNavigation';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import RecentlySearchedPatients from './recently-searched-patients.component';
import styles from './compact-patient-search.scss';

interface CompactPatientSearchProps {
  isSearchPage: boolean;
  initialSearchTerm: string;
  onPatientSelect?: () => void;
  shouldNavigateToPatientSearchPage?: boolean;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  initialSearchTerm,
  isSearchPage,
  onPatientSelect,
  shouldNavigateToPatientSearchPage,
}) => {
  const { t } = useTranslation();

  const bannerContainerRef = useRef(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const hasSearchTerm = Boolean(debouncedSearchTerm?.trim());

  const config = useConfig<PatientSearchConfig>();
  const { showRecentlySearchedPatients } = config.search;

  const {
    user,
    sessionLocation: { uuid: currentLocation },
  } = useSession();

  const patientSearchResponse = useInfinitePatientSearch(debouncedSearchTerm, config.includeDead);
  const { data: searchedPatients } = patientSearchResponse;

  const {
    error: errorFetchingUserProperties,
    mutateUserProperties,
    recentlyViewedPatientUuids,
    updateRecentlyViewedPatients,
  } = useRecentlyViewedPatients(showRecentlySearchedPatients);

  const recentPatientSearchResponse = useRestPatients(recentlyViewedPatientUuids, !hasSearchTerm);
  const { data: recentPatients, fetchError } = recentPatientSearchResponse;

  const handleFocusToInput = useCallback(() => {
    if (searchInputRef.current) {
      const inputElement = searchInputRef.current;
      inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
      inputElement.focus();
    }
  }, []);

  const handleCloseSearchResults = useCallback(() => {
    setSearchTerm('');
    onPatientSelect?.();
  }, [onPatientSelect, setSearchTerm]);

  const addViewedPatientAndCloseSearchResults = useCallback(
    async (patientUuid: string) => {
      handleCloseSearchResults();
      try {
        await updateRecentlyViewedPatients(patientUuid);
        await mutateUserProperties();
      } catch (error) {
        showSnackbar({
          kind: 'error',
          title: t('errorUpdatingRecentlyViewedPatients', 'Error updating recently viewed patients'),
          subtitle: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [handleCloseSearchResults, mutateUserProperties, updateRecentlyViewedPatients, t],
  );

  const handlePatientSelection = useCallback(
    (evt, index: number, patients: Array<SearchedPatient>) => {
      evt.preventDefault();
      if (patients) {
        addViewedPatientAndCloseSearchResults(patients[index].uuid);
        navigate({
          to: interpolateString(config.search.patientChartUrl, {
            patientUuid: patients[index].uuid,
          }),
        });
      }
    },
    [addViewedPatientAndCloseSearchResults, config.search.patientChartUrl],
  );
  const focusedResult = useArrowNavigation(
    !recentPatients ? searchedPatients?.length ?? 0 : recentPatients?.length ?? 0,
    handlePatientSelection,
    handleFocusToInput,
    -1,
  );

  useEffect(() => {
    if (bannerContainerRef.current && focusedResult > -1) {
      bannerContainerRef.current.children?.[focusedResult]?.focus();
      bannerContainerRef.current.children?.[focusedResult]?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    } else if (bannerContainerRef.current && searchInputRef.current && focusedResult === -1) {
      handleFocusToInput();
    }
  }, [focusedResult, bannerContainerRef, handleFocusToInput]);

  useEffect(() => {
    if (fetchError) {
      showSnackbar({
        kind: 'error',
        title: t('errorFetchingPatients', 'Error fetching patients'),
        subtitle: fetchError?.message,
      });
    }

    if (errorFetchingUserProperties) {
      showSnackbar({
        kind: 'error',
        title: t('errorFetchingUserProperties', 'Error fetching user properties'),
        subtitle: errorFetchingUserProperties?.message,
      });
    }
  }, [fetchError, errorFetchingUserProperties, t]);

  const handleSubmit = useCallback(
    (debouncedSearchTerm) => {
      if (shouldNavigateToPatientSearchPage && hasSearchTerm) {
        if (!isSearchPage) {
          window.sessionStorage.setItem('searchReturnUrl', window.location.pathname);
        }
        navigate({
          to: `\${openmrsSpaBase}/search?query=${encodeURIComponent(debouncedSearchTerm)}`,
        });
      }
    },
    [isSearchPage, shouldNavigateToPatientSearchPage, hasSearchTerm],
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleSearchTermChange = (searchTerm: string) => setSearchTerm(searchTerm ?? '');

  return (
    <PatientSearchContext.Provider
      value={{
        patientClickSideEffect: addViewedPatientAndCloseSearchResults,
      }}>
      <div className={styles.patientSearchBar}>
        <PatientSearchBar
          isCompact
          initialSearchTerm={initialSearchTerm ?? ''}
          onChange={handleSearchTermChange}
          onSubmit={handleSubmit}
          onClear={handleClear}
          ref={searchInputRef}
        />

        {!isSearchPage && hasSearchTerm && (
          <div className={styles.floatingSearchResultsContainer} data-testid="floatingSearchResultsContainer">
            <PatientSearch query={debouncedSearchTerm} ref={bannerContainerRef} {...patientSearchResponse} />
          </div>
        )}

        {!isSearchPage && !hasSearchTerm && showRecentlySearchedPatients && (
          <div className={styles.floatingSearchResultsContainer} data-testid="floatingSearchResultsContainer">
            <RecentlySearchedPatients ref={bannerContainerRef} {...recentPatientSearchResponse} />
          </div>
        )}
      </div>
    </PatientSearchContext.Provider>
  );
};

export default CompactPatientSearchComponent;
