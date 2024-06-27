import { mockBedType } from './wards.mock';

export const mockWardBeds = [
  {
    id: 1,
    uuid: '0000-bed1',
    bedNumber: 'bed1',
    bedType: mockBedType,
    row: 1,
    column: 2,
    status: 'OCCUPIED' as const,
  },
  {
    id: 2,
    uuid: '0000-bed2',
    bedNumber: 'bed2',
    bedType: mockBedType,
    row: 1,
    column: 2,
    status: 'AVAILABLE' as const,
  },
  {
    id: 1,
    uuid: '0000-bed3',
    bedNumber: 'bed3',
    bedType: mockBedType,
    row: 1,
    column: 3,
    status: 'AVAILABLE' as const,
  },
];
