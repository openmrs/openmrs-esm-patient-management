import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import PatientSearchComponent from './patient-search-lg.component';
import styles from './patient-search-page.scss';

interface PatientSearchPageComponentProps {}

const PatientSearchPageComponent: React.FC<PatientSearchPageComponentProps> = () => {
  const [searchParams] = useSearchParams();
  const layout = useLayoutType();

  return isDesktop(layout) ? (
    <div className={styles.patientSearchPage}>
      <div className={styles.patientSearchComponent}>
        <PatientSearchComponent
          query={searchParams?.get('query') ?? ''}
          inTabletOrOverlay={!isDesktop(layout)}
          stickyPagination
        />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PatientSearchPageComponent;
