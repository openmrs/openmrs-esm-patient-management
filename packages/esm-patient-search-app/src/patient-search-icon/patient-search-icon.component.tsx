import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderGlobalAction } from '@carbon/react';
import { Close, Search } from '@carbon/react/icons';
import { isDesktop, navigate, useLayoutType, useOnClickOutside } from '@openmrs/esm-framework';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
import CompactPatientSearchComponent from '../compact-patient-search/compact-patient-search.component';
import styles from './patient-search-icon.scss';
import { useParams, useSearchParams } from 'react-router-dom';

interface PatientSearchLaunchProps {}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { page } = useParams();
  const isSearchPage = useMemo(() => page === 'search', [page]);
  const [searchParams] = useSearchParams();
  const initialSearchTerm = isSearchPage ? searchParams.get('query') : '';

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [canClickOutside, setCanClickOutside] = useState(false);

  const handleCloseSearchInput = useCallback(() => {
    // Clicking outside of the search input when "/search" page is open should not close the search input.
    // In tabletView, the overlay should be closed when the overlay's back button (<-) is clicked
    if (isDesktop(layout) && !isSearchPage) {
      setShowSearchInput(false);
    }
  }, [setShowSearchInput, isSearchPage, layout]);

  const ref = useOnClickOutside<HTMLDivElement>(handleCloseSearchInput, canClickOutside);

  const handleGlobalAction = useCallback(() => {
    if (showSearchInput) {
      if (isSearchPage) {
        navigate({
          to: window.localStorage.getItem('searchReturnUrl') ?? '${openmrsSpaBase}/',
        });
        window.localStorage.removeItem('searchReturnUrl');
      }
      setShowSearchInput(false);
    } else {
      setShowSearchInput(true);
    }
  }, [isSearchPage, setShowSearchInput, showSearchInput]);

  const resetToInitialState = useCallback(() => {
    setShowSearchInput(false);
    setCanClickOutside(false);
  }, [setShowSearchInput, setCanClickOutside]);

  useEffect(() => {
    // Search input should always be open when we direct to the search page.
    setShowSearchInput(isSearchPage);
    if (isSearchPage) {
      setCanClickOutside(false);
    }
  }, [isSearchPage]);

  useEffect(() => {
    showSearchInput ? setCanClickOutside(true) : setCanClickOutside(false);
  }, [showSearchInput]);

  return (
    <div className={styles.patientSearchIconWrapper} ref={ref}>
      {showSearchInput &&
        (isDesktop(layout) ? (
          <CompactPatientSearchComponent
            isSearchPage={isSearchPage}
            initialSearchTerm={initialSearchTerm}
            shouldNavigateToPatientSearchPage
            onPatientSelect={resetToInitialState}
          />
        ) : (
          <PatientSearchOverlay onClose={handleGlobalAction} query={initialSearchTerm} />
        ))}

      <div className={`${showSearchInput && styles.closeButton}`}>
        <HeaderGlobalAction
          aria-label={t('searchPatient', 'Search Patient')}
          aria-labelledby="Search Patient"
          className={`${showSearchInput ? styles.activeSearchIconButton : styles.searchIconButton}`}
          enterDelayMs={500}
          name="SearchPatientIcon"
          onClick={handleGlobalAction}>
          {showSearchInput ? <Close size={20} /> : <Search size={20} />}
        </HeaderGlobalAction>
      </div>
    </div>
  );
};

export default PatientSearchLaunch;
