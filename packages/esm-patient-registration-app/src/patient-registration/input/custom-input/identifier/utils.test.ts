import { isUniqueIdentifierTypeForOffline, shouldBlockPatientIdentifierInOfflineMode } from './utils';

interface IdentifierTypeOptions {
  uniquenessBehavior?: 'UNIQUE' | 'LOCATION' | 'NON_UNIQUE';
  manualEntryEnabled?: boolean;
  automaticGenerationEnabled?: boolean;
}

function createIdentifierType(options: IdentifierTypeOptions) {
  return {
    uniquenessBehavior: options.uniquenessBehavior,
    identifierSources: [
      {
        uuid: 'identifier-source-uuid',
        name: 'Identifier Source Name',
        autoGenerationOption: {
          manualEntryEnabled: options.manualEntryEnabled,
          automaticGenerationEnabled: options.automaticGenerationEnabled,
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

  it('should return false if identifierType is NON_UNIQUE', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: 'NON_UNIQUE' });
    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(false);
  });

  it('should return false if identifierType is unique but has automatic generation only (no manual entry)', () => {
    const identifierType = createIdentifierType({
      uniquenessBehavior: 'UNIQUE',
      manualEntryEnabled: false,
      automaticGenerationEnabled: true,
    });
    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(false);
  });

  it('should return true if identifierType is unique and manual entry is enabled', () => {
    const identifierType = createIdentifierType({
      uniquenessBehavior: 'UNIQUE',
      manualEntryEnabled: true,
      automaticGenerationEnabled: false,
    });
    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(true);
  });

  it('should return true if identifierType is unique and both manual entry and auto generation are enabled', () => {
    const identifierType = createIdentifierType({
      uniquenessBehavior: 'UNIQUE',
      manualEntryEnabled: true,
      automaticGenerationEnabled: true,
    });
    const result = shouldBlockPatientIdentifierInOfflineMode(identifierType);

    expect(result).toBe(true);
  });

  it('should return true if identifierType is unique with LOCATION behavior and manual entry enabled', () => {
    const identifierType = createIdentifierType({
      uniquenessBehavior: 'LOCATION',
      manualEntryEnabled: true,
      automaticGenerationEnabled: false,
    });
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

  it('should return false if uniquenessBehavior is NON_UNIQUE', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: 'NON_UNIQUE' });
    const result = isUniqueIdentifierTypeForOffline(identifierType);

    expect(result).toBe(false);
  });

  it('should return false if uniquenessBehavior is null or undefined', () => {
    const identifierType = createIdentifierType({ uniquenessBehavior: null });
    const result = isUniqueIdentifierTypeForOffline(identifierType);

    expect(result).toBe(false);
  });
});
