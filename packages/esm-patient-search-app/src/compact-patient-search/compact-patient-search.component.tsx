import React, { useCallback, useState } from 'react';
import { navigate } from '@openmrs/esm-framework';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';

interface CompactPatientSearchProps {
  query: string;
  searchPage: boolean;
  selectPatientAction?: (patientUuid: string) => undefined;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  query,
  searchPage = false,
  selectPatientAction,
}) => {
  const [searchTerm, setSearchTerm] = useState(query);

  const onSubmit = useCallback(
    (searchTerm) => {
      if (!searchPage) {
        window.localStorage.setItem('searchReturnUrl', window.location.pathname);
      }
      navigate({
        to: `\${openmrsSpaBase}/search/${searchTerm}`,
      });
    },
    [searchPage],
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
          <PatientSearch query={searchTerm} selectPatientAction={selectPatientAction} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
