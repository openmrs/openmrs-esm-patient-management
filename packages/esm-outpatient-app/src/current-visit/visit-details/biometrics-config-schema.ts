import { Type } from '@openmrs/esm-framework';

export default {
  bmiUnit: {
    _type: Type.String,
    _default: 'kg / m²',
  },
};

export interface BiometricsConfigObject {
  bmiUnit: string;
  heightUnit: string;
  weightUnit: string;
}
