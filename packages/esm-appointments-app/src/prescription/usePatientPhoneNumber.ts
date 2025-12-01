import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface PersonAttribute {
  uuid: string;
  display: string;
  value: string;
  attributeType: {
    uuid: string;
    display: string;
  };
}

interface PersonAttributeResponse {
  results: PersonAttribute[];
}

export const usePatientPhoneNumber = (patientUuid: string) => {
  const url = `${restBaseUrl}/person/${patientUuid}/attribute?v=custom:(uuid,value,display,attributeType:(uuid,display))`;

  const { data, isLoading, error } = useSWR<{ data: PersonAttributeResponse }>(patientUuid ? url : null, openmrsFetch);

  const phoneNumber = useMemo(() => {
    if (!data?.data?.results) return null;

    // Find attribute that contains phone/contact/telephone in its display or type
    const phoneAttribute = data.data.results.find(
      (attr) =>
        attr.attributeType?.display?.toLowerCase().includes('phone') ||
        attr.attributeType?.display?.toLowerCase().includes('contact') ||
        attr.attributeType?.display?.toLowerCase().includes('telephone') ||
        attr.attributeType?.display?.toLowerCase().includes('mobile'),
    );

    return phoneAttribute?.value || null;
  }, [data]);

  return {
    phoneNumber,
    isLoading,
    error,
  };
};
