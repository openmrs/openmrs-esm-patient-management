import { createGlobalStore, getGlobalStore } from '@openmrs/esm-framework';
import { type WardPatientCardProps } from './types';

type ActiveBedSelection = WardPatientCardProps;

interface WardStoreState {
  activeBedSelection: ActiveBedSelection | null;
}

const initialState: WardStoreState = {
  activeBedSelection: null,
};

export const wardStore = createGlobalStore('ward', initialState);

export function getWardStore() {
  return getGlobalStore<WardStoreState>('ward', initialState);
}
