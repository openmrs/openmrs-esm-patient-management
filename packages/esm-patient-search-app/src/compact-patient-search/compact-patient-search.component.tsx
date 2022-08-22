import React, { useCallback, useState } from 'react';
import { navigate } from '@openmrs/esm-framework';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import styles from './compact-patient-search.scss';
import { useLocation, useParams } from 'react-router-dom';

interface CompactPatientSearchProps {
  selectPatientAction?: (patientUuid: string) => undefined;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({ selectPatientAction }) => {
  const { pathname } = useLocation();
  const isSearchPage = pathname.split('/')[1] === 'search';
  const query = pathname.split('/')?.[2];
  const [searchTerm, setSearchTerm] = useState(query);

  const onSubmit = useCallback(
    (searchTerm) => {
      if (!isSearchPage) {
        window.localStorage.setItem('searchReturnUrl', window.location.pathname);
      }
      navigate({
        to: `\${openmrsSpaBase}/search/${searchTerm}`,
      });
    },
    [isSearchPage],
  );

  const onClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  return (
    <div className={styles.patientSearchBar}>
      <PatientSearchBar
        small
        initialSearchTerm={query ?? ''}
        onChange={setSearchTerm}
        onSubmit={onSubmit}
        onClear={onClear}
      />
      {!!searchTerm && !isSearchPage && (
        <div className={styles.floatingSearchResultsContainer}>
          <PatientSearch query={searchTerm} selectPatientAction={selectPatientAction} />
        </div>
      )}
    </div>
  );
};

export default CompactPatientSearchComponent;
