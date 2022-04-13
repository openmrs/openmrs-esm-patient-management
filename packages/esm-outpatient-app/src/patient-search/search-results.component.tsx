import React, { useMemo, useState } from 'react';
import styles from './search-results.scss';
import { SearchTypes } from '../types';
import PatientInfo from '../patient-info/patient-info.component';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'carbon-components-react';

interface SearchResultsProps {
  patients: Array<any>;
  hidePanel?: any;
  toggleSearchType: (searchMode: SearchTypes, patientUuid: string) => void;
}

type SortCriteria = 'firstNameFirst' | 'lastNameFirst' | 'oldest' | 'youngest';

const SearchResults: React.FC<SearchResultsProps> = ({ patients, toggleSearchType }) => {
  const { t } = useTranslation();
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('firstNameFirst');
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

  return (
    <>
      <div className={styles.sortCriteria}>
        <Dropdown
          ariaLabel="sortBy"
          id="sortCriteria"
          items={sortByCriteria}
          initialSelectedItem={sortByCriteria[0]}
          label={t('sortBy', 'Sort by :')}
          titleText={t('sortBy', 'Sort by')}
          type="inline"
          size="sm"
          onChange={({ selectedItem }) => setSortCriteria(selectedItem.id as SortCriteria)}
        />
      </div>
      {sortedPatient.map((patient) => (
        <div key={patient.id} className={styles.patientChart}>
          <div className={styles.container}>
            <PatientInfo
              patient={patient}
              handleClick={() => {
                toggleSearchType(SearchTypes.VISIT_FORM, patient.id);
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;
