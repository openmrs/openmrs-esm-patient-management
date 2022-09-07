import React, { useState } from 'react';
import { AdvancedPatientSearchState } from '../types';
import styles from './advanced-patient-search.scss';
import { initialState } from './advanced-search-reducer';
import PatientSearchComponent from './patient-search-lg.component';
import RefineSearch from './refine-search.component';

interface AdvancedPatientSearchProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  hidePanel?: () => void;
}

const AdvancedPatientSearchComponent: React.FC<AdvancedPatientSearchProps> = (props) => {
  const [filters, setFilters] = useState<AdvancedPatientSearchState>(initialState);
  return (
    <div className={styles.advancedPatientSearch}>
      <div className={styles.refineSearch}>
        <RefineSearch setFilters={setFilters} />
      </div>
      <div className={styles.patientSearchResults}>
        <PatientSearchComponent {...props} />
      </div>
    </div>
  );
};

export default AdvancedPatientSearchComponent;
