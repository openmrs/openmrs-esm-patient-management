import { showNotification, showToast } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FormValues } from '../patient-registration/patient-registration-types';
import { generateNUPIPayload } from './patient-verification-utils';
import { RegistryPatient } from './verification-types';
const token =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IkU0MUU1QUM5RUIxNTlBMjc1NTY4NjM0MzIxMUJDQzAzMDMyMEUzMTZSUzI1NiIsIng1dCI6IjVCNWF5ZXNWbWlkVmFHTkRJUnZNQXdNZzR4WSIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwczovL2RocGlkZW50aXR5c3RhZ2luZ2FwaS5oZWFsdGguZ28ua2UiLCJuYmYiOjE2NzU4ODM2NjEsImlhdCI6MTY3NTg4MzY2MSwiZXhwIjoxNjc1OTcwMDYxLCJhdWQiOlsiREhQLkdhdGV3YXkiLCJESFAuUGFydG5lcnMiXSwic2NvcGUiOlsiREhQLkdhdGV3YXkiLCJESFAuUGFydG5lcnMiXSwiY2xpZW50X2lkIjoicGFydG5lci50ZXN0LmNsaWVudCIsImp0aSI6IjYzQjhEOEQ3QjcyRTc4OTlDNjMxNzk3MjA3QjQ1MDE1In0.MXe4skggqsdwl2ie2PFdgiuCaycja8ONgIVONQrbIx3OQU7butFUGK9UYBtr91fgj7jeLVqAik14C0RMJ34D385CJFn8ePH6Af3DvyZlXBjUTL69tg54a4mYO7_FRFXO43bsiBSN9aIm93ewC69YL5YZZmPadUYMkhFIhnwsWMOaosy-Vw6vnRCRgjrwED8bXw-uU9fXSmdLySf_PS5vtiZ61gs8lDnhOIRIUb85A3I3TxsJJsjyp_BkCD-kf5_ZSgLuOIJOzRX7XqYXbA-F0xPynHINIlppDgA5GohZGdbiVv5DRchtG-I5BKv56e9UWSYOIGR2SNZ6OmAkJcp6Ig';

export function searchClientRegistry(identifierType: string, searchTerm: string) {
  const url = `https://dhpstagingapi.health.go.ke/partners/registry/search/KE/${identifierType}/${searchTerm}`;
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

export function savePatientToClientRegistry(formValues: FormValues) {
  const createdRegistryPatient = generateNUPIPayload(formValues);
  return fetch(`https://dhpstagingapi.health.go.ke/partners/registry`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(createdRegistryPatient),
  });
}

export async function handleSavePatientToClientRegistry(
  formValues: FormValues,
  setValues: (values: FormValues, shouldValidate?: boolean) => void,
) {
  try {
    const clientRegistryResponse = await savePatientToClientRegistry(formValues);
    if (clientRegistryResponse.ok) {
      const savedValues = await clientRegistryResponse.json();
      const nupiIdentifier = {
        ['nationalUniquePatientIdentifier']: {
          identifierTypeUuid: 'f85081e2-b4be-4e48-b3a4-7994b69bb101',
          identifierName: 'National Unique patient identifier',
          identifierValue: savedValues['clientNumber'],
          initialValue: savedValues['clientNumber'],
          identifierUuid: undefined,
          selectedSource: { uuid: '', name: '' },
          preferred: false,
          required: false,
        },
      };
      setValues({ ...formValues, identifiers: { ...formValues.identifiers, ...nupiIdentifier } });
      showToast({
        title: 'Posted patient to client registry successfully',
        description: `The patient has been saved to client registry`,
        kind: 'success',
      });
    } else {
      const responseError = await clientRegistryResponse.json();
      showNotification({
        title: responseError.title,
        description: Object.values(responseError.errors ?? {}).map((error: any) => error.join()),
        kind: 'warning',
        millis: 150000,
      });
    }
  } catch (error) {
    showNotification({ kind: 'error', title: 'NUPI Post failed', description: JSON.stringify(error) });
  }
}
