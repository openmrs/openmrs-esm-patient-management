import React, { useCallback, useMemo, useState } from 'react';
import { navigate, useConfig, interpolateString } from '@openmrs/esm-framework';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';
import { SearchedPatient } from '../types';
import debounce from 'lodash-es/debounce';

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
  const config = useConfig();

  const handleCloseSearchResults = useCallback(() => {
    setSearchTerm('');
    onPatientSelect?.();
  }, [onPatientSelect, setSearchTerm]);

  const onSearchResultClick = useCallback(
    (evt, patient: SearchedPatient) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patient);
      } else {
        navigate({
          to: `${interpolateString(config.search.patientResultUrl, {
            patientUuid: patient.uuid,
          })}/${encodeURIComponent(config.search.redirectToPatientDashboard)}`,
        });
      }
      handleCloseSearchResults();
    },
    [config.search, handleCloseSearchResults, selectPatientAction],
  );

  const onSubmit = useCallback(
    (searchTerm) => {
      if (shouldNavigateToPatientSearchPage && searchTerm.trim()) {
        if (!isSearchPage) {
          window.localStorage.setItem('searchReturnUrl', window.location.pathname);
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
      />
      {!isSearchPage && showSearchResults && (
        <div
          className={styles.floatingSearchResultsContainer}
          style={{
            maxHeight: '22rem',
          }}>
          <PatientSearch query={searchTerm} selectPatientAction={onSearchResultClick} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
