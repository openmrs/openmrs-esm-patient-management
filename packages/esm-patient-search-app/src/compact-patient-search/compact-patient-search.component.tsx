import React, { useState } from 'react';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';
import PatientSearch from './patient-search.component';

const CompactPatientSearchComponent = ({ query }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar small initialSearchTerm={query ?? ''} setGlobalSearchTerm={setSearchTerm} />
      {!!searchTerm && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
