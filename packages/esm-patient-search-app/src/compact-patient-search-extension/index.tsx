import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import PatientSearch from '../compact-patient-search/patient-search.component';
import { SearchedPatient } from '../types';
import { Search, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './compact-patient-search.scss';
import { useInfinitePatientSearch } from '../patient-search.resource';
import { useConfig, navigate, interpolateString } from '@openmrs/esm-framework';
import useArrowNavigation from '../hooks/useArrowNavigation';

interface CompactPatientSearchProps {
  initialSearchTerm: string;
  selectPatientAction?: (patient: SearchedPatient) => undefined;
  buttonProps?: Object;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  selectPatientAction,
  initialSearchTerm = '',
  buttonProps,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const handleChange = useCallback((val) => setSearchTerm(val), [setSearchTerm]);
  const showSearchResults = useMemo(() => !!searchTerm?.trim(), [searchTerm]);
  const config = useConfig();
  const patientSearchResponse = useInfinitePatientSearch(searchTerm, config.includeDead, showSearchResults);
  const { data: patients } = patientSearchResponse;

  const handleSubmit = useCallback((evt) => {
    evt.preventDefault();
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleReset = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handlePatientSelection = useCallback(
    (evt, index: number) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patients[index]);
      } else {
        navigate({
          to: `${interpolateString(config.search.patientResultUrl, {
            patientUuid: patients[index].uuid,
          })}`,
        });
      }
      handleReset();
    },
    [config.search, selectPatientAction, patients, handleReset],
  );

  const bannerContainerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocusToInput = useCallback(() => {
    var len = inputRef.current.value?.length ?? 0;
    inputRef.current.setSelectionRange(len, len);
    inputRef.current.focus();
  }, [inputRef]);

  const focussedResult = useArrowNavigation(patients?.length ?? 0, handlePatientSelection, handleFocusToInput, -1);

  useEffect(() => {
    if (bannerContainerRef.current && focussedResult > -1) {
      bannerContainerRef.current.children?.[focussedResult]?.focus();
      bannerContainerRef.current.children?.[focussedResult]?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    } else if (bannerContainerRef.current && inputRef.current && focussedResult === -1) {
      handleFocusToInput();
    }
  }, [focussedResult, bannerContainerRef, handleFocusToInput]);

  return (
    <div className={styles.patientSearchBar}>
      <form onSubmit={handleSubmit} className={styles.searchArea}>
        <Search
          autoFocus
          className={styles.patientSearchInput}
          closeButtonLabelText={t('clearSearch', 'Clear')}
          labelText=""
          onChange={(event) => handleChange(event.target.value)}
          onClear={handleClear}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          value={searchTerm}
          size="lg"
          ref={inputRef}
        />
        <Button type="submit" onClick={handleSubmit} {...buttonProps}>
          {t('search', 'Search')}
        </Button>
      </form>
      {showSearchResults && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch
            query={searchTerm}
            selectPatientAction={handlePatientSelection}
            ref={bannerContainerRef}
            {...patientSearchResponse}
          />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
