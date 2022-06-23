import React, { useCallback, useState, useMemo } from 'react';
import { Button, Search } from 'carbon-components-react';
import PatientSearch from '../patient-search/patient-search.component';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import styles from './patient-search-bar.scss';

interface PatientSearchLaunchProps {
  small?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
}

const searchTimeout = 300;

const PatientSearchBar: React.FC<PatientSearchLaunchProps> = ({ small, selectPatientAction }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>();
  const handleChange = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeout), []);
  const handleCloseSearchInput = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <>
      <div className={styles.patientSearchWrapper}>
        <div className={styles.searchArea}>
          <Search
            className={styles.patientSearchInput}
            size={small ? 'sm' : 'xl'}
            placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
            labelText=""
            closeButtonLabelText={t('clearSearch', 'Clear')}
            onChange={(event) => handleChange(event.target.value)}
            autoFocus={true}
          />
          <Button type="submit" className={styles.searchButton} size={small ? 'sm' : 'md'}>
            {t('search', 'Search')}
          </Button>
        </div>
        {!!searchTerm && (
          <PatientSearch
            hidePanel={handleCloseSearchInput}
            query={searchTerm}
            selectPatientAction={selectPatientAction}
          />
        )}
      </div>
    </>
  );
};

export default PatientSearchBar;
