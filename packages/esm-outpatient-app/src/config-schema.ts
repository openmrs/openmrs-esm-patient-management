import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  concepts: {
    priorityConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '96105db1-abbf-48d2-8a52-a1d561fd8c90',
    },
    serviceConceptSetUuid: {
      _type: Type.ConceptUuid,
      _default: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
    },
  },
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The Uuids of person attribute-type that captures contact information `e.g Next of kin contact details`',
    _default: [],
  },
};

export interface ConfigObject {
  concepts: {
    priorityConceptSetUuid: string;
    serviceConceptSetUuid: string;
  };
  contactAttributeType: Array<string>;
}
