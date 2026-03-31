import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { PatientSearchContextProvider } from '../patient-search-context';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
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

        {/* Search Query Feedback */}
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

        {/* ERROR / EMPTY STATE CARD */}
        {searchQuery && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#f4f4f4',
              maxWidth: '600px',
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '5px' }}>
              No matching patients found
            </p>
            <p style={{ fontSize: '14px', color: '#6f6f6f' }}>
              Try searching with a different name or identifier.
            </p>
          </div>
        )}

      </PatientSearchContextProvider>
    </div>
  </div>
);

export default PatientSearchPageComponent;
