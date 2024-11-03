import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { preload } from 'swr';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeaderGlobalAction } from '@carbon/react';
import { Close, Search } from '@carbon/react/icons';
import {
  isDesktop,
  navigate,
  openmrsFetch,
  restBaseUrl,
  useLayoutType,
  useOnClickOutside,
  useSession,
} from '@openmrs/esm-framework';
import CompactPatientSearchComponent from '../compact-patient-search/compact-patient-search.component';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
import styles from './patient-search-icon.scss';
import { PatientSearchContext } from '../patient-search-context';

interface PatientSearchLaunchProps {}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { page } = useParams();
  const { user } = useSession();
  const userUuid = user?.uuid;
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

  const closePatientSearch = useCallback(() => {
    if (isSearchPage) {
      navigate({
        to: window.sessionStorage.getItem('searchReturnUrl') ?? '${openmrsSpaBase}/',
      });
      window.sessionStorage.removeItem('searchReturnUrl');
    }
    setShowSearchInput(false);
  }, [isSearchPage, setShowSearchInput]);

  const handleShowSearchInput = useCallback(() => {
    setShowSearchInput(true);
  }, [setShowSearchInput]);

  const resetToInitialState = useCallback(() => {
    setShowSearchInput(false);
    setCanClickOutside(false);
  }, [setShowSearchInput, setCanClickOutside]);

  useEffect(() => {
    // Search input should always be open when we direct to the search page.
    setShowSearchInput(isSearchPage);
  }, [isSearchPage]);

  useEffect(() => {
    if (showSearchInput) {
      if (isSearchPage) {
        setCanClickOutside(false);
      } else {
        setCanClickOutside(true);
      }
    } else {
      setCanClickOutside(false);
    }
  }, [showSearchInput, isSearchPage]);

  return (
    <div className={styles.patientSearchIconWrapper} ref={ref}>
      {showSearchInput ? (
        <>
          {isDesktop(layout) ? (
            /* CompactPatientSearchComponent provides the search context */
            <CompactPatientSearchComponent
              isSearchPage={isSearchPage}
              initialSearchTerm={initialSearchTerm}
              shouldNavigateToPatientSearchPage
              onPatientSelect={resetToInitialState}
            />
          ) : (
            <PatientSearchOverlay
              onClose={closePatientSearch}
              query={initialSearchTerm}
              patientClickSideEffect={closePatientSearch}
            />
          )}
          <div className={styles.closeButton}>
            <HeaderGlobalAction
              aria-label={t('closeSearch', 'Close Search Panel')}
              className={styles.activeSearchIconButton}
              data-testid="closeSearchIcon"
              enterDelayMs={500}
              name="CloseSearchIcon"
              onClick={closePatientSearch}>
              <Close size={20} />
            </HeaderGlobalAction>
          </div>
        </>
      ) : (
        <div>
          <HeaderGlobalAction
            aria-label={t('searchPatient', 'Search Patient')}
            className={styles.searchIconButton}
            data-testid="searchPatientIcon"
            enterDelayMs={500}
            name="SearchPatientIcon"
            onClick={handleShowSearchInput}
            onMouseEnter={() => {
              // Preload the user object on hover. This object may contain a 'patientsVisited'
              // property with UUIDs of recently viewed patients. This data can be used to display
              // recently viewed patients if the 'showRecentlySearchedPatients' config property
              // is enabled.
              if (userUuid) {
                void preload(`${restBaseUrl}/user/${userUuid}`, openmrsFetch);
              }
            }}>
            <Search size={20} />
          </HeaderGlobalAction>
        </div>
      )}
    </div>
  );
};

export default PatientSearchLaunch;
