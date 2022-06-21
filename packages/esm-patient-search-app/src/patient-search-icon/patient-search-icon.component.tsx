import React, { useCallback, useState, useEffect, useMemo } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import Close20 from '@carbon/icons-react/es/close/20';
import { Button, HeaderGlobalAction, Search } from 'carbon-components-react';
import PatientSearch from '../patient-search/patient-search.component';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { useConfig, useOnClickOutside, useLayoutType } from '@openmrs/esm-framework';
import isEmpty from 'lodash-es/isEmpty';
import { SearchedPatient } from '../types';
import styles from './patient-search-icon.component.scss';

interface PatientSearchLaunchProps {}

interface PatientSearch {
  status: 'searching' | 'resolved' | 'error' | 'idle';
  searchResults: Array<SearchedPatient>;
  error?: null | Error;
}

const searchTimeout = 300;

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [canClickOutside, setCanClickOutside] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const [query, setQueryTerm] = useState<string>();
  const initialState: PatientSearch = { status: 'idle', searchResults: [] };

  const performSearch = useCallback(
    (evt) => {
      evt.preventDefault();
      console.log(evt);
      setQueryTerm(searchTerm);
    },
    [searchTerm],
  );

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
      setQueryTerm('');
    }
  }, [searchTerm]);

  return (
    <>
      <div className={styles.patientSearchIconWrapper} ref={ref}>
        {showSearchInput && (
          <div className={styles.searchArea}>
            <form onSubmit={performSearch} className={styles.searchArea}>
              <Search
                size={layout === 'desktop' ? 'sm' : 'xl'}
                className={styles.patientSearchInput}
                placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
                labelText=""
                closeButtonLabelText={t('clearSearch', 'Clear')}
                onChange={(event) => handleChange(event.target.value)}
                autoFocus={true}
              />
              <Button
                type="submit"
                onClick={performSearch}
                className={styles.searchButton}
                size={layout === 'desktop' ? 'small' : 'default'}>
                {t('search', 'Search')}
              </Button>
            </form>
            {!!query && <PatientSearch hidePanel={handleCloseSearchInput} query={query} />}
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
    </>
  );
};

export default PatientSearchLaunch;
