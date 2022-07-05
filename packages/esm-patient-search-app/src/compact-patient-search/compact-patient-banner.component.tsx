import React, { useCallback, useMemo } from 'react';
import styles from './compact-patient-banner.scss';
import { ExtensionSlot, useConfig, interpolateString, navigate, ConfigurableLink } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';
import { SkeletonIcon, SkeletonText } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';

export function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var years = today.getFullYear() - birthDate.getFullYear();
  var months = today.getMonth() - birthDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  if (years > 0) {
    return `${years} years`;
  }
  var d = today.getDate() - birthDate.getDate();
  if (d < 0) {
    months--;
  }
  if (months > 0) {
    return `${months} months`;
  }
  return `${d} days`;
}

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  hidePanel?: any;
  selectPatientAction?: (patientUuid: string) => void;
}

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel, selectPatientAction }) => {
  const config = useConfig();
  const { t } = useTranslation();

  const getGender = (gender) => {
    switch (gender) {
      case 'M':
        return t('male');
      case 'F':
        return t('female');
      case 'O':
        return t('other');
      case 'U':
        return t('unknown');
      default:
        return gender;
    }
    /* 
      Don't remove these comments
      t('male', 'Male')
      t('female', 'Female')
      t('other', 'Other')
      t('unknown', 'Unknown')
    */
  };

  const onClickSearchResult = useCallback(
    (evt, patientUuid) => {
      evt.preventDefault();
      if (selectPatientAction) {
        selectPatientAction(patientUuid);
      } else {
        navigate({
          to: interpolateString(config.search.patientResultUrl, {
            patientUuid: patientUuid,
          }),
        });
      }
      if (hidePanel) {
        hidePanel();
      }
    },
    [config.search.patientResultUrl, hidePanel],
  );

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
          className={styles.patientSearchResult}>
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
              {getGender(patient.gender)} <span className={styles.middot}>&middot;</span> {getAge(patient.birthDate)}{' '}
              <span className={styles.middot}>&middot;</span> {patient.identifier?.[0]?.value}
            </p>
          </div>
        </ConfigurableLink>
      ))}
    </>
  );
};

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
        <h2 className={styles.patientName}>
          <SkeletonText />
        </h2>
        <p className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span> <SkeletonIcon />{' '}
          <span className={styles.middot}>&middot;</span> <SkeletonIcon />
        </p>
      </div>
    </div>
  );
};

export default PatientSearchResults;
