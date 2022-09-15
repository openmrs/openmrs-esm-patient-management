import React, { useCallback, useState, useMemo } from 'react';
import PatientSearch from '../compact-patient-search/patient-search.component';
import { SearchedPatient } from '../types';
import { Search, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './compact-patient-search.scss';
import { navigate, interpolateString, useConfig } from '@openmrs/esm-framework';

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

  const handleSubmit = useCallback((evt) => {
    evt.preventDefault();
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleReset = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const onSearchResultClick = useCallback(
    (evt, patient: SearchedPatient) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patient);
      } else {
        navigate({
          to: `${interpolateString(config.search.patientResultUrl, {
            patientUuid: patient.uuid,
          })}/${encodeURIComponent(config.search.redirectToPatientDashboard)}`,
        });
      }
      handleReset();
    },
    [config.search, handleReset, selectPatientAction],
  );

  return (
    <div className={styles.patientSearchBar}>
      <form onSubmit={handleSubmit} className={styles.searchArea}>
        <Search
          className={styles.patientSearchInput}
          closeButtonLabelText={t('clearSearch', 'Clear')}
          labelText=""
          onChange={(event) => handleChange(event.target.value)}
          onClear={handleClear}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          value={searchTerm}
          size="lg"
        />
        <Button type="submit" onClick={handleSubmit} {...buttonProps}>
          {t('search', 'Search')}
        </Button>
      </form>
      {showSearchResults && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} selectPatientAction={onSearchResultClick} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
