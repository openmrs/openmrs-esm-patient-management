import { Type, type ConfigSchema } from '@openmrs/esm-framework';

// export const configSchema: WardPatientConfig = {
//   admissionRequestPatientConfig: {
//     cardSlotTypes: [
//       {
//         id: 'header-slot',
//         elements: [
//           'admission-patient-name',
//           'admission-patient-age',
//           'admission-patient-gender',
//           'admission-patient-time',
//           'admission-patient-city',
//           'admission-patient-ward',
//         ],
//       },
//     ],
//     cardSlots: ['header-slot'],
//   },
// };

const defaultAdmissionCardSlotTypes = [
  {
    id: 'header-slot',
    elements: [
      'admission-patient-name',
      'admission-patient-age',
      'admission-patient-gender',
      'admission-patient-time',
      'admission-patient-city',
      'admission-patient-ward',
    ],
  },
];

const defaultAdmissionCardSlots = ['header-slot'];
export const configSchema = {
  admissionRequestPatientConfig: {
    _type: Type.Object,
    admissionCardSlotTypes: {
      _type: Type.Array,
      _default: defaultAdmissionCardSlotTypes,
      _elements: {
        id: {
          _type: Type.String,
        },
        elements: {
          _type: Type.Array,
          _elements: {
            _type: Type.String,
          },
        },
      },
    },
    admissionCardSlots: {
      _type: Type.Array,
      _default: defaultAdmissionCardSlots,
      _elements: {
        _type: Type.String,
      },
    },
  },
};
export interface WardPatientConfig {
  admissionRequestPatientConfig: {
    admissionCardSlotTypes: (HeaderSlotType | FooterSlotType)[];
    admissionCardSlots: CardSlotIds[];
  };
}

interface HeaderSlotType {
  id: 'header-slot';
  elements: HeaderSlotElements;
}

interface FooterSlotType {}

type HeaderSlotElements =
  | 'admission-patient-name'
  | 'admission-patient-age'
  | 'admission-patient-gender'
  | 'admission-patient-time'
  | 'admission-patient-city'
  | 'admission-patient-ward';

type CardSlotIds = 'header-slot';
