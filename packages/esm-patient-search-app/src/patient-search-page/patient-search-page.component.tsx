import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDesktop, navigate, useLayoutType } from '@openmrs/esm-framework';
import PatientSearchComponent from './patient-search-lg.component';
import styles from './patient-search-page.scss';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';

interface PatientSearchPageComponentProps {}

const PatientSearchPageComponent: React.FC<PatientSearchPageComponentProps> = () => {
  const [searchParams] = useSearchParams();
  const layout = useLayoutType();

  const handleCloseOverlay = useCallback(() => {
    const returnUrl = window.localStorage.getItem('searchReturnUrl');
    if (returnUrl) window.localStorage.removeItem('searchReturnUrl');
    navigate({
      to: returnUrl ?? window['getOpenmrsSpaBase'](),
    });
  }, []);

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
    <PatientSearchOverlay onClose={handleCloseOverlay} query={searchParams?.get('query') ?? ''} />
  );
};

export default PatientSearchPageComponent;
