import { Type } from '@openmrs/esm-framework';

export const admissionRequestNoteRowConfigSchema = {
  conceptUuid: {
    _type: Type.UUID,
    _description: 'Required. Identifies the concept for the admission request note.',
    _default: '161011AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};
