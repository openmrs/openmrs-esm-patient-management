import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Button, Search } from 'carbon-components-react';
import PatientSearch from '../patient-search/patient-search.component';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import styles from './patient-search-bar.scss';

interface PatientSearchBarProps {
  small?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  floatingSearchResults?: boolean;
  hidePanel?: () => void;
  orangeBorder?: boolean;
  buttonProps?: Object;
}

const searchTimeout = 300;

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  small,
  selectPatientAction,
  floatingSearchResults = true,
  orangeBorder,
  hidePanel,
  buttonProps,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>();
  const handleChange = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeout), []);

  return (
    <div className={styles.patientSearchWrapper}>
      <div className={`${styles.searchArea} ${orangeBorder && styles.orangeBorder}`}>
        <Search
          className={styles.patientSearchInput}
          size={small ? 'sm' : 'xl'}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          labelText=""
          closeButtonLabelText={t('clearSearch', 'Clear')}
          onChange={(event) => handleChange(event.target.value)}
          autoFocus={true}
        />
        <Button type="submit" className={styles.searchButton} size={small ? 'sm' : 'md'} {...buttonProps}>
          {t('search', 'Search')}
        </Button>
      </div>
      {!!searchTerm && (
        <div className={floatingSearchResults && styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} selectPatientAction={selectPatientAction} hidePanel={hidePanel} />
        </div>
      )}
    </div>
  );
};

export default PatientSearchBar;
