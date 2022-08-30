import React, { useCallback, useState, useMemo } from 'react';
import PatientSearch from '../compact-patient-search/patient-search.component';
import PatientSearchBar from './patient-search-bar.component';
import styles from './compact-patient-search.scss';
import { SearchedPatient } from '../types';
import debounce from 'lodash-es/debounce';

interface CompactPatientSearchProps {
  initialSearchTerm: string;
  selectPatientAction?: (patient: SearchedPatient) => undefined;
  buttonProps?: Object;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  selectPatientAction,
  initialSearchTerm = '',
  buttonProps,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const handleSearchTerm = debounce((val) => setSearchTerm(val), 300);
  const showSearchResults = useMemo(() => !!searchTerm.trim(), [searchTerm]);

  const onClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        initialSearchTerm={initialSearchTerm ?? ''}
        onChange={handleSearchTerm}
        onSubmit={handleSearchTerm}
        onClear={onClear}
        buttonProps={buttonProps}
      />
      {showSearchResults && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} selectPatientAction={selectPatientAction} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
