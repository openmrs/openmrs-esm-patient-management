import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { Button, Search } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig, navigate, interpolateString } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { useInfinitePatientSearch } from '../patient-search.resource';
import { PatientSearchContext } from '../patient-search-context';
import useArrowNavigation from '../hooks/useArrowNavigation';
import PatientSearch from '../compact-patient-search/patient-search.component';
import styles from './compact-patient-search.scss';

interface CompactPatientSearchProps {
  initialSearchTerm: string;
  /** An action to take when the patient is selected, other than navigation. If not provided, navigation takes place. */
  selectPatientAction?: (patientUuid: string) => undefined;
  buttonProps?: Object;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  selectPatientAction,
  initialSearchTerm = '',
  buttonProps,
}) => {
  const { t } = useTranslation();
  const config = useConfig<PatientSearchConfig>();
  const inputRef = useRef<HTMLInputElement>(null);
  const bannerContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const showSearchResults = useMemo(() => !!searchTerm?.trim(), [searchTerm]);
  const patientSearchResponse = useInfinitePatientSearch(searchTerm, config.includeDead, showSearchResults);
  const { data: patients } = patientSearchResponse;

  const handleChange = useCallback((val) => setSearchTerm(val), [setSearchTerm]);

  const handleClear = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  /**
   * handlePatientSelection: Manually handles everything that needs to happen when a patient
   * from the result list is selected. This is used for the arrow navigation, but is not used
   * for click handling.
   */
  const handlePatientSelection = useCallback(
    (event, index: number) => {
      event.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patients[index].uuid);
      } else {
        navigate({
          to: interpolateString(config.search.patientChartUrl, {
            patientUuid: patients[index].uuid,
          }),
        });
      }
      handleClear();
    },
    [config.search, selectPatientAction, patients, handleClear],
  );

  const handleFocusToInput = useCallback(() => {
    let len = inputRef.current.value?.length ?? 0;
    inputRef.current.setSelectionRange(len, len);
    inputRef.current.focus();
  }, [inputRef]);

  const focusedResult = useArrowNavigation(patients?.length ?? 0, handlePatientSelection, handleFocusToInput, -1);

  useEffect(() => {
    if (bannerContainerRef.current && focusedResult > -1) {
      bannerContainerRef.current.children?.[focusedResult]?.focus();
      bannerContainerRef.current.children?.[focusedResult]?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    } else if (bannerContainerRef.current && inputRef.current && focusedResult === -1) {
      handleFocusToInput();
    }
  }, [focusedResult, bannerContainerRef, handleFocusToInput]);

  return (
    <div className={styles.patientSearchBar}>
      <form onSubmit={(event) => event.preventDefault()} className={styles.searchArea}>
        <Search
          autoFocus
          className={styles.patientSearchInput}
          closeButtonLabelText={t('clearSearch', 'Clear')}
          labelText=""
          onChange={(event) => handleChange(event.target.value)}
          onClear={handleClear}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          ref={inputRef}
          size="lg"
          value={searchTerm}
        />
        <Button type="submit" onClick={(event) => event.preventDefault()} {...buttonProps}>
          {t('search', 'Search')}
        </Button>
      </form>
      {showSearchResults && (
        <PatientSearchContext.Provider
          value={{
            nonNavigationSelectPatientAction: selectPatientAction,
            patientClickSideEffect: handleClear,
          }}>
          <div className={styles.floatingSearchResultsContainer}>
            <PatientSearch query={searchTerm} ref={bannerContainerRef} {...patientSearchResponse} />
          </div>
        </PatientSearchContext.Provider>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
