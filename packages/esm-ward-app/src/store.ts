import { createGlobalStore, getGlobalStore } from '@openmrs/esm-framework';
import { type WardPatientCardProps } from './types';

export type ActiveBedSelection = WardPatientCardProps;

export interface WardStoreState {
  activeBedSelection: ActiveBedSelection | null;
}

const initialState: WardStoreState = {
  activeBedSelection: null,
};

export const wardStore = createGlobalStore('ward', initialState);

export function getWardStore() {
  return getGlobalStore<WardStoreState>('ward', initialState);
}
