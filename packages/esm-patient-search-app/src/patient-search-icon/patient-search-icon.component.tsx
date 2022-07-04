import React, { useCallback, useState, useEffect } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import Close20 from '@carbon/icons-react/es/close/20';
import { HeaderGlobalAction } from 'carbon-components-react';
import { useLayoutType, useOnClickOutside } from '@openmrs/esm-framework';
import styles from './patient-search-icon.component.scss';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import Overlay from '../ui-components/overlay';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, useParams } from 'react-router-dom';

interface RouteParams {
  page: string;
  query: string;
}

interface PatientSearchLaunchProps extends RouteComponentProps<RouteParams> {}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = (props) => {
  console.log(props);
  const page = props?.location?.pathname?.split('/')?.[1];
  const query = props?.location?.pathname?.split('/')?.[2];
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [canClickOutside, setCanClickOutside] = useState<boolean>(false);
  const isDesktop = useLayoutType() === 'desktop';
  const { t } = useTranslation();

  useEffect(() => {
    // Search input should always be open when we direct to the search page.
    setShowSearchInput(page === 'search');
  }, [page]);

  const handleCloseSearchInput = useCallback(() => {
    // Clicking outside of the search input when "/search" page is open should not close the search input.
    if (page !== 'search') {
      setShowSearchInput(false);
    }
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
            <PatientSearchBar
              hidePanel={() => setShowSearchInput(false)}
              small
              orangeBorder
              page={page}
              queryTerm={page === 'search' ? query : null}
            />
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
          {showSearchInput ? <Close20 /> : <Search20 />}
        </HeaderGlobalAction>
      </div>
    </div>
  );
};

export default PatientSearchLaunch;
