import { type PersonAddress } from '../packages/esm-service-queues-app/src/types';

export const mockAddress: Partial<PersonAddress> = {
  postalCode: '12345',
  address1: '123 Main St',
  cityVillage: 'City',
  stateProvince: 'State',
  country: 'Country',
  preferred: true,
};
