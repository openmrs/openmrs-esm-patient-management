import React, { useMemo, useState } from 'react';
import { Dropdown } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { SearchTypes } from '../types';
import PatientInfo from '../patient-info/patient-info.component';
import styles from './search-results.scss';

interface SearchResultsProps {
  patients: Array<any>;
  hidePanel?: any;
  toggleSearchType: (searchMode: SearchTypes) => void;
}

type SortingCriteria = 'firstNameFirst' | 'lastNameFirst' | 'oldest' | 'youngest';

const SearchResults: React.FC<SearchResultsProps> = ({ patients }) => {
  const { t } = useTranslation();
  const [selectedSortingCriteria, setSelectedSortingCriteria] = useState<SortingCriteria>('firstNameFirst');
  const fhirPatients = useMemo(() => {
    return patients.map((patient) => {
      const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
      return {
        id: patient.uuid,
        name: [
          {
            given: [patient.person.personName.givenName, patient.person.personName.middleName],
            family: patient.person.personName.familyName,
          },
        ],
        person: patient.person,
        gender: patient.person.gender,
        birthDate: patient.person.birthdate,
        deceasedDateTime: patient.person.deathDate,
        deceasedBoolean: patient.person.death,
        identifier: [
          {
            value: patient.patientIdentifier.identifier,
          },
        ],
        address: preferredAddress
          ? [
              {
                city: preferredAddress.cityVillage,
                country: preferredAddress.country,
                postalCode: preferredAddress.postalCode,
                state: preferredAddress.stateProvince,
                use: 'home',
              },
            ]
          : [],
        telecom: patient.attributes?.filter((attribute) => attribute.attributeType.name == 'Telephone Number'),
      };
    });
  }, [patients]);

  const sortedPatient = useMemo(() => {
    return fhirPatients.sort((patientA, patientB) => {
      if (selectedSortingCriteria === 'oldest') {
        return new Date(patientA.birthDate).getTime() - new Date(patientB.birthDate).getTime();
      }
      if (selectedSortingCriteria === 'youngest') {
        return new Date(patientB.birthDate).getTime() - new Date(patientA.birthDate).getTime();
      }
      if (selectedSortingCriteria === 'firstNameFirst') {
        return patientA.person.personName.givenName < patientB.person.personName.givenName ? -1 : 0;
      }
      if (selectedSortingCriteria === 'lastNameFirst') {
        return patientA.person.personName.familyName < patientB.person.personName.familyName ? -1 : 0;
      }
    });
  }, [fhirPatients, selectedSortingCriteria]);

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
        <div key={index} className={styles.patientChart}>
          <div className={styles.container}>
            <PatientInfo patient={patient} />
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;
