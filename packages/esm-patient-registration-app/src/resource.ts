import { openmrsFetch } from '@openmrs/esm-framework';

const AH_BASE_WS_API_URL = '/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form';

export function performAdressHirarchiWithParentSearch(addressField, parentid, query) {
  return openmrsFetch(
    `${AH_BASE_WS_API_URL}?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`,
    {
      method: 'GET',
    },
  );
}
