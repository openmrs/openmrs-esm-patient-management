import { navigate, useLayoutType } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PatientSearchContextProvider } from '../patient-search-context';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';
import styles from './patient-search-page.scss';

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
        <PatientSearchContextProvider value={{}}>
          
          {/* NEW: Show helper message when user searches */}
          {searchQuery && (
            <p style={{ marginBottom: '10px' }}>
              Showing results for: <strong>{searchQuery}</strong>
            </p>
          )}

          <AdvancedPatientSearchComponent
            inTabletOrOverlay={isTablet}
            query={searchQuery}
            stickyPagination
          />

          {/* NEW: Simple empty hint */}
          {searchQuery && (
            <p style={{ marginTop: '10px', color: '#6f6f6f' }}>
              If no results appear, try searching with a different name or identifier.
            </p>
          )}

        </PatientSearchContextProvider>
      </div>
    </div>
  );
};

export default PatientSearchPageComponent;
