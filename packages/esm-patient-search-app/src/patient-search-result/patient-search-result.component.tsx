import React, { useCallback, useMemo } from 'react';
import { useConfig, interpolateString, navigate } from '@openmrs/esm-framework';
import { Patient } from '../types/index';
import ResultCard from './result-card/result-card.component';
import { PatientSearchConfig } from '../config-schema';

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel }) => {
  const { search } = useConfig() as PatientSearchConfig;

  const onClickSearchResult = useCallback((patientUuid) => {
    navigate({
      to: interpolateString(search.patientResultUrl, {
        patientUuid: patientUuid,
      }),
    });
    hidePanel();
  }, []);

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

  return (
    <>
      {fhirPatients.map((patient) => (
        <ResultCard
          patient={patient as fhir.Patient}
          key={patient.id}
          onSearchResultClick={onClickSearchResult}
          closeSearchResultsPanel={hidePanel}
        />
      ))}
    </>
  );
};

interface PatientSearchResultsProps {
  patients: Array<Patient>;
  hidePanel?: any;
}

export default PatientSearchResults;
