import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { Button, Search } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig, navigate, interpolateString } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from './config-schema';
import { useInfinitePatientSearch } from './patient-search.resource';
import { PatientSearchContextProvider } from './patient-search-context';
import useArrowNavigation from './hooks/useArrowNavigation';
import PatientSearch from './compact-patient-search/patient-search.component';
import { type CompactPatientBannerHandle } from './compact-patient-search/compact-patient-banner.component';
import styles from './compact-patient-search.scss';

interface CompactPatientSearchProps {
  initialSearchTerm: string;
  /** An action to take when the patient is selected, other than navigation. If not provided, navigation takes place. */
  selectPatientAction?: (patientUuid: string) => undefined;
  buttonProps?: object;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  selectPatientAction,
  initialSearchTerm = '',
  buttonProps,
}) => {
  const { t } = useTranslation();
  const config = useConfig<PatientSearchConfig>();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<CompactPatientBannerHandle>(null);
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

  const focusedResult = useArrowNavigation(
    patients?.length ?? 0,
    handlePatientSelection,
    handleFocusToInput,
    -1,
    searchContainerRef,
  );

  useEffect(() => {
    if (focusedResult > -1) {
      bannerRef.current?.focusSearchResult(focusedResult);
    } else if (bannerRef.current && inputRef.current && focusedResult === -1) {
      handleFocusToInput();
    }
  }, [focusedResult, handleFocusToInput]);

  return (
    <div className={styles.patientSearchBar} ref={searchContainerRef}>
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
        <PatientSearchContextProvider
          value={{
            nonNavigationSelectPatientAction: selectPatientAction,
            patientClickSideEffect: handleClear,
          }}>
          <div className={styles.floatingSearchResultsContainer}>
            <PatientSearch query={searchTerm} ref={bannerRef} {...patientSearchResponse} />
          </div>
        </PatientSearchContextProvider>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
