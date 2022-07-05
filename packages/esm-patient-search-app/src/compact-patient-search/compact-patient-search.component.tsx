import { navigate } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';
import PatientSearch from './patient-search.component';

interface CompactPatientSearchProps {
  query: string;
  searchPage: boolean;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({ query, searchPage = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const onSubmit = useCallback(
    (searchTerm) => {
      if (!searchPage) {
        window.localStorage.setItem('searchReturnUrl', window.location.pathname);
      }
      navigate({
        to: `\${openmrsSpaBase}/search/${searchTerm}`,
      });
    },
    [navigate, window.localStorage, searchPage],
  );

  const onClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        small
        initialSearchTerm={query ?? ''}
        onChange={setSearchTerm}
        onSubmit={onSubmit}
        onClear={onClear}
      />
      {!!searchTerm && !searchPage && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
