import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type Queue } from '../types';

export interface SystemSetting {
  uuid: string;
  property: string;
  value: string;
}

export function useSystemSetting(setting: string) {
  const apiUrl = `${restBaseUrl}/systemsetting?&v=custom:(value)&q?${setting}`;
  const { data, ...rest } = useSWRImmutable<{ data: { results: Array<SystemSetting> } }, Error>(apiUrl, openmrsFetch);
  return {
    data: data?.data?.results && data.data.results.length > 0 ? data.data.results[0] : null,
    ...rest,
  };
}
