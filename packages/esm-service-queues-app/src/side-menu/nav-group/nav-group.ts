import { createGlobalStore, createUseStore } from '@openmrs/esm-framework';

const navGroupStore = createGlobalStore('outpatient-nav-groups', { navGroups: [] });

export function registerNavGroup(slotName: string) {
  const store = navGroupStore.getState();
  navGroupStore.setState({ navGroups: [slotName, ...store.navGroups] });
}

export const useNavGroups = createUseStore(navGroupStore);
