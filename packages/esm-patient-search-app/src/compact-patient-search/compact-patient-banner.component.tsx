import React, { forwardRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import {
  ConfigurableLink,
  getPatientName,
  interpolateString,
  PatientBannerPatientInfo,
  PatientPhoto,
  useConfig,
} from '@openmrs/esm-framework';
import type { FHIRPatientType, SearchedPatient } from '../types';
import { type PatientSearchConfig } from '../config-schema';
import { usePatientSearchContext } from '../patient-search-context';
import styles from './compact-patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: SearchedPatient;
}

interface CompactPatientBannerProps {
  patients: Array<SearchedPatient>;
}

const getGender = (gender: string) => {
  switch (gender) {
    case 'M':
      return 'male';
    case 'F':
      return 'female';
    case 'O':
      return 'other';
    case 'U':
      return 'unknown';
    default:
      return gender;
  }
};

const CompactPatientBanner = forwardRef<HTMLDivElement, CompactPatientBannerProps>(({ patients }, ref) => {
  const fhirMappedPatients: Array<FHIRPatientType> = useMemo(() => {
    // TODO: If/When the online patient search is migrated to the FHIR API at some point, this could
    // be removed. In fact, it could maybe be done at this point already, but doing it when the
    // search returns FHIR objects is much simpler because the code which uses the `fhirPatients`
    // doesn't have to be touched then.
    return patients.map((patient) => {
      const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
      const addressId = uuidv4();
      const nameId = uuidv4();
      return {
        address: preferredAddress
          ? [
              {
                id: addressId,
                city: preferredAddress.cityVillage,
                country: preferredAddress.country,
                postalCode: preferredAddress.postalCode,
                state: preferredAddress.stateProvince,
                use: 'home',
              },
            ]
          : [],
        birthDate: patient.person.birthdate,
        deceasedBoolean: patient.person.dead,
        deceasedDateTime: patient.person.deathDate,
        gender: getGender(patient.person.gender),
        id: patient.uuid,
        identifier: patient.identifiers.map((identifier) => ({
          id: identifier.uuid,
          type: {
            coding: [
              {
                code: identifier.identifierType.uuid,
              },
            ],
            text: identifier.identifierType.display,
          },
          use: 'official',
          value: identifier.identifier,
        })),
        name: [
          {
            id: nameId,
            given: [patient.person.personName.givenName, patient.person.personName.middleName],
            family: patient.person.personName.familyName,
            text: patient.person.personName.display,
          },
        ],
        telecom: patient.attributes?.filter((attribute) => attribute.attributeType.display === 'Telephone Number'),
      };
    });
  }, [patients]);

  const renderPatient = useCallback(
    (patient: FHIRPatientType, index: number) => {
      const patientName = getPatientName(patient);

      return (
        <ClickablePatientContainer key={patient.id} patient={patients[index]}>
          <div className={styles.patientAvatar} role="img">
            <PatientPhoto patientUuid={patient.id} patientName={patientName} />
          </div>
          <PatientBannerPatientInfo patient={patient} />
        </ClickablePatientContainer>
      );
    },
    [patients],
  );

  return <div ref={ref}>{fhirMappedPatients.map(renderPatient)}</div>;
});

const ClickablePatientContainer = ({ patient, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = usePatientSearchContext();
  const config = useConfig<PatientSearchConfig>();
  const isDeceased = Boolean(patient?.person?.deathDate);

  if (nonNavigationSelectPatientAction) {
    return (
      <button
        className={classNames(styles.patientSearchResult, styles.patientSearchResultButton, {
          [styles.deceased]: isDeceased,
        })}
        key={patient.uuid}
        onClick={() => {
          nonNavigationSelectPatientAction(patient.uuid);
          patientClickSideEffect?.(patient.uuid);
        }}>
        {children}
      </button>
    );
  }

  return (
    <ConfigurableLink
      className={classNames(styles.patientSearchResult, {
        [styles.deceased]: isDeceased,
      })}
      key={patient.uuid}
      onBeforeNavigate={() => patientClickSideEffect?.(patient.uuid)}
      to={interpolateString(config.search.patientChartUrl, {
        patientUuid: patient.uuid,
      })}>
      {children}
    </ConfigurableLink>
  );
};

export default CompactPatientBanner;
