import { isUniqueIdentifierTypeForOffline, shouldBlockPatientIdentifierInOfflineMode } from './utils';

interface IdentifierTypeOptions {
  uniquenessBehavior?: 'UNIQUE' | 'LOCATION' | 'NON_UNIQUE';
  manualEntryEnabled?: boolean;
  automaticGenerationEnabled?: boolean;
}

function createIdentifierType(options: IdentifierTypeOptions) {
  return {
    uniquenessBehavior: (options.uniquenessBehavior as 'UNIQUE' | 'LOCATION' | 'NON_UNIQUE') || null,
    identifierSources: [
      {
        uuid: 'identifier-source-uuid',
        name: 'Identifier Source Name',
        autoGenerationOption: {
          manualEntryEnabled: (options.manualEntryEnabled as boolean) || false,
          automaticGenerationEnabled: (options.automaticGenerationEnabled as boolean) || true,
        },
      },
    ],
    name: 'Identifier Type Name',
    required: true,
    uuid: 'identifier-type-uuid',
    fieldName: 'identifierFieldName',
    format: 'identifierFormat',
    isPrimary: true,
  };
}

describe('shouldBlockPatientIdentifierInOfflineMode function', () => {
  it('should return false if identifierType is not unique', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: null });

    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(false);
  });

  it('should return false if identifierType is unique and no manual entry is enabled', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: null });

    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(false);
  });

  it('should return true if identifierType is unique and manual entry is enabled', () => {
    const identifierType = createIdentifierType({ manualEntryEnabled: true, uniquenessBehavior: 'UNIQUE' });

    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(true);
  });
});

describe('isUniqueIdentifierTypeForOffline function', () => {
  it('should return true if uniquenessBehavior is UNIQUE', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: 'UNIQUE' });

    const result = isUniqueIdentifierTypeForOffline(identifierType);

    expect(result).toBe(true);
  });

  it('should return true if uniquenessBehavior is LOCATION', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: 'LOCATION' });

    const result = isUniqueIdentifierTypeForOffline(identifierType);

    expect(result).toBe(true);
  });

  it('should return false for other uniqueness behaviors', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: null });

    const result = isUniqueIdentifierTypeForOffline(identifierType);

    expect(result).toBe(false);
  });
});
