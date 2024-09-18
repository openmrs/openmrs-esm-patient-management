import { Type } from '@openmrs/esm-framework';

export const motherChildRowConfigSchema = {
  maternalLocations: {
    _type: Type.Array,
    _description: 'Defines obs display elements that can be included in the card header or footer.',
    _default: [],
    _elements: {
      id: {
        _type: Type.UUID,
        _description: 'The unique identifier for this ward location',
      },
    }
  },
  childLocations: {
    _type: Type.Array,
    _description: 'Defines obs display elements that can be included in the card header or footer.',
    _default: [],
    _elements: {
      id: {
        _type: Type.UUID,
        _description: 'The unique identifier for this ward location',
      },
    }
  }
};
