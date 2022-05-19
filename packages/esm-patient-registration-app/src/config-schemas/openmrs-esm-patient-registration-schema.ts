import { Type, validator, validators } from '@openmrs/esm-framework';
const builtInFields = ['name', 'gender', 'dob', 'address', 'id', 'death'];

export const esmPatientRegistrationSchema = {
  sections: {
    _type: Type.Array,
    _default: ['demographics', 'contact', 'relationships'],
    _description: "An array of strings which are the keys from 'sectionDefinitions'",
    _elements: {
      _type: Type.String,
    },
  },
  sectionDefinitions: {
    _type: Type.Object,
    _elements: {
      name: {
        _type: Type.String,
        _default: '',
        _description: 'The title to display at the top of the section.',
      },
      fields: {
        _type: Type.Array,
        _default: [],
        _description: `The parts to include in the section. Can be any of the following built-in fields: ${builtInFields.join(
          ', ',
        )}. Can also be any of the keys from the fieldDefinitions object, which you can use to define custom fields.`,
        _elements: { _type: Type.String }, // another validator at top level
      },
    },
    _default: {
      demographics: {
        name: 'Basic Info',
        fields: ['name', 'gender', 'dob', 'id', 'codedAttributes', 'textBasedAttributes'],
      },
      contact: { name: 'Contact Details', fields: ['address', 'phone & email'] },
      death: { name: 'Death Info', fields: ['death'] },
      relationships: { name: 'Relationships' },
    },
  },
  fieldDefinitions: {
    _type: Type.Object,
    _elements: {
      label: { _type: Type.String, _description: 'The label of the input.' },
      uuid: {
        _type: Type.UUID,
        _description: "Person attribute type UUID that this field's data should be saved to.",
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
        _description: 'The convenience set that defines the allowed values. Only used if the type is coded.',
      },
    },
    _default: {},
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
};

export interface RegistrationConfig {
  sections: Array<string>;
  sectionDefinitions: {
    [sectionName: string]: {
      name: string;
      fields: Array<string>;
    };
  };
  fieldDefinitions: {
    [fieldName: string]: {
      type: string;
      label: string;
      uuid: string;
      placeholder: string;
      validation: {
        required: boolean;
        matches: string;
      };
    };
  };
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
}
