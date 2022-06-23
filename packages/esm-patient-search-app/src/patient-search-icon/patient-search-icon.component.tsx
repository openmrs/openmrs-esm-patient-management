import React, { useCallback, useState, useEffect } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import Close20 from '@carbon/icons-react/es/close/20';
import { HeaderGlobalAction } from 'carbon-components-react';
import { useLayoutType, useOnClickOutside } from '@openmrs/esm-framework';
import styles from './patient-search-icon.component.scss';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import Overlay from '../ui-components/overlay';
import { useTranslation } from 'react-i18next';

interface PatientSearchLaunchProps {}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [canClickOutside, setCanClickOutside] = useState<boolean>(false);
  const isDesktop = useLayoutType() === 'desktop';
  const { t } = useTranslation();

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
        (isDesktop ? (
          <div className={styles.patientSearchBar}>
            <PatientSearchBar small floatingSearchResults />
          </div>
        ) : (
          <Overlay close={() => setShowSearchInput(false)} header={t('searchResults', 'Search Results')}>
            <PatientSearchBar hidePanel={() => setShowSearchInput(false)} />
          </Overlay>
        ))}

      <div className={`${showSearchInput && styles.closeButton}`}>
        <HeaderGlobalAction
          className={`${showSearchInput ? styles.activeSearchIconButton : styles.searchIconButton}`}
          onClick={() => setShowSearchInput((prevState) => !prevState)}
          aria-label="Search Patient"
          aria-labelledby="Search Patient"
          name="SearchPatientIcon">
          {showSearchInput ? <Close20 /> : <Search20 />}
        </HeaderGlobalAction>
      </div>
    </div>
  );
};

export default PatientSearchLaunch;
