import {
  filterOutUndefinedPatientIdentifiers,
  shouldHideElement,
  getAgeInYears,
  getFieldValue,
  getHiddenElements,
  sanitizeFormValuesForSkipLogic,
} from './patient-registration-utils';
import { vi, describe, it, expect, afterEach } from 'vitest';

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
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate age from birthdate correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T12:00:00'));
    const values = { birthdate: '1996-05-15' } as any;
    expect(getAgeInYears(values)).toBe(30);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T12:00:00'));
    expect(getAgeInYears({ birthdate: new Date('2008-12-25T00:00:00') } as any)).toBe(17);
  });

  it('counts a birthday that has already happened this year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T12:00:00'));
    expect(getAgeInYears({ birthdate: new Date('2008-01-15T00:00:00') } as any)).toBe(18);
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

describe('getHiddenElements and sanitizeFormValuesForSkipLogic', () => {
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

    const { fieldIds: hiddenIds, sectionIds } = getHiddenElements(values, testConfig);
    expect(hiddenIds.has('fieldHiddenIfNo')).toBe(true);
    expect(hiddenIds.has('adultOnlyField')).toBe(true);
    expect(hiddenIds.has('sectionField1')).toBe(true);
    expect(hiddenIds.has('referredBy')).toBe(false);
    expect(sectionIds.has('conditionalSection')).toBe(true);
    expect(sectionIds.has('demographics')).toBe(false);
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

    // Hidden person attributes are deleted rather than set to empty string
    expect(sanitized.attributes['hidden-attr-uuid']).toBeUndefined();
    expect(sanitized.attributes['sec-field-uuid']).toBeUndefined();

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

  it('does not delete built-in fields when a section containing built-in fields is hidden', () => {
    const configWithBuiltinSection: any = {
      sections: ['hiddenBuiltinSection'],
      sectionDefinitions: [
        {
          id: 'hiddenBuiltinSection',
          name: 'Hidden Built-in Section',
          hideIf: { fieldId: 'triggerField', value: 'hide' },
          fields: ['gender', 'dob', 'name', 'id', 'unmatchedCustomField'],
        },
      ],
      fieldDefinitions: [{ id: 'triggerField', type: 'person attribute', uuid: 'trigger-uuid' }],
    };

    const values: any = {
      gender: 'female',
      birthdate: '2000-01-01',
      givenName: 'Jane',
      familyName: 'Doe',
      identifiers: { OpenMRSId: { identifierValue: '123' } },
      unmatchedCustomField: 'some-value',
      attributes: {
        'trigger-uuid': 'hide',
      },
    };

    const sanitized = sanitizeFormValuesForSkipLogic(values, configWithBuiltinSection);
    expect(sanitized.gender).toBe('female');
    expect(sanitized.birthdate).toBe('2000-01-01');
    expect(sanitized.givenName).toBe('Jane');
    expect(sanitized.familyName).toBe('Doe');
    expect(sanitized.identifiers).toBeDefined();
    expect((sanitized as any).unmatchedCustomField).toBe('some-value');
  });

  it('hides a field whose condition depends on the stale value of a hidden field, in the UI and on submit', () => {
    // F sits in a section that is hidden unless ref is 'Yes'. G sits in a visible section and is
    // hidden unless F is 'Yes'. F still holds a stale 'Yes' from before ref was changed.
    const cascadeConfig: any = {
      sections: ['visible', 'conditional'],
      sectionDefinitions: [
        { id: 'visible', name: 'Visible', fields: ['ref', 'G'] },
        { id: 'conditional', name: 'Conditional', hideIf: { fieldId: 'ref', notEquals: 'Yes' }, fields: ['F'] },
      ],
      fieldDefinitions: [
        { id: 'ref', type: 'person attribute', uuid: 'ref-uuid' },
        { id: 'F', type: 'person attribute', uuid: 'f-uuid' },
        { id: 'G', type: 'person attribute', uuid: 'g-uuid', hideIf: { fieldId: 'F', notEquals: 'Yes' } },
      ],
    };
    const values: any = { attributes: { 'ref-uuid': 'No', 'f-uuid': 'Yes', 'g-uuid': 'typed' } };

    const { fieldIds } = getHiddenElements(values, cascadeConfig);
    expect(fieldIds.has('F')).toBe(true);
    expect(fieldIds.has('G')).toBe(true);

    const sanitized = sanitizeFormValuesForSkipLogic(values, cascadeConfig);
    expect(sanitized.attributes).toEqual({ 'ref-uuid': 'No' });
  });

  it('keeps evaluating when clearing a field un-hides one field and hides another', () => {
    // Clearing A un-hides B (hidden while A is 'x') and hides C (hidden while A is empty),
    // so the number of hidden fields stays the same while the members change.
    const swapConfig: any = {
      sections: ['main'],
      sectionDefinitions: [{ id: 'main', name: 'Main', fields: ['trigger', 'A', 'B', 'C'] }],
      fieldDefinitions: [
        { id: 'trigger', type: 'person attribute', uuid: 'trigger-uuid' },
        { id: 'A', type: 'person attribute', uuid: 'a-uuid', hideIf: { fieldId: 'trigger', value: 'hideA' } },
        { id: 'B', type: 'person attribute', uuid: 'b-uuid', hideIf: { fieldId: 'A', value: 'x' } },
        { id: 'C', type: 'person attribute', uuid: 'c-uuid', hideIf: { fieldId: 'A', value: '' } },
      ],
    };
    const values: any = { attributes: { 'trigger-uuid': 'hideA', 'a-uuid': 'x', 'b-uuid': 'b', 'c-uuid': 'c' } };

    const { fieldIds } = getHiddenElements(values, swapConfig);
    expect([...fieldIds].sort()).toEqual(['A', 'C']);

    const sanitized = sanitizeFormValuesForSkipLogic(values, swapConfig);
    expect(sanitized.attributes).toEqual({ 'trigger-uuid': 'hideA', 'b-uuid': 'b' });
  });

  it('restores the initial address and strips the phone when the contact section is hidden', () => {
    const contactConfig: any = {
      sections: ['contact'],
      sectionDefinitions: [
        {
          id: 'contact',
          name: 'Contact',
          hideIf: { fieldId: 'gender', value: 'unknown' },
          fields: ['address', 'phone'],
        },
      ],
      fieldDefinitions: [],
      fieldConfigurations: { phone: { personAttributeUuid: 'phone-uuid' } },
    };
    const values: any = {
      gender: 'unknown',
      address: { cityVillage: 'Typed city' },
      attributes: { 'phone-uuid': '0700000000' },
    };
    const initialFormValues: any = { address: { cityVillage: 'Saved city' } };

    const sanitized = sanitizeFormValuesForSkipLogic(values, contactConfig, initialFormValues);

    expect(sanitized.address).toEqual({ cityVillage: 'Saved city' });
    expect(sanitized.attributes['phone-uuid']).toBeUndefined();
  });
});

describe('getFieldValue', () => {
  const config: any = {
    fieldDefinitions: [{ id: 'custom', type: 'obs', uuid: 'custom-uuid' }],
    fieldConfigurations: { phone: { personAttributeUuid: 'phone-uuid' } },
  };
  const values: any = {
    gender: 'female',
    birthdate: '2000-01-01',
    deathCause: 'cause-uuid',
    isDead: true,
    attributes: { 'phone-uuid': '0700000000' },
    obs: { 'custom-uuid': 'obs value' },
  };

  it.each([
    ['gender', 'female'],
    ['dob', '2000-01-01'],
    ['phone', '0700000000'],
    ['causeOfDeath', 'cause-uuid'],
    ['custom', 'obs value'],
    ['isDead', true],
  ])('reads the value of %s', (fieldId, expected) => {
    expect(getFieldValue(fieldId, values, config)).toBe(expected);
  });

  it('lets hideIf reference a built-in field', () => {
    expect(shouldHideElement({ hideIf: { fieldId: 'phone', value: '0700000000' } }, values, config)).toBe(true);
  });
});
