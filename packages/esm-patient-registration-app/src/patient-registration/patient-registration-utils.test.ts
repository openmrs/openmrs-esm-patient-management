import { filterOutUndefinedPatientIdentifiers, shouldHideElement } from './patient-registration-utils';
import { vi, describe, it, expect } from 'vitest';

describe('filterOutUndefinedPatientIdentifiers', () => {
  const getIdentifiers = (autoGeneration = true, manualEntryEnabled = false) => ({
    OpenMRSId: {
      autoGeneration: autoGeneration,
      identifierName: 'OpenMRS ID',
      identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
      identifierValue: undefined,
      initialValue: '100GEJ',
      preferred: true,
      required: true,
      selectedSource: {
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: manualEntryEnabled,
          automaticGenerationEnabled: autoGeneration,
        },
      },
    },
  });

  it('should filter out undefined identifiers', () => {
    const filteredIdentifiers = filterOutUndefinedPatientIdentifiers(getIdentifiers());
    expect(filteredIdentifiers.OpenMRSId).not.toBeDefined();
  });

  it('should retain auto-generated identifiers with manual entry', () => {
    const filteredIdentifiers = filterOutUndefinedPatientIdentifiers(getIdentifiers(true, true));
    expect(filteredIdentifiers.OpenMRSId).toBeDefined();
  });
});

describe('shouldHideElement', () => {
  const mockConfig: any = {
    fieldDefinitions: [
      { id: 'testField1', type: 'person attribute', uuid: '123' },
      { id: 'testField2', type: 'person attribute', uuid: '456' },
    ],
  };

  it('should return false if there is no hideIf or hideIfAge condition', () => {
    const fieldDef: any = { id: 'test' };
    expect(shouldHideElement(fieldDef, {} as any, mockConfig, 25)).toBe(false);
  });

  describe('hideIf (Equals)', () => {
    const fieldDef: any = {
      id: 'test',
      hideIf: { fieldId: 'testField2', value: 'Yes' },
    };

    it('should show (return false) if the prerequisite field is empty/undefined', () => {
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, 25)).toBe(false);
      expect(shouldHideElement(fieldDef, { attributes: { '456': '' } } as any, mockConfig, 25)).toBe(false);
    });

    it('should show (return false) if the prerequisite field does not match the target value', () => {
      expect(shouldHideElement(fieldDef, { attributes: { '456': 'No' } } as any, mockConfig, 25)).toBe(false);
    });

    it('should hide (return true) if the prerequisite field matches the target value', () => {
      expect(shouldHideElement(fieldDef, { attributes: { '456': 'Yes' } } as any, mockConfig, 25)).toBe(true);
    });
  });

  describe('hideIf (notEquals)', () => {
    const fieldDef: any = {
      id: 'test',
      hideIf: { fieldId: 'testField2', notEquals: 'Yes' },
    };

    it('should hide (return true) if the prerequisite field is empty/undefined', () => {
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, 25)).toBe(true);
    });

    it('should hide (return true) if the prerequisite field does not match the notEquals value (e.g. is No)', () => {
      expect(shouldHideElement(fieldDef, { attributes: { '456': 'No' } } as any, mockConfig, 25)).toBe(true);
    });

    it('should show (return false) if the prerequisite field equals the notEquals value', () => {
      expect(shouldHideElement(fieldDef, { attributes: { '456': 'Yes' } } as any, mockConfig, 25)).toBe(false);
    });
  });

  describe('hideIfAge', () => {
    const fieldDef: any = {
      id: 'testField1',
      hideIfAge: { operator: '<', value: 18 },
    };

    it('should hide if age matches the condition (e.g. < 18)', () => {
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, 10)).toBe(true);
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, 17)).toBe(true);
    });

    it('should show if age does not match the condition', () => {
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, 18)).toBe(false);
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, 25)).toBe(false);
    });

    it('should show (return false) if age is undefined and a hideIfAge condition exists', () => {
      expect(shouldHideElement(fieldDef, {} as any, mockConfig, undefined)).toBe(false);
    });
  });
});
