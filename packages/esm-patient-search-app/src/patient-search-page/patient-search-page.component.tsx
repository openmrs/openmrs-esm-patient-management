import React from 'react';
import { useParams } from 'react-router-dom';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import PatientSearchComponent from './patient-search-lg.component';
import styles from './patient-search-page.scss';

interface PatientSearchPageComponentProps {
  query?: string;
}

const PatientSearchPageComponent: React.FC<PatientSearchPageComponentProps> = () => {
  const { query } = useParams();
  const layout = useLayoutType();

  return isDesktop(layout) ? (
    <div className={styles.patientSearchPage}>
      <div className={styles.patientSearchComponent}>
        <PatientSearchComponent query={query} inTabletOrOverlay={!isDesktop(layout)} stickyPagination />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PatientSearchPageComponent;
