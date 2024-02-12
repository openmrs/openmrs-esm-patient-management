import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { ConfigurableLink, ExtensionSlot, age, interpolateString, useConfig } from '@openmrs/esm-framework';
import { PatientSearchContext } from '../patient-search-context';
import type { FHIRIdentifier, FHIRPatientType, Identifier, SearchedPatient } from '../types';
import styles from './compact-patient-banner.scss';

interface ClickablePatientContainerProps {
  patient: SearchedPatient;
  children: React.ReactNode;
}

interface CustomIdentifierProps {
  patient: SearchedPatient;
  identifierName: string;
}

interface IdentifierTagProps {
  identifier: Identifier;
}

interface IdentifiersProps {
  identifiers: Array<Identifier>;
}

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
}

const CompactPatientBanner = React.forwardRef<HTMLDivElement, PatientSearchResultsProps>(({ patients }, ref) => {
  const config = useConfig();
  const { t } = useTranslation();

  const getGender = (gender: string) => {
    switch (gender) {
      case 'M':
        return t('male', 'Male');
      case 'F':
        return t('female', 'Female');
      case 'O':
        return t('other', 'Other');
      case 'U':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };

  const fhirPatients: Array<FHIRPatientType> = useMemo(() => {
    // TODO: If/When the online patient search is migrated to the FHIR API at some point, this could
    // be removed. In fact, it could maybe be done at this point already, but doing it when the
    // search returns FHIR objects is much simpler because the code which uses the `fhirPatients`
    // doesn't have to be touched then.
    return patients.map((patient) => {
      const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
      return {
        id: patient.uuid,
        name: [
          {
            id: String(Math.random()), // not used
            given: [patient.person.personName.givenName, patient.person.personName.middleName],
            family: patient.person.personName.familyName,
          },
        ],
        gender: patient.person.gender,
        birthDate: patient.person.birthdate,
        deceasedDateTime: patient.person.deathDate,
        deceasedBoolean: patient.person.dead,
        identifier: patient.identifiers as any as Array<FHIRIdentifier>,
        address: preferredAddress
          ? [
              {
                id: String(Math.random()), // not used
                city: preferredAddress.cityVillage,
                country: preferredAddress.country,
                postalCode: preferredAddress.postalCode,
                state: preferredAddress.stateProvince,
                use: 'home',
              },
            ]
          : [],
        telecom: patient.attributes?.filter((attribute) => attribute.attributeType.display == 'Telephone Number'),
      };
    });
  }, [patients]);

  return (
    <div ref={ref}>
      {fhirPatients.map((patient, index) => {
        const patientIdentifiers = patients[index].identifiers.filter((identifier) =>
          config.defaultIdentifierTypes.includes(identifier.identifierType.uuid),
        );

        return (
          <ClickablePatientContainer patient={patients[index]}>
            <div className={styles.patientAvatar} role="img">
              <ExtensionSlot
                name="patient-photo-slot"
                state={{
                  patientUuid: patient.id,
                  patientName: `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`,
                  size: 'small',
                }}
              />
            </div>
            <div>
              <div className={styles.flexRow}>
                <h2 className={styles.patientName}>{`${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]
                  ?.family}`}</h2>
                <ExtensionSlot
                  name="patient-banner-tags-slot"
                  state={{ patient, patientUuid: patient.id }}
                  className={styles.flexRow}
                />
              </div>
              <div className={styles.demographics}>
                {getGender(patient.gender)} <span className={styles.middot}>&middot;</span> {age(patient.birthDate)}
                <span className={styles.middot}>&middot;</span>
                {config.defaultIdentifierTypes.length ? (
                  <>
                    {patientIdentifiers.length > 1 ? (
                      <Identifiers identifiers={patientIdentifiers} />
                    ) : (
                      <CustomIdentifier patient={patients[index]} identifierName={config.defaultIdentifier} />
                    )}
                  </>
                ) : (
                  <>
                    <span className={styles.middot}>&middot;</span> {patients[index].identifiers?.[0]?.identifier}
                  </>
                )}
              </div>
            </div>
          </ClickablePatientContainer>
        );
      })}
    </div>
  );
});

const ClickablePatientContainer = ({ patient, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = useContext(PatientSearchContext);
  const config = useConfig();
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
  } else {
    return (
      <ConfigurableLink
        className={classNames(styles.patientSearchResult, {
          [styles.deceased]: isDeceased,
        })}
        key={patient.uuid}
        onBeforeNavigate={() => patientClickSideEffect?.(patient.uuid)}
        to={`${interpolateString(config.search.patientResultUrl, {
          patientUuid: patient.uuid,
        })}`}>
        {children}
      </ConfigurableLink>
    );
  }
};

const IdentifierTag: React.FC<IdentifierTagProps> = ({ identifier }) => {
  return (
    <>
      <Tag size="sm" className={styles.configuredTag} type="warm-gray" title={identifier.identifierType.display}>
        {identifier.identifierType.display}
      </Tag>
      <span className={styles.configuredLabel}>{identifier.identifier}</span>
    </>
  );
};

const Identifiers: React.FC<IdentifiersProps> = ({ identifiers }) => {
  return (
    <>
      {identifiers.map((identifier) => (
        <IdentifierTag identifier={identifier} />
      ))}
    </>
  );
};

const CustomIdentifier: React.FC<CustomIdentifierProps> = ({ patient, identifierName }) => {
  const identifier = patient.identifiers.find((identifier) => identifier.identifierType.display === identifierName);

  return identifier ? <IdentifierTag identifier={identifier} /> : null;
};

export default CompactPatientBanner;
