import {
  filterOutUndefinedPatientIdentifiers,
  shouldHideElement,
  getAgeInYears,
  getHiddenFieldIds,
  sanitizeFormValuesForSkipLogic,
} from './patient-registration-utils';
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

describe('getAgeInYears', () => {
  it('should calculate age from birthdate correctly', () => {
    const currentYear = new Date().getFullYear();
    const values = { birthdate: `${currentYear - 30}-05-15` } as any;
    expect(getAgeInYears(values)).toBe(30);
  });

  it('should fallback to yearsEstimated when birthdate is absent', () => {
    const values = { yearsEstimated: 42 } as any;
    expect(getAgeInYears(values)).toBe(42);
  });

  it('should return undefined when neither birthdate nor yearsEstimated is present', () => {
    expect(getAgeInYears({} as any)).toBeUndefined();
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

describe('getHiddenFieldIds and sanitizeFormValuesForSkipLogic', () => {
  const testConfig: any = {
    sections: ['demographics', 'conditionalSection'],
    sectionDefinitions: [
      {
        id: 'demographics',
        name: 'Basic Info',
        fields: ['referredBy', 'fieldHiddenIfNo', 'adultOnlyField'],
      },
      {
        id: 'conditionalSection',
        name: 'Conditional Section',
        hideIf: { fieldId: 'referredBy', notEquals: 'Yes' },
        fields: ['sectionField1'],
      },
    ],
    fieldDefinitions: [
      { id: 'referredBy', type: 'person attribute', uuid: 'ref-uuid' },
      {
        id: 'fieldHiddenIfNo',
        type: 'person attribute',
        uuid: 'hidden-attr-uuid',
        hideIf: { fieldId: 'referredBy', notEquals: 'Yes' },
      },
      {
        id: 'adultOnlyField',
        type: 'obs',
        uuid: 'adult-obs-uuid',
        hideIfAge: { operator: '<', value: 18 },
      },
      {
        id: 'sectionField1',
        type: 'person attribute',
        uuid: 'sec-field-uuid',
      },
      {
        id: 'cascadingField',
        type: 'person attribute',
        uuid: 'cascade-uuid',
        hideIf: { fieldId: 'fieldHiddenIfNo', value: '' },
      },
    ],
  };

  it('should identify all hidden fields when conditions match', () => {
    const values: any = {
      yearsEstimated: 12,
      attributes: {
        'ref-uuid': 'No',
        'hidden-attr-uuid': 'Some Stale Value',
        'sec-field-uuid': 'Section Stale Value',
      },
      obs: {
        'adult-obs-uuid': 'Obs Stale Value',
      },
    };

    const hiddenIds = getHiddenFieldIds(values, testConfig, 12);
    expect(hiddenIds.has('fieldHiddenIfNo')).toBe(true);
    expect(hiddenIds.has('adultOnlyField')).toBe(true);
    expect(hiddenIds.has('sectionField1')).toBe(true);
    expect(hiddenIds.has('referredBy')).toBe(false);
  });

  it('should sanitize and strip values of hidden fields on form submission', () => {
    const values: any = {
      yearsEstimated: 12, // child (< 18)
      attributes: {
        'ref-uuid': 'No', // hides fieldHiddenIfNo and conditionalSection
        'hidden-attr-uuid': 'Secret answer',
        'sec-field-uuid': 'Invisible section answer',
      },
      obs: {
        'adult-obs-uuid': 'Adult obs answer',
      },
    };

    const sanitized = sanitizeFormValuesForSkipLogic(values, testConfig);

    // Visible field is retained
    expect(sanitized.attributes['ref-uuid']).toBe('No');

    // Hidden person attributes are reset to empty string
    expect(sanitized.attributes['hidden-attr-uuid']).toBe('');
    expect(sanitized.attributes['sec-field-uuid']).toBe('');

    // Hidden obs is removed
    expect(sanitized.obs['adult-obs-uuid']).toBeUndefined();
  });

  it('should preserve values when questions are visible', () => {
    const values: any = {
      yearsEstimated: 25,
      attributes: {
        'ref-uuid': 'Yes',
        'hidden-attr-uuid': 'Valid answer',
        'sec-field-uuid': 'Valid section answer',
      },
      obs: {
        'adult-obs-uuid': 'Valid obs answer',
      },
    };

    const sanitized = sanitizeFormValuesForSkipLogic(values, testConfig);

    expect(sanitized.attributes['ref-uuid']).toBe('Yes');
    expect(sanitized.attributes['hidden-attr-uuid']).toBe('Valid answer');
    expect(sanitized.attributes['sec-field-uuid']).toBe('Valid section answer');
    expect(sanitized.obs['adult-obs-uuid']).toBe('Valid obs answer');
  });
});
