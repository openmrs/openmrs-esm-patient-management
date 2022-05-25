import { Type, validator, validators } from '@openmrs/esm-framework';

export interface SectionDefinition {
  id: string;
  name: string;
  fields: Array<string>;
}

export interface FieldDefinition {
  id: string;
  type: string;
  label: string;
  uuid: string;
  placeholder: string;
  validation: {
    required: boolean;
    matches: string;
  };
  answerConceptSetUuid: string;
}

export interface RegistrationConfig {
  sections: Array<string>;
  sectionDefinitions: Array<SectionDefinition>;
  fieldDefinitions: Array<FieldDefinition>;
  fieldConfigurations: {
    name: {
      displayMiddleName: boolean;
      unidentifiedPatient: boolean;
      defaultUnknownGivenName: string;
      defaultUnknownFamilyName: string;
    };
  };
  links: {
    submitButton: string;
  };
  concepts: {
    patientPhotoUuid: string;
  };
  defaultPatientIdentifierTypes: Array<string>;
  registrationObs: {
    encounterTypeUuid: string | null;
    encounterProviderRoleUuid: string;
    registrationFormUuid: string | null;
  };
}

export const builtInSections: Array<SectionDefinition> = [
  {
    id: 'demographics',
    name: 'Basic Info',
    fields: ['name', 'gender', 'dob', 'id'],
  },
  { id: 'contact', name: 'Contact Details', fields: ['address', 'phone & email'] },
  { id: 'death', name: 'Death Info', fields: [] },
  { id: 'relationships', name: 'Relationships', fields: [] },
];

export const builtInFields = ['name', 'gender', 'dob', 'address', 'id', 'phone & email'] as const;

export const esmPatientRegistrationSchema = {
  sections: {
    _type: Type.Array,
    _default: ['demographics', 'contact', 'relationships'],
    _description: `An array of strings which are the keys from 'sectionDefinitions' or any of the following built-in sections: '${builtInSections
      .map((s) => s.id)
      .join("', '")}'.`,
    _elements: {
      _type: Type.String,
    },
  },
  sectionDefinitions: {
    _type: Type.Array,
    _elements: {
      id: {
        _type: Type.String,
        _description: `How this section will be referred to in the \`sections\` configuration. To override a built-in section, use that section's id. The built in section ids are '${builtInSections
          .map((s) => s.id)
          .join("', '")}'.`,
      },
      name: {
        _type: Type.String,
        _description: 'The title to display at the top of the section.',
      },
      fields: {
        _type: Type.Array,
        _default: [],
        _description: `The parts to include in the section. Can be any of the following built-in fields: ${builtInFields.join(
          ', ',
        )}. Can also be an id from an object in the \`fieldDefinitions\` array, which you can use to define custom fields.`,
        _elements: { _type: Type.String },
      },
    },
    _default: [],
  },
  fieldDefinitions: {
    _type: Type.Array,
    _elements: {
      id: {
        _type: Type.String,
        _description:
          'How this field will be referred to in the `fields` element of the `sectionDefinitions` configuration.',
      },
      type: {
        _type: Type.String,
        _description: "How this field's data will be stored—a person attribute or an obs.",
        _validators: [
          validator((val) => ['person attribute', 'obs'].includes(val), "Must be one of 'person attribute' or 'obs'."),
        ],
      },
      uuid: {
        _type: Type.UUID,
        _description: "Person attribute type UUID that this field's data should be saved to.",
      },
      label: {
        _type: Type.String,
        _default: null,
        _description: 'The label of the input. By default, uses the metadata `display` attribute.',
      },
      placeholder: {
        _type: Type.String,
        _default: '',
        _description: 'Placeholder that will appear in the input.',
      },
      validation: {
        required: { _type: Type.Boolean, _default: false },
        matches: {
          _type: Type.String,
          _default: null,
          _description: 'Optional RegEx for testing the validity of the input.',
        },
      },
      answerConceptSetUuid: {
        _type: Type.ConceptUuid,
        _default: null,
        _description:
          'For coded questions only. A concept which has the possible responses either as answers or as set members.',
      },
    },
    _default: [],
    _description:
      'Definitions for custom fields that can be used in sectionDefinitions. Can also be used to override built-in fields.',
  },
  fieldConfigurations: {
    name: {
      displayMiddleName: { _type: Type.Boolean, _default: true },
      unidentifiedPatient: {
        _type: Type.Boolean,
        _default: true,
        _description: 'Whether to allow patients to be registered without names.',
      },
      defaultUnknownGivenName: {
        _type: Type.String,
        _default: 'UNKNOWN',
        _description: 'The given/first name to record for unidentified patients.',
      },
      defaultUnknownFamilyName: {
        _type: Type.String,
        _default: 'UNKNOWN',
        _description: 'The family/last name to record for unidentified patients.',
      },
    },
  },
  links: {
    submitButton: {
      _type: Type.String,
      _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
      _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
    },
  },
  concepts: {
    patientPhotoUuid: {
      _type: Type.ConceptUuid,
      _default: '736e8771-e501-4615-bfa7-570c03f4bef5',
    },
  },
  defaultPatientIdentifierTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.PatientIdentifierTypeUuid,
    },
    _default: [],
  },
  registrationObs: {
    encounterTypeUuid: {
      _type: Type.UUID,
      _default: null,
      _description:
        'Obs created during registration will be associated with an encounter of this type. This must be set in order to use fields of type `obs`.',
    },
    encounterProviderRoleUuid: {
      _type: Type.UUID,
      _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
      _description: "The provider role to use for the registration encounter. Default is 'Unkown'.",
    },
    registrationFormUuid: {
      _type: Type.UUID,
      _default: null,
      _description:
        'The form UUID to associate with the registration encounter. By default no form will be associated.',
    },
  },

  // TODO: validate that
  //  - if a field has type 'obs', registrationObs.encounterTypeUuid is not null
  //  - all sections have been defined
  //  - all fields have been defined
};
