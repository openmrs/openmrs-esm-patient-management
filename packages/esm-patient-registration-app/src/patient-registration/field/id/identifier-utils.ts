import type {
  FormValues,
  IdentifierSource,
  PatientIdentifierType,
  PatientIdentifierValue,
} from '../../patient-registration.types';

export function deleteIdentifierType(identifiers: FormValues['identifiers'], identifierFieldName) {
  return Object.fromEntries(Object.entries(identifiers).filter(([fieldName]) => fieldName !== identifierFieldName));
}

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
