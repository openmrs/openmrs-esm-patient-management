import { Tag } from '@carbon/react';
import {
  age,
  ConfigurableLink,
  ExtensionSlot,
  getPatientName,
  interpolateString,
  PatientPhoto,
  useConfig,
} from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { forwardRef, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PatientSearchContext } from '../patient-search-context';
import type { FHIRIdentifier, FHIRPatientType, Identifier, SearchedPatient } from '../types';
import styles from './compact-patient-banner.scss';
import { toFhirPatient } from './compact-patient-search.resource';

interface ClickablePatientContainerProps {
  patient: SearchedPatient;
  children: React.ReactNode;
}

interface CompactPatientBannerProps {
  patients: Array<SearchedPatient>;
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

const CompactPatientBanner = forwardRef<HTMLDivElement, CompactPatientBannerProps>(({ patients }, ref) => {
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

  // TODO: If/When the online patient search is migrated to the FHIR API at some point, this could
  // be removed. In fact, it could maybe be done at this point already, but doing it when the
  // search returns FHIR objects is much simpler because the code which uses the `fhirPatients`
  // doesn't have to be touched then.
  const fhirPatients: Array<FHIRPatientType> = useMemo(() => {
    return patients.map(toFhirPatient);
  }, [patients]);

  return (
    <div ref={ref}>
      {fhirPatients.map((patient, index) => {
        const preferredIdentifier = patients[index].identifiers.find((identifier) => identifier.preferred);

        const configuredIdentifiers = patients[index].identifiers.filter(
          (identifier) =>
            !identifier.preferred && config.defaultIdentifierTypes.includes(identifier.identifierType.uuid),
        );

        const patientIdentifiers = preferredIdentifier
          ? [preferredIdentifier, ...configuredIdentifiers]
          : configuredIdentifiers;

        const patientName = getPatientName(patient as fhir.Patient);

        return (
          <ClickablePatientContainer key={patient.id} patient={patients[index]}>
            <div className={styles.patientAvatar} role="img">
              <PatientPhoto patientUuid={patient.id} patientName={patientName} size="small" />
            </div>
            <div>
              <div className={styles.flexRow}>
                <h2 className={styles.patientName}>{patientName}</h2>
                <ExtensionSlot
                  name="patient-banner-tags-slot"
                  state={{ patient, patientUuid: patient.id }}
                  className={styles.flexRow}
                />
              </div>
              <div className={styles.demographics}>
                {getGender(patient.gender)} <span className={styles.middot}>&middot;</span>{' '}
                {patient.birthDate && age(patient.birthDate)}
                <span className={styles.middot}>&middot;</span>
                {patientIdentifiers.map((identifier) => (
                  <IdentifierTag key={identifier.uuid} identifier={identifier} />
                ))}
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

export default CompactPatientBanner;
