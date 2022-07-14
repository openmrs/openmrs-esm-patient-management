import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderGlobalAction } from '@carbon/react';
import { Close, Search } from '@carbon/react/icons';
import { isDesktop, navigate, useLayoutType, useOnClickOutside } from '@openmrs/esm-framework';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
import CompactPatientSearchComponent from '../compact-patient-search/compact-patient-search.component';
import styles from './patient-search-icon.component.scss';

interface PatientSearchLaunchProps {
  location: {
    pathname: string;
  };
}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = (props) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const page = props?.location?.pathname?.split('/')?.[1];
  const query = page === 'search' ? props?.location?.pathname?.split('/')?.[2] : '';
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [canClickOutside, setCanClickOutside] = useState(false);

  const handleCloseSearchInput = useCallback(() => {
    // Clicking outside of the search input when "/search" page is open should not close the search input.
    if (page !== 'search') {
      setShowSearchInput(false);
    }
  }, [setShowSearchInput, page]);

  const ref = useOnClickOutside<HTMLDivElement>(handleCloseSearchInput, canClickOutside);

  const handleGlobalAction = useCallback(() => {
    if (showSearchInput) {
      if (page === 'search') {
        navigate({
          to: window.localStorage.getItem('searchReturnUrl') ?? '${openmrsSpaBase}/',
        });
        window.localStorage.removeItem('searchReturnUrl');
      }
      setShowSearchInput(false);
    } else {
      setShowSearchInput(true);
    }
  }, [page, setShowSearchInput, showSearchInput]);

  useEffect(() => {
    // Search input should always be open when we direct to the search page.
    setShowSearchInput(page === 'search');
    if (page === 'search') {
      setCanClickOutside(false);
    }
  }, [page]);

  useEffect(() => {
    showSearchInput ? setCanClickOutside(true) : setCanClickOutside(false);
  }, [showSearchInput]);

  return (
    <div className={styles.patientSearchIconWrapper} ref={ref}>
      {showSearchInput &&
        (isDesktop(layout) ? (
          <CompactPatientSearchComponent query={query} searchPage={page === 'search'} />
        ) : (
          <PatientSearchOverlay onClose={handleGlobalAction} query={query} />
        ))}

      <div className={`${showSearchInput && styles.closeButton}`}>
        <HeaderGlobalAction
          className={`${showSearchInput ? styles.activeSearchIconButton : styles.searchIconButton}`}
          onClick={handleGlobalAction}
          aria-label="Search Patient"
          aria-labelledby="Search Patient"
          name="SearchPatientIcon">
          {showSearchInput ? <Close size={20} /> : <Search size={20} />}
        </HeaderGlobalAction>
      </div>
    </div>
  );
};

export default PatientSearchLaunch;
