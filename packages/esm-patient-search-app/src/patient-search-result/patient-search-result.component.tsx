import React, { useCallback, useMemo } from 'react';
import styles from './patient-search-result.scss';
import { ExtensionSlot, useConfig, interpolateString, navigate } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel }) => {
  const config = useConfig();

  const onClickSearchResult = useCallback((patientUuid) => {
    navigate({
      to: interpolateString(config.search.patientResultUrl, {
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
        <div key={patient.id} className={styles.patientChart}>
          <div className={styles.container}>
            <ExtensionSlot
              extensionSlotName="patient-header-slot"
              state={{
                patient,
                patientUuid: patient.id,
                onClick: onClickSearchResult,
                onTransition: hidePanel,
                hideActionsOverflow: config.search.hideActionsOverflow,
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  hidePanel?: any;
}

export default PatientSearchResults;
