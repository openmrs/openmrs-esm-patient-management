import React, { useCallback, useMemo, useState } from 'react';
import { navigate } from '@openmrs/esm-framework';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';

interface CompactPatientSearchProps {
  isSearchPage: boolean;
  initialSearchTerm: string;
  selectPatientAction?: (patientUuid: string) => undefined;
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

  const onSubmit = useCallback(
    (searchTerm) => {
      if (shouldNavigateToPatientSearchPage && searchTerm) {
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

  const handleCloseSearchResults = () => {
    setSearchTerm('');
    // onPatientSelect?.();
  };

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        small
        initialSearchTerm={initialSearchTerm ?? ''}
        onChange={setSearchTerm}
        onSubmit={onSubmit}
        onClear={onClear}
      />
      {!isSearchPage && showSearchResults && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch
            query={searchTerm}
            selectPatientAction={selectPatientAction}
            hidePanel={handleCloseSearchResults}
          />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
