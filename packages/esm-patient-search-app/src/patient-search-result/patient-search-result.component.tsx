import React, { useCallback, useMemo } from 'react';
import styles from './patient-search-result.scss';
import { ExtensionSlot, useConfig, interpolateString, navigate, ConfigurableLink } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel }) => {
  const config = useConfig();

  const onClickSearchResult = useCallback((evt, patientUuid) => {
    evt.preventDefault();
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
        <ConfigurableLink
          onClick={(evt) => onClickSearchResult(evt, patient.id)}
          to={interpolateString(config.search.patientResultUrl, {
            patientUuid: patient.id,
          })}
          key={patient.id}
          className={styles.patientSearchResult}
          role="a">
          <div className={styles.patientAvatar} role="img">
            <ExtensionSlot
              extensionSlotName="patient-photo-slot"
              state={{
                patientUuid: patient.id,
                patientName: `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`,
                size: 'small',
              }}
            />
          </div>
          <div>
            <h2 className={styles.patientName}>{`${patient.name?.[0]?.given?.join(' ')} ${
              patient.name?.[0]?.family
            }`}</h2>
            <p className={styles.demographics}>
              {patient.gender} &middot; {patient.birthDate} &middot; {patient.identifier?.[0]?.value}
            </p>
          </div>
        </ConfigurableLink>
      ))}
    </>
  );
};

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  hidePanel?: any;
}

export default PatientSearchResults;
