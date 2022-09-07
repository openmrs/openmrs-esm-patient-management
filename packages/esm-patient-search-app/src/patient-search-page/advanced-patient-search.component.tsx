import { useLayoutType } from '@openmrs/esm-framework';
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
  const { inTabletOrOverlay } = props;
  const [filters, setFilters] = useState<AdvancedPatientSearchState>(initialState);
  return (
    <div
      className={`${
        !inTabletOrOverlay ? styles.advancedPatientSearchDesktop : styles.advancedPatientSearchTabletOrOverlay
      }`}>
      {!inTabletOrOverlay && (
        <div className={styles.refineSearchDesktop}>
          <RefineSearch setFilters={setFilters} inTabletOrOverlay={props.inTabletOrOverlay} />
        </div>
      )}
      <div
        className={`${
          !inTabletOrOverlay ? styles.patientSearchResultsDesktop : styles.patientSearchResultsTabletOrOverlay
        }`}>
        <PatientSearchComponent {...props} />
      </div>
      {inTabletOrOverlay && (
        <div className={styles.refineSearchTabletOrOverlay}>
          <RefineSearch setFilters={setFilters} inTabletOrOverlay={props.inTabletOrOverlay} />
        </div>
      )}
    </div>
  );
};

export default AdvancedPatientSearchComponent;
