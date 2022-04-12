import React, { useMemo, useState } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './search-results.scss';
import { SearchTypes } from '../types';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import PatientInfo from '../patient-info/patient-info.component';

interface SearchResultsProps {
  patients: Array<any>;
  hidePanel?: any;
  toggleSearchType: (searchMode: SearchTypes) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ patients, toggleSearchType }) => {
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
  const onClickSearchResult = () => toggleSearchType(SearchTypes.SCHEDULED_VISITS);

  return (
    <>
      {fhirPatients.map((patient) => (
        <div key={patient.id} className={styles.patientChart}>
          <div className={styles.container}>
            <PatientInfo patient={patient} />
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;
