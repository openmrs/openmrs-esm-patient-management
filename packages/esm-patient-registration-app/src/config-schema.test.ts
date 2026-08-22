import { describe, expect, it } from 'vitest';
import { getDefaultsFromConfigSchema } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type FieldDefinition, type RegistrationConfig } from './config-schema';

const obsFieldDefinition: FieldDefinition = {
  id: 'chief-complaint',
  type: 'obs',
  label: 'Chief complaint',
  placeholder: '',
  showHeading: false,
  uuid: 'chief-complaint-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const personAttributeFieldDefinition: FieldDefinition = {
  ...obsFieldDefinition,
  id: 'referred-by',
  type: 'person attribute',
  label: 'Referred by',
  uuid: 'referred-by-uuid',
};

function buildConfig(overrides: Partial<RegistrationConfig> = {}): RegistrationConfig {
  return {
    ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
    ...overrides,
  } as RegistrationConfig;
}

/**
 * Runs every top-level schema validator and returns the messages that failed.
 * Indexing into `_validators` directly would break if validators are reordered.
 */
function validationErrors(config: RegistrationConfig): Array<string> {
  return esmPatientRegistrationSchema._validators
    .map((validate) => validate(config))
    .filter((message): message is string => typeof message === 'string');
}

function encounterTypeErrors(config: RegistrationConfig): Array<string> {
  return validationErrors(config).filter((message) => message.includes('registrationObs.encounterTypeUuid'));
}

describe('esmPatientRegistrationSchema registrationObs.encounterTypeUuid validator', () => {
  describe('when obs fields are configured', () => {
    it.each([
      ['an empty string', ''],
      ['a whitespace-only string', '   '],
      ['null', null],
      ['undefined', undefined],
    ])('reports an error when the encounter type is %s', (_label, encounterTypeUuid) => {
      const config = buildConfig({
        fieldDefinitions: [obsFieldDefinition],
        registrationObs: {
          encounterTypeUuid,
          encounterProviderRoleUuid: 'provider-role-uuid',
          registrationFormUuid: null,
        },
      } as Partial<RegistrationConfig>);

      expect(encounterTypeErrors(config)).toHaveLength(1);
      expect(encounterTypeErrors(config)[0]).toMatch(/non-empty/i);
    });

    it('accepts a valid encounter type', () => {
      const config = buildConfig({
        fieldDefinitions: [obsFieldDefinition],
        registrationObs: {
          encounterTypeUuid: 'registration-encounter-type-uuid',
          encounterProviderRoleUuid: 'provider-role-uuid',
          registrationFormUuid: null,
        },
      });

      expect(encounterTypeErrors(config)).toEqual([]);
    });
  });

  describe('when no obs fields are configured', () => {
    it.each([
      ['an empty string', ''],
      ['null', null],
    ])('allows the encounter type to be %s', (_label, encounterTypeUuid) => {
      const config = buildConfig({
        fieldDefinitions: [personAttributeFieldDefinition],
        registrationObs: {
          encounterTypeUuid,
          encounterProviderRoleUuid: 'provider-role-uuid',
          registrationFormUuid: null,
        },
      } as Partial<RegistrationConfig>);

      expect(encounterTypeErrors(config)).toEqual([]);
    });

    it('allows the encounter type to be omitted when there are no field definitions at all', () => {
      const config = buildConfig({ fieldDefinitions: [] });

      expect(encounterTypeErrors(config)).toEqual([]);
    });
  });
});
