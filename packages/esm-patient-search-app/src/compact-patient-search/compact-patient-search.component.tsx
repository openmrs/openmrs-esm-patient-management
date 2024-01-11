import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import debounce from 'lodash-es/debounce';
import { navigate, interpolateString, useConfig, useSession } from '@openmrs/esm-framework';
import type { SearchedPatient } from '../types';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import RecentPatientSearch from './recent-patient-search.component';
import useArrowNavigation from '../hooks/useArrowNavigation';
import { useRecentlyViewedPatients, useInfinitePatientSearch, useRESTPatients } from '../patient-search.resource';
import styles from './compact-patient-search.scss';
import { PatientSearchContext } from '../patient-search-context';

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
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const showSearchResults = useMemo(() => !!searchTerm.trim(), [searchTerm]);
  const bannerContainerRef = useRef(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const config = useConfig();
  const patientSearchResponse = useInfinitePatientSearch(searchTerm, config.includeDead, showSearchResults);
  const { data: searchedPatients } = patientSearchResponse;
  const { recentlyViewedPatients, addViewedPatient, mutateUserProperties } = useRecentlyViewedPatients();
  const recentPatientSearchResponse = useRESTPatients(recentlyViewedPatients, !showSearchResults);
  const { data: recentPatients } = recentPatientSearchResponse;
  const {
    user,
    sessionLocation: { uuid: currentLocation },
  } = useSession();

  const handleFocusToInput = useCallback(() => {
    const len = searchInputRef.current.value?.length ?? 0;
    searchInputRef.current.setSelectionRange(len, len);
    searchInputRef.current.focus();
  }, [searchInputRef]);

  const handleCloseSearchResults = useCallback(() => {
    setSearchTerm('');
    onPatientSelect?.();
  }, [onPatientSelect, setSearchTerm]);

  const addViewedPatientAndCloseSearchResults = useCallback(
    (patientUuid: string) => {
      addViewedPatient(patientUuid).then(() => {
        mutateUserProperties();
      });
      handleCloseSearchResults();
    },
    [handleCloseSearchResults, mutateUserProperties, addViewedPatient],
  );

  const handlePatientSelection = useCallback(
    (evt, index: number, patients: Array<SearchedPatient>) => {
      evt.preventDefault();
      if (patients) {
        addViewedPatientAndCloseSearchResults(patients[index].uuid);
        navigate({
          to: `${interpolateString(config.search.patientResultUrl, {
            patientUuid: patients[index].uuid,
          })}`,
        });
      }
    },
    [config.search.patientResultUrl, user, currentLocation],
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

  const handleSubmit = useCallback(
    (searchTerm) => {
      if (shouldNavigateToPatientSearchPage && searchTerm.trim()) {
        if (!isSearchPage) {
          window.sessionStorage.setItem('searchReturnUrl', window.location.pathname);
        }
        navigate({
          to: `\${openmrsSpaBase}/search?query=${encodeURIComponent(searchTerm)}`,
        });
      }
    },
    [isSearchPage, shouldNavigateToPatientSearchPage],
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleSearchQueryChange = debounce((val) => setSearchTerm(val), 300);

  return (
    <PatientSearchContext.Provider
      value={{
        patientClickSideEffect: addViewedPatientAndCloseSearchResults,
      }}>
      <div className={styles.patientSearchBar}>
        <PatientSearchBar
          small
          initialSearchTerm={initialSearchTerm ?? ''}
          onChange={handleSearchQueryChange}
          onSubmit={handleSubmit}
          onClear={handleClear}
          ref={searchInputRef}
        />
        {!isSearchPage &&
          (showSearchResults ? (
            <div className={styles.floatingSearchResultsContainer} data-testid="floatingSearchResultsContainer">
              <PatientSearch query={searchTerm} ref={bannerContainerRef} {...patientSearchResponse} />
            </div>
          ) : (
            <>
              <div className={styles.floatingSearchResultsContainer} data-testid="floatingSearchResultsContainer">
                <RecentPatientSearch ref={bannerContainerRef} {...recentPatientSearchResponse} />
              </div>
            </>
          ))}
      </div>
    </PatientSearchContext.Provider>
  );
};

export default CompactPatientSearchComponent;
