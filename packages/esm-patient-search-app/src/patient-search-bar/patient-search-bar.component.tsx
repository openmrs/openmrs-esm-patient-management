import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Button, Search } from 'carbon-components-react';
import PatientSearch from '../patient-search/patient-search.component';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import styles from './patient-search-bar.scss';
import { navigate } from '@openmrs/esm-framework';

interface PatientSearchBarProps {
  small?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  floatingSearchResults?: boolean;
  hidePanel?: () => void;
  orangeBorder?: boolean;
  buttonProps?: Object;
  page?: string;
  queryTerm?: string;
}

const searchTimeout = 300;

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  small,
  selectPatientAction,
  floatingSearchResults = true,
  orangeBorder,
  hidePanel,
  buttonProps,
  page,
  queryTerm,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>();
  const handleChange = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeout), []);

  console.log(queryTerm);

  const handleSubmit = () => {
    if (searchTerm) {
      navigate({
        to: `\${openmrsSpaBase}/search/${searchTerm}`,
      });
    }
  };

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
          defaultValue={queryTerm ?? ''}
        />
        <Button type="submit" kind={'secondary'} size={small ? 'sm' : 'md'} onClick={handleSubmit} {...buttonProps}>
          {t('search', 'Search')}
        </Button>
      </div>
      {!!searchTerm && page !== 'search' && (
        <div className={floatingSearchResults && styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} selectPatientAction={selectPatientAction} hidePanel={hidePanel} />
        </div>
      )}
    </div>
  );
};

export default PatientSearchBar;
