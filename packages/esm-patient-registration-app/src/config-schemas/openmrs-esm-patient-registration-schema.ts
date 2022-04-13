import { Type, validators } from '@openmrs/esm-framework';
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
      label: { _type: Type.String, _description: 'The label of the input' },
      uuid: {
        _type: Type.UUID,
        _description: 'Person attributetype uuid used to save the attribute',
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
    },
    _default: {},
    _description:
      'Definitions for custom fields that can be used in sectionDefinitions. Can also be used to override built-in fields.',
  },
  fieldConfigurations: {
    _type: Type.Object,
    _default: {
      name: {
        displayMiddleName: true,
        unidentifiedPatient: true,
        defaultUnknownGivenName: 'UNKNOWN',
        defaultUnknownFamilyName: 'UNKNOWN',
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
  codedPersonAttributes: {
    _type: Type.Array,
    _default: [],
    _elements: {
      _type: Type.Object,
      personAttributeUuid: {
        _type: Type.PersonAttributeTypeUuid,
        _description: 'The uuid of the person attribute type used to save the attribute',
      },
      conceptUuid: {
        _type: Type.ConceptUuid,
        _description: 'Uuid for the convenience set that defines the allowed values. Only used if the type is coded.',
      },
    },
  },

  textBasedAttributes: {
    _type: Type.Array,
    _elements: {
      _type: Type.Object,
      personAttributeUuid: {
        _type: Type.PersonAttributeTypeUuid,
        _description: 'The uuid of the person attribute type used to save the attribute',
      },
      validationRegex: {
        _type: Type.String,
        _description: 'Regular expression to validate the user input.',
      },
    },
    _default: [],
  },

  defaultPatientIdentifierTypes: {
    _type: Type.Array,
    _elements: {
      // @ts-ignore
      _type: Type.PatientIdentifierTypeUuid,
    },
    _default: [],
  },
};
