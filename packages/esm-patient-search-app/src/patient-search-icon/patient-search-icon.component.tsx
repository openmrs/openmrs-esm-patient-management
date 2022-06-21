import React, { useCallback, useState, useEffect, useReducer, useMemo } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import Close20 from '@carbon/icons-react/es/close/20';
import { Button, HeaderGlobalAction, Search } from 'carbon-components-react';
import PatientSearch from '../patient-search/patient-search.component';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { useConfig, useOnClickOutside, useLayoutType } from '@openmrs/esm-framework';
import { performPatientSearch } from '../patient-search/patient-search.resource';
import isEmpty from 'lodash-es/isEmpty';
import { SearchedPatient } from '../types';
import styles from './patient-search-icon.component.scss';

interface PatientSearchLaunchProps {}

enum ActionTypes {
  searching = 'searching',
  resolved = 'resolved',
  error = 'error',
  idle = 'idle',
}
interface Searching {
  type: ActionTypes.searching;
  payload: Array<SearchedPatient>;
}

interface Error {
  type: ActionTypes.error;
  error: Error;
}
interface Resolved {
  type: ActionTypes.resolved;
  payload: Array<SearchedPatient>;
}

interface Idle {
  type: ActionTypes.idle;
  payload: Array<SearchedPatient>;
}

type Action = Searching | Error | Resolved | Idle;

interface PatientSearch {
  status: 'searching' | 'resolved' | 'error' | 'idle';
  searchResults: Array<SearchedPatient>;
  error?: null | Error;
}

function reducer(state: PatientSearch, action: Action): PatientSearch {
  switch (action.type) {
    case ActionTypes.error:
      return { status: action.type, error: action.error, ...state };
    default:
      return { status: action.type, searchResults: action.payload };
  }
}

const searchTimeout = 300;
const customRepresentation =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(name)))';

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const config = useConfig();
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showResultsPanel, setShowResultsPanel] = useState<boolean>(false);
  const [canClickOutside, setCanClickOutside] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const initialState: PatientSearch = { status: 'idle', searchResults: [] };
  const [{ searchResults, status, error }, dispatch] = useReducer(reducer, initialState);

  const performSearch = useCallback(() => {
    !isEmpty(searchTerm) && dispatch({ type: ActionTypes.searching, payload: [] });
    setShowResultsPanel(true);
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm && status === 'searching') {
      const ac = new AbortController();
      performPatientSearch(searchTerm, customRepresentation, ac, config.includeDead).then(
        ({ data }) => {
          const results: Array<SearchedPatient> = data.results.map((res, i) => ({
            ...res,
            index: i + 1,
          }));
          dispatch({ type: ActionTypes.resolved, payload: results });
        },
        (error) => {
          dispatch({ type: ActionTypes.error, error: error?.response });
        },
      );
      return () => ac.abort();
    }
  }, [config.includeDead, searchTerm, status]);

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
    if (isEmpty(searchTerm)) {
      setShowResultsPanel(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isEmpty(searchTerm)) {
      dispatch({ type: ActionTypes.idle, payload: [] });
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
        <PatientSearch hidePanel={handleCloseSearchInput} searchResults={searchResults} status={status} error={error} />
      )}
    </>
  );
};

export default PatientSearchLaunch;
