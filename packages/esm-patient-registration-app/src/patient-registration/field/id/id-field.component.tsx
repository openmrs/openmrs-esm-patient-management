import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SkeletonText } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useLayoutType, useConfig, isDesktop, UserHasAccess } from '@openmrs/esm-framework';
import IdentifierSelectionOverlay from './identifier-selection-overlay.component';
import IdentifierInput from '../../input/custom-input/identifier/identifier-input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import type {
  FormValues,
  IdentifierSource,
  PatientIdentifierType,
  PatientIdentifierValue,
} from '../../patient-registration.types';
import { ResourcesContext } from '../../../offline.resources';
import styles from '../field.scss';

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
  const manualEntryEnabled = identifierSource?.autoGenerationOption?.manualEntryEnabled;
  return {
    selectedSource: identifierSource,
    autoGeneration,
    identifierValue:
      autoGeneration && !manualEntryEnabled
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
  const isLoading = !identifierTypes?.length;
  const { values, setFieldValue, initialFormValues, isOffline } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [showIdentifierOverlay, setShowIdentifierOverlay] = useState(false);
  const config = useConfig();
  const { defaultPatientIdentifierTypes } = config;
  
  // Usamos una referencia para rastrear si ya agregamos el DNI inicialmente
  const initialDniAdded = useRef(false);

  useEffect(() => {
    if (identifierTypes) {
      const identifiers = {};
      
      // Agregamos los identificadores predeterminados según las reglas existentes
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
      
      // Solo agregamos el DNI en la inicialización inicial
      if (!initialDniAdded.current) {
        // Agregamos el identificador DNI por defecto
        if (!values.identifiers['dni']) {
          const dniIdentifierType = identifierTypes.find(type => 
            type.name === 'DNI' || type.uuid === '550e8400-e29b-41d4-a716-446655440001'
          );
          
          if (dniIdentifierType) {
            identifiers['dni'] = initializeIdentifier(dniIdentifierType, {});
          } else {
            identifiers['dni'] = {
              identifierTypeUuid: '550e8400-e29b-41d4-a716-446655440001',
              identifierName: 'DNI',
              preferred: false,
              initialValue: '',
              required: true,
              identifierValue: '',
              autoGeneration: false,
              selectedSource: null
            };
          }
        }
        
        // Marcamos que ya hemos agregado el DNI inicialmente
        initialDniAdded.current = true;
      }
      
      if (Object.keys(identifiers).length) {
        setFieldValue('identifiers', {
          ...values.identifiers,
          ...identifiers,
        });
      }
    }
  }, [identifierTypes, setFieldValue, defaultPatientIdentifierTypes, values.identifiers, initialFormValues.identifiers]);

  const closeIdentifierSelectionOverlay = useCallback(
    () => setShowIdentifierOverlay(false),
    [setShowIdentifierOverlay],
  );

  const removeIdentifier = useCallback(
    (identifierFieldName: string) => {
      setFieldValue('identifiers', deleteIdentifierType(values.identifiers, identifierFieldName));
    },
    [setFieldValue, values.identifiers]
  );

  if (isLoading && !isOffline) {
    return (
      <div className={styles.halfWidthInDesktopView}>
        <div className={styles.identifierLabelText}>
          <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        </div>
        <SkeletonText role="progressbar" />
      </div>
    );
  }

  return (
    <div className={styles.halfWidthInDesktopView}>
      <UserHasAccess privilege={['Get Identifier Types', 'Add patient identifiers']}>
        <div className={styles.identifierLabelText}>
          <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
          <Button
            kind="ghost"
            className={styles.configureIdentifiersButton}
            onClick={() => setShowIdentifierOverlay(true)}
            size={isDesktop(layout) ? 'sm' : 'md'}>
            {t('configure', 'Configure')} <ArrowRight className={styles.arrowRightIcon} size={16} />
          </Button>
        </div>
      </UserHasAccess>
      <div>
        {Object.entries(values.identifiers).map(([fieldName, identifier]) => {
          const patientIdentifierWithRequired = {
            ...values.identifiers[fieldName],
            required: true
          };
          
          const identifierType = identifierTypes?.find(type => type.fieldName === fieldName);
          const canRemove = !identifierType?.isPrimary && !identifierType?.required;
          
          return (
            <div key={fieldName} className={styles.identifierContainer}>
              <IdentifierInput 
                fieldName={fieldName} 
                patientIdentifier={patientIdentifierWithRequired} 
              />
              {canRemove && (
                <Button
                  className={styles.deleteIdentifierButton}
                  kind="ghost"
                  size={isDesktop(layout) ? 'sm' : 'md'}
                  onClick={() => removeIdentifier(fieldName)}>
                  {t('remove', 'Remove')}
                </Button>
              )}
            </div>
          );
        })}
        
        {showIdentifierOverlay && (
          <IdentifierSelectionOverlay setFieldValue={setFieldValue} closeOverlay={closeIdentifierSelectionOverlay} />
        )}
      </div>
    </div>
  );
};