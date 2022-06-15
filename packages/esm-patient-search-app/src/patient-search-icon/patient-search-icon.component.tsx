import React, { useCallback, useState, useEffect, useMemo } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import Close20 from '@carbon/icons-react/es/close/20';
import { Button, HeaderGlobalAction, Search } from 'carbon-components-react';
import PatientSearch from '../patient-search/patient-search.component';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { useConfig, useOnClickOutside, useLayoutType } from '@openmrs/esm-framework';
import isEmpty from 'lodash-es/isEmpty';
import styles from './patient-search-icon.component.scss';
import usePatientSearch from '../hooks/usePatientSearch';

interface PatientSearchLaunchProps {}

const searchTimeout = 300;

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const config = useConfig();
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showResultsPanel, setShowResultsPanel] = useState<boolean>(false);
  const [canClickOutside, setCanClickOutside] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const { patients, isLoading, error } = usePatientSearch(searchTerm, config.includeDead);

  const performSearch = useCallback(() => {
    setShowResultsPanel(true);
  }, [searchTerm]);

  const handleEnterKeyPressed = (event: React.KeyboardEvent<HTMLInputElement>) =>
    event.key.toLowerCase() === 'enter' && performSearch();

  const handleChange = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeout), []);

  const handleCloseSearchInput = useCallback(() => {
    setShowSearchInput(false);
  }, []);

  const ref = useOnClickOutside<HTMLDivElement>(handleCloseSearchInput, canClickOutside);

  useEffect(() => {
    if (!showSearchInput) {
      setSearchTerm('');
    }
  }, [showSearchInput]);

  useEffect(() => {
    showSearchInput ? setCanClickOutside(true) : setCanClickOutside(false);
  }, [showSearchInput]);

  useEffect(() => {
    if (isEmpty(searchTerm)) {
      setShowResultsPanel(false);
    }
  }, [searchTerm]);

  return (
    <>
      <div className={styles.patientSearchIconWrapper} ref={ref}>
        {showSearchInput && (
          <div className={styles.searchArea}>
            <Search
              size={layout === 'desktop' ? 'sm' : 'xl'}
              className={styles.patientSearchInput}
              placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
              labelText=""
              closeButtonLabelText={t('clearSearch', 'Clear')}
              onKeyUp={handleEnterKeyPressed}
              onChange={(event) => handleChange(event.target.value)}
              autoFocus={true}
            />
            <Button
              disabled={status === 'searching'}
              onClick={performSearch}
              className={styles.searchButton}
              size={layout === 'desktop' ? 'small' : 'default'}>
              {t('search', 'Search')}
            </Button>
          </div>
        )}

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
      {showResultsPanel && (
        <PatientSearch
          hidePanel={handleCloseSearchInput}
          searchResults={patients}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  );
};

export default PatientSearchLaunch;
