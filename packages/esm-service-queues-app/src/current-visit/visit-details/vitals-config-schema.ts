import { Type } from '@openmrs/esm-framework';

export default {
  formUuid: {
    _type: Type.UUID,
    _default: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
  },
  encounterTypeUuid: {
    _type: Type.UUID,
    _default: '67a71486-1a54-468f-ac3e-7091a9a79584',
  },
};

export interface VitalsConfigObject {
  formUuid: string;
  encounterTypeUuid: string;
}
