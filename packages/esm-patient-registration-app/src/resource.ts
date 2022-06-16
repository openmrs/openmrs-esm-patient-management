import { openmrsFetch } from '@openmrs/esm-framework';

const AddressHierarchyBaseURL = '/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form';

export function performAdressHierarchyWithParentSearch(addressField, parentid, query) {
  return openmrsFetch(
    `${AddressHierarchyBaseURL}?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`,
    {
      method: 'GET',
    },
  );
}
