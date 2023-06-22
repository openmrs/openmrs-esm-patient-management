import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { navigate, interpolateString, useConfig } from '@openmrs/esm-framework';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';
import { SearchedPatient } from '../types';
import debounce from 'lodash-es/debounce';
import useArrowNavigation from '../hooks/useArrowNavigation';
import { usePatientSearchInfinite } from '../patient-search.resource';

interface CompactPatientSearchProps {
  isSearchPage: boolean;
  initialSearchTerm: string;
  selectPatientAction?: (patient: SearchedPatient) => undefined;
  onPatientSelect?: () => void;
  shouldNavigateToPatientSearchPage?: boolean;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  selectPatientAction,
  initialSearchTerm,
  isSearchPage,
  onPatientSelect,
  shouldNavigateToPatientSearchPage,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const showSearchResults = useMemo(() => !!searchTerm.trim(), [searchTerm]);
  const bannerContainerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = useConfig();
  const patientSearchResponse = usePatientSearchInfinite(searchTerm, config.includeDead, showSearchResults);
  const { data: patients } = patientSearchResponse;

  const handleFocusToInput = useCallback(() => {
    var len = inputRef.current.value?.length ?? 0;
    inputRef.current.setSelectionRange(len, len);
    inputRef.current.focus();
  }, [inputRef]);

  const handleCloseSearchResults = useCallback(() => {
    setSearchTerm('');
    onPatientSelect?.();
  }, [onPatientSelect, setSearchTerm]);

  const handlePatientSelection = useCallback(
    (evt, index: number) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patients[index]);
      } else {
        navigate({
          to: `${interpolateString(config.search.patientResultUrl, {
            patientUuid: patients[index].uuid,
          })}`,
        });
      }
      handleCloseSearchResults();
    },
    [config.search, selectPatientAction, patients, handleCloseSearchResults],
  );
  const focussedResult = useArrowNavigation(patients?.length ?? 0, handlePatientSelection, handleFocusToInput, -1);

  useEffect(() => {
    if (bannerContainerRef.current && focussedResult > -1) {
      bannerContainerRef.current.children?.[focussedResult]?.focus();
      bannerContainerRef.current.children?.[focussedResult]?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    } else if (bannerContainerRef.current && inputRef.current && focussedResult === -1) {
      handleFocusToInput();
    }
  }, [focussedResult, bannerContainerRef, handleFocusToInput]);

  const onSubmit = useCallback(
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

  const onClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleSearchQueryChange = debounce((val) => setSearchTerm(val), 300);

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        small
        initialSearchTerm={initialSearchTerm ?? ''}
        onChange={handleSearchQueryChange}
        onSubmit={onSubmit}
        onClear={onClear}
        ref={inputRef}
      />
      {!isSearchPage && showSearchResults && (
        <div className={styles.floatingSearchResultsContainer} data-testid="floatingSearchResultsContainer">
          <PatientSearch
            query={searchTerm}
            selectPatientAction={handlePatientSelection}
            ref={bannerContainerRef}
            {...patientSearchResponse}
          />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
