import React, { useCallback, useState, useEffect, useReducer, useMemo } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import Close20 from '@carbon/icons-react/es/close/20';
import { HeaderGlobalAction } from 'carbon-components-react/es/components/UIShell';
import styles from './patient-search-icon.component.scss';
import PatientSearch from '../patient-search/patient-search.component';
import Search from 'carbon-components-react/es/components/Search';
import { useTranslation } from 'react-i18next';
import Button from 'carbon-components-react/es/components/Button';
import debounce from 'lodash-es/debounce';
import { useLayoutType } from '@openmrs/esm-framework';
import { performPatientSearch } from '../patient-search/patient-search.resource';
import isEmpty from 'lodash-es/isEmpty';
import { SearchedPatient } from '../types';

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
  payload: Error;
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
}

function reducer(state: PatientSearch, action: Action): PatientSearch {
  switch (action.type) {
    case ActionTypes.resolved:
      return { status: 'resolved', searchResults: action.payload };
    case ActionTypes.searching:
      return { status: 'searching', searchResults: action.payload };
    case ActionTypes.error:
      return { ...state, status: 'error' };
    case ActionTypes.idle:
      return { status: 'idle', searchResults: action.payload };
  }
}

const searchTimeout = 300;
const customRepresentation =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,display),' +
  'attributes:(value,attributeType:(name)))';

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [open, setOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const initialState: PatientSearch = { status: 'idle', searchResults: [] };
  const [{ searchResults, status }, dispatch] = useReducer(reducer, initialState);

  const performSearch = useCallback(() => {
    !isEmpty(searchTerm) && dispatch({ type: ActionTypes.searching, payload: [] });
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm && status === 'searching') {
      const ac = new AbortController();
      performPatientSearch(searchTerm, customRepresentation, ac).then(
        ({ data }) => {
          const results: Array<SearchedPatient> = data.results.map((res, i) => ({
            ...res,
            index: i + 1,
          }));
          dispatch({ type: ActionTypes.resolved, payload: results });
        },
        (error) => {
          dispatch({ type: ActionTypes.error, payload: error });
        },
      );
      return () => ac.abort();
    }
  }, [searchTerm, status]);

  const handleEnterKeyPressed = (event: KeyboardEvent) => event.key.toLowerCase() === 'enter' && performSearch();

  const withButtonSize = useCallback(() => {
    if (layout === 'desktop') {
      return { size: 'small' };
    }
  }, [layout]);

  const handleChange = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeout), []);

  const handleCloseSearchPanel = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  useEffect(() => {
    if (isEmpty(searchTerm)) {
      dispatch({ type: ActionTypes.idle, payload: [] });
    }
  }, [searchTerm]);

  return (
    <>
      <div className={styles.patientSearchIconWrapper}>
        {open && (
          <div className={styles.searchArea}>
            <Search
              size={layout === 'desktop' ? 'sm' : 'xl'}
              className={styles.patientSearchInput}
              placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
              labelText=""
              onKeyUp={handleEnterKeyPressed}
              onChange={(event) => handleChange(event.target.value)}
              autoFocus={true}
            />
            <Button
              disabled={status === 'searching'}
              onClick={performSearch}
              style={{ background: '#393939' }}
              {...withButtonSize()}
              className={styles.searchButton}>
              {t('search', 'Search')}
            </Button>
          </div>
        )}

        <div className={`${open && styles.closeButton}`}>
          <HeaderGlobalAction
            onClick={() => setOpen((prevState) => !prevState)}
            aria-label="Search Patient"
            aria-labelledby="Search Patient"
            name="SearchPatientIcon">
            {open ? <Close20 /> : <Search20 />}
          </HeaderGlobalAction>
        </div>
      </div>
      {open && <PatientSearch hidePanel={handleCloseSearchPanel} searchResults={searchResults} status={status} />}
    </>
  );
};

export default PatientSearchLaunch;
