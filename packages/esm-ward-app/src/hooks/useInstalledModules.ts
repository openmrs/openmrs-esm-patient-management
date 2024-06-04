import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { InstalledBackendModules } from '../types';

export function useInstalledModules() {
  const modulesUrl = `${restBaseUrl}/module?v=custom:(uuid,version)`;
  const { data, ...rest } = useSWR<{ data: InstalledBackendModules }, Error>(modulesUrl, openmrsFetch);
  return {
    installedBackendModules: data?.data ?? null,
    ...rest,
  };
}
