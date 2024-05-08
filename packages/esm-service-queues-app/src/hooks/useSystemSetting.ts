import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export interface SystemSetting {
  uuid: string;
  property: string;
  value: string;
}

export function useSystemSetting(setting: string) {
  const apiUrl = `${restBaseUrl}/systemsetting/${setting}?v=custom:(value)`;
  const { data, error, isLoading } = useSWRImmutable<{ data: SystemSetting }, Error>(apiUrl, openmrsFetch);
  return {
    systemSetting: data?.data,
    error: error,
    isLoading: isLoading,
  };
}
