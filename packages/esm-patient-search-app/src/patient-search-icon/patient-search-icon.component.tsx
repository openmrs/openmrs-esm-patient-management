import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderGlobalAction } from '@carbon/react';
import { Close, Search } from '@carbon/react/icons';
import { isDesktop, useLayoutType, useOnClickOutside } from '@openmrs/esm-framework';
import Overlay from '../ui-components/overlay';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './patient-search-icon.scss';

interface PatientSearchLaunchProps {}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [canClickOutside, setCanClickOutside] = useState(false);

  const handleCloseSearchInput = useCallback(() => {
    setShowSearchInput(false);
  }, []);

  const ref = useOnClickOutside<HTMLDivElement>(handleCloseSearchInput, canClickOutside);

  useEffect(() => {
    showSearchInput ? setCanClickOutside(true) : setCanClickOutside(false);
  }, [showSearchInput]);

  return (
    <div className={styles.patientSearchIconWrapper} ref={ref}>
      {showSearchInput &&
        (isDesktop(layout) ? (
          <div className={styles.patientSearchBar}>
            <PatientSearchBar hidePanel={() => setShowSearchInput(false)} small orangeBorder />
          </div>
        ) : (
          <Overlay close={() => setShowSearchInput(false)} header={t('searchResults', 'Search Results')}>
            <PatientSearchBar hidePanel={() => setShowSearchInput(false)} floatingSearchResults={false} orangeBorder />
          </Overlay>
        ))}

      <div className={`${showSearchInput && styles.closeButton}`}>
        <HeaderGlobalAction
          className={`${showSearchInput ? styles.activeSearchIconButton : styles.searchIconButton}`}
          onClick={() => setShowSearchInput((prevState) => !prevState)}
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
