import { Type, validators } from '@openmrs/esm-framework';

export const esmHomeSchema = {
  leftNavMode: {
    _type: Type.String,
    _description: 'Sets the left nav mode for the home app.',
    _validators: [validators.oneOf(['normal', 'collapsed', 'hidden'])],
    _default: 'normal',
  },
};

export interface ConfigSchema {
  leftNavMode: 'normal' | 'collapsed' | 'hidden';
}
