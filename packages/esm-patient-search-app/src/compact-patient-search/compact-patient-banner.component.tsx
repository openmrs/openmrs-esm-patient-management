import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonIcon, SkeletonText, Tag } from '@carbon/react';
import { ExtensionSlot, useConfig, interpolateString, ConfigurableLink, age } from '@openmrs/esm-framework';
import { Identifier, SearchedPatient } from '../types/index';
import styles from './compact-patient-banner.scss';

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  selectPatientAction?: (evt: any, index: number) => void;
}

const PatientSearchResults = React.forwardRef<HTMLDivElement, PatientSearchResultsProps>(
  ({ patients, selectPatientAction }, ref) => {
    const config = useConfig();
    const { t } = useTranslation();

    const getGender = (gender) => {
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

    const fhirPatients = useMemo(() => {
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
              given: [patient.person.personName.givenName, patient.person.personName.middleName],
              family: patient.person.personName.familyName,
            },
          ],
          gender: patient.person.gender,
          birthDate: patient.person.birthdate,
          deceasedDateTime: patient.person.deathDate,
          deceasedBoolean: patient.person.death,
          identifier: patient.identifiers,
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
          telecom: patient.attributes?.filter((attribute) => attribute.attributeType.display == 'Telephone Number'),
        };
      });
    }, [patients]);

    return (
      <div ref={ref}>
        {fhirPatients.map((patient, indx) => {
          const patientIdentifiers = patient.identifier.filter((identifier) =>
            config.defaultIdentifierTypes.includes(identifier.identifierType.uuid),
          );
          const isDeceased = Boolean(patient?.deceasedDateTime);
          return (
            <ConfigurableLink
              onClick={(evt) => selectPatientAction(evt, indx)}
              to={`${interpolateString(config.search.patientResultUrl, {
                patientUuid: patient.id,
              })}/${encodeURIComponent(config.search.redirectToPatientDashboard)}`}
              key={patient.id}
              className={`${styles.patientSearchResult} ${isDeceased ? styles.deceased : ''}`}>
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
                <div className={styles.flexRow}>
                  <h2 className={styles.patientName}>{`${patient.name?.[0]?.given?.join(' ')} ${
                    patient.name?.[0]?.family
                  }`}</h2>
                  <ExtensionSlot
                    extensionSlotName="patient-banner-tags-slot"
                    state={{ patient }}
                    className={styles.flexRow}
                    select={(extensions) => extensions.filter((ext) => ext.name === 'deceased-patient-tag')}
                  />
                </div>
                <p className={styles.demographics}>
                  {getGender(patient.gender)} <span className={styles.middot}>&middot;</span> {age(patient.birthDate)}
                  <span className={styles.middot}>&middot;</span>
                  {config.defaultIdentifierTypes.length ? (
                    <>
                      {patientIdentifiers.length > 1 ? (
                        <PatientIdentifier identifiers={patientIdentifiers} />
                      ) : (
                        <CustomIdentifier patient={patients[indx]} identifierName={config.defaultIdentifier} />
                      )}
                    </>
                  ) : (
                    <>
                      <span className={styles.middot}>&middot;</span> {patient.identifier?.[0]?.identifier}
                    </>
                  )}
                </p>
              </div>
            </ConfigurableLink>
          );
        })}
      </div>
    );
  },
);

export const SearchResultSkeleton = () => {
  return (
    <div className={styles.patientSearchResult}>
      <div className={styles.patientAvatar} role="img">
        <SkeletonIcon
          style={{
            height: '3rem',
            width: '3rem',
          }}
        />
      </div>
      <div>
        <h2>
          <SkeletonText />
        </h2>
        <span className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span> <SkeletonIcon />{' '}
          <span className={styles.middot}>&middot;</span> <SkeletonIcon />
        </span>
      </div>
    </div>
  );
};

const PatientIdentifier: React.FC<{ identifiers: Array<Identifier> }> = ({ identifiers }) => {
  return (
    <>
      {identifiers.map((identifier) => (
        <>
          <Tag size="sm" className={styles.configuredTag} type="warm-gray" title={identifier.identifierType.display}>
            {identifier.identifierType.display}
          </Tag>
          <span className={styles.configuredLabel}>{identifier.identifier}</span>
        </>
      ))}
    </>
  );
};

const CustomIdentifier: React.FC<{ patient: SearchedPatient; identifierName: string }> = ({
  patient,
  identifierName,
}) => {
  const identifier = patient.identifiers.find((identifier) => identifier.identifierType.display === identifierName);
  return identifier ? (
    <>
      <Tag size="sm" className={styles.configuredTag} type="warm-gray" title={identifier.display}>
        {identifier.identifierType.display}
      </Tag>
      <span className={styles.configuredLabel}>{identifier.identifier}</span>
    </>
  ) : null;
};

export default PatientSearchResults;
