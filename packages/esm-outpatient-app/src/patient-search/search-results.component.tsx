import React, { useMemo, useState } from 'react';
import { Dropdown } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { SearchTypes } from '../types';
import PatientInfo from '../patient-info/patient-info.component';
import styles from './search-results.scss';

interface SearchResultsProps {
  patients: Array<fhir.Patient>;
  hidePanel?: any;
  toggleSearchType: (searchMode: SearchTypes, patientUuid: string) => void;
}

type SortingCriteria = 'firstNameFirst' | 'lastNameFirst' | 'oldest' | 'youngest';

const SearchResults: React.FC<SearchResultsProps> = ({ patients, toggleSearchType }) => {
  const { t } = useTranslation();
  const [selectedSortingCriteria, setSelectedSortingCriteria] = useState<SortingCriteria>('firstNameFirst');

  const sortedPatient = useMemo(() => {
    return patients.sort((patientA, patientB) => {
      if (selectedSortingCriteria === 'oldest') {
        return new Date(patientA.birthDate).getTime() - new Date(patientB.birthDate).getTime();
      }
      if (selectedSortingCriteria === 'youngest') {
        return new Date(patientB.birthDate).getTime() - new Date(patientA.birthDate).getTime();
      }
      if (selectedSortingCriteria === 'firstNameFirst') {
        return patientA.name?.[0].given?.join('') < patientB.name?.[0].given?.join('') ? -1 : 0;
      }
      if (selectedSortingCriteria === 'lastNameFirst') {
        return patientA?.name?.[0].family < patientB?.name?.[0].family ? -1 : 0;
      }
    });
  }, [patients, selectedSortingCriteria]);

  const sortingCriteria = [
    { id: 'firstNameFirst', label: t('firstNameSort', 'First name (a-z)') },
    { id: 'lastNameFirst', label: t('lastNameSort', 'Last name (a-z)') },
    { id: 'oldest', label: t('oldest', 'Oldest first') },
    { id: 'youngest', label: t('youngest', 'Youngest first') },
  ];

  return (
    <>
      <div className={styles.sortingCriteriaSelect}>
        <Dropdown
          ariaLabel="sortBy"
          id="sortingCriteriaDropdown"
          items={sortingCriteria}
          initialSelectedItem={sortingCriteria[0]}
          label={`${t('sortBy', 'Sort by')}:`}
          titleText={`${t('sortBy', 'Sort by')}:`}
          type="inline"
          size="sm"
          onChange={({ selectedItem }) => setSelectedSortingCriteria(selectedItem.id as SortingCriteria)}
        />
      </div>
      {sortedPatient.map((patient, index) => (
        <div key={`search-result-${index}`} className={styles.patientChart}>
          <div className={styles.container}>
            <PatientInfo
              patient={patient}
              handlePatientInfoClick={() => {
                toggleSearchType(SearchTypes.SCHEDULED_VISITS, patient.id);
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;
