import React, { useMemo, useState } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './search-results.scss';
import { SearchTypes } from '../types';
import { launchOverlay } from '../hooks/useOverlay';
import CreateAppointmentsForm from '../appointment-forms/create-appointment-form.component';

interface SearchResultsProps {
  patients: Array<any>;
  hidePanel?: any;
  toggleSearchType: (searchMode: SearchTypes, patient: fhir.Patient) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ patients, toggleSearchType }) => {
  const fhirPatients = useMemo(() => {
    return patients?.map((patient) => {
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
            value: patient.patientIdentifier?.identifier, // PatientIdentifier can be null sometimes
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

  const onClickSearchResult = (patient: fhir.Patient) => {
    launchOverlay('Create Appointment', <CreateAppointmentsForm patient={patient} patientUuid={patient.id} />);
  };

  return (
    <>
      {fhirPatients?.map((patient) => (
        <div key={patient.id} className={styles.patientChart}>
          <div className={styles.container}>
            <ExtensionSlot
              extensionSlotName="patient-header-slot"
              state={{
                patient,
                patientUuid: patient.id,
                onClick: () => onClickSearchResult(patient),
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchResults;
