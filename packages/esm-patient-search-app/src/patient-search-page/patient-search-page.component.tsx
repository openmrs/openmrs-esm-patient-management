import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
import styles from './patient-search-page.scss';
/**
 * PatientSearchPageComponent is the main route component for the standalone `/search` page.
 *
 * In desktop mode, it renders the PatientSearchLgComponent. In tablet mode, it triggers
 * the PatientSearchOverlay instead to save space.
 */
interface PatientSearchPageComponentProps {}

const PatientSearchPageComponent: React.FC<PatientSearchPageComponentProps> = () => {
  const [searchParams] = useSearchParams();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const searchQuery = searchParams?.get('query') ?? '';

  // If a user directly falls on openmrs/spa/search?query= in a tablet view.
  // On clicking the <- on the overlay should take the user on the home page.
  // P.S. The user will never be directed to the patient search page (above URL) in a tablet view otherwise.
  const handleCloseOverlay = useCallback(() => {
    navigate({
      to: window['getOpenmrsSpaBase'](),
    });
  }, []);

  if (isTablet) {
    return <PatientSearchOverlay onClose={handleCloseOverlay} query={searchQuery} />;
  }

  return (
    <div className={styles.patientSearchPage}>
      <div className={styles.patientSearchComponent}>
        <AdvancedPatientSearchComponent inTabletOrOverlay={isTablet} query={searchQuery} stickyPagination />
      </div>
    </div>
  );
};

export default PatientSearchPageComponent;
