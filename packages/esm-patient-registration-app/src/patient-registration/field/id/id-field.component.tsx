import React, { useContext, useEffect, useState } from 'react';
import { IdentifierInput } from '../../input/custom-input/identifier/identifier-input.component';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Button, SkeletonText } from 'carbon-components-react';
import { ArrowRight16 } from '@carbon/icons-react';
import { useLayoutType, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import {
  FormValues,
  IdentifierSource,
  PatientIdentifierType,
  PatientIdentifierValue,
} from '../../patient-registration-types';
import IdentifierSelectionOverlay from './identifier-selection-overlay';
import { ResourcesContext } from '../../../offline.resources';

export function setIdentifierSource(
  identifierSource: IdentifierSource,
  identifierValue: string,
  initialValue: string,
): {
  identifierValue: string;
  autoGeneration: boolean;
  selectedSource: IdentifierSource;
} {
  const autoGeneration = identifierSource?.autoGenerationOption?.automaticGenerationEnabled;
  return {
    selectedSource: identifierSource,
    autoGeneration,
    identifierValue: autoGeneration
      ? 'auto-generated'
      : identifierValue !== 'auto-generated'
      ? identifierValue
      : initialValue,
  };
}

export function initializeIdentifier(identifierType: PatientIdentifierType, identifierProps): PatientIdentifierValue {
  return {
    identifierTypeUuid: identifierType.uuid,
    identifierName: identifierType.name,
    preferred: identifierType.isPrimary,
    initialValue: '',
    required: identifierType.isPrimary || identifierType.required,
    ...identifierProps,
    ...setIdentifierSource(
      identifierProps?.selectedSource ?? identifierType.identifierSources?.[0],
      identifierProps?.identifierValue,
      identifierProps?.initialValue ?? '',
    ),
  };
}

export function deleteIdentifierType(identifiers: FormValues['identifiers'], identifierFieldName) {
  return Object.fromEntries(Object.entries(identifiers).filter(([fieldName]) => fieldName !== identifierFieldName));
}

export const Identifiers: React.FC = () => {
  const { identifierTypes } = useContext(ResourcesContext);
  const isLoading = !identifierTypes;
  const { values, setFieldValue, initialFormValues } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const desktop = useLayoutType() === 'desktop';
  const [showIdentifierOverlay, setShowIdentifierOverlay] = useState(false);
  const config = useConfig();
  const { defaultPatientIdentifierTypes } = config;

  useEffect(() => {
    // Initialization
    if (identifierTypes) {
      const identifiers = {};
      identifierTypes
        .filter(
          (type) =>
            type.isPrimary ||
            type.required ||
            !!defaultPatientIdentifierTypes?.find(
              (defaultIdentifierTypeUuid) => defaultIdentifierTypeUuid === type.uuid,
            ),
        )
        .filter((type) => !values.identifiers[type.fieldName])
        .forEach((type) => {
          identifiers[type.fieldName] = initializeIdentifier(
            type,
            values.identifiers[type.uuid] ?? initialFormValues.identifiers[type.uuid] ?? {},
          );
        });
      /*
        Identifier value should only be updated if there is any update in the
        identifier values, otherwise, if the below 'if' clause is removed, it will
        fall into an infinite run.
      */
      if (Object.keys(identifiers).length) {
        setFieldValue('identifiers', {
          ...values.identifiers,
          ...identifiers,
        });
      }
    }
  }, [
    identifierTypes,
    setFieldValue,
    defaultPatientIdentifierTypes,
    values.identifiers,
    initialFormValues.identifiers,
  ]);

  if (isLoading) {
    return (
      <div className={styles.halfWidthInDesktopView}>
        <div className={styles.identifierLabelText}>
          <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        </div>
        <SkeletonText />
      </div>
    );
  }

  return (
    <div className={styles.halfWidthInDesktopView}>
      <UserHasAccess privilege="coreapps.systemAdministration">
        <div className={styles.identifierLabelText}>
          <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
          <Button
            kind="ghost"
            className={styles.setIDNumberButton}
            onClick={() => setShowIdentifierOverlay(true)}
            size={desktop ? 'sm' : 'md'}>
            {t('configure', 'Configure')} <ArrowRight16 />
          </Button>
        </div>
      </UserHasAccess>
      <div>
        {Object.entries(values.identifiers).map(([fieldName, identifier]) => (
          <IdentifierInput key={fieldName} fieldName={fieldName} patientIdentifier={identifier} />
        ))}
        {showIdentifierOverlay && (
          <IdentifierSelectionOverlay
            setFieldValue={setFieldValue}
            closeOverlay={() => setShowIdentifierOverlay(false)}
          />
        )}
      </div>
    </div>
  );
};
