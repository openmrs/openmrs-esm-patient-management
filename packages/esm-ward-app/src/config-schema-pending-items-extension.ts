import { Type } from '@openmrs/esm-framework';

export const pendingItemsExtensionConfigSchema = {
  orders: {
    orderTypes: {
      _type: Type.Array,
      _description: 'Defines order types displayed on the ward patient card pending items section.',
      _default: [{ label: 'Labs', uuid: '52a447d3-a64a-11e3-9aeb-50e549534c5e' }],
      _elements: {
        uuid: {
          _type: Type.UUID,
          _description: 'Identifies the order type.',
        },
        label: {
          _type: Type.String,
          _description:
            "The label or i18n key to the translated label to display. If not provided, defaults to 'Orders'",
          _default: null,
        },
      },
    },
  },
  showPendingItems: {
    _type: Type.Boolean,
    _description:
      'Optional. If true, pending items (e.g., number of pending orders) will be displayed on the patient card.',
    _default: true,
  },
};
