import React, { useCallback, useState } from 'react';
import { navigate } from '@openmrs/esm-framework';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';

interface CompactPatientSearchProps {
  isSearchPage: boolean;
  initialSearchTerm: string;
  selectPatientAction?: (patientUuid: string) => undefined;
  shouldNavigateToPatientSearchPage?: boolean;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  selectPatientAction,
  initialSearchTerm,
  isSearchPage,
  shouldNavigateToPatientSearchPage,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const onSubmit = useCallback(
    (searchTerm) => {
      if (shouldNavigateToPatientSearchPage) {
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

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        small
        initialSearchTerm={initialSearchTerm ?? ''}
        onChange={setSearchTerm}
        onSubmit={onSubmit}
        onClear={onClear}
      />
      {!!searchTerm && !isSearchPage && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} selectPatientAction={selectPatientAction} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
