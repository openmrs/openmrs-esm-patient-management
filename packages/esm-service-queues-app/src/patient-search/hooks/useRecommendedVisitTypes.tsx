import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, type OutpatientConfig } from '../../config-schema';
import { useMemo } from 'react';

interface EnrollmentVisitType {
  dataDependencies: Array<string>;
  enrollmentOptions: object;
  incompatibleWith: Array<string>;
  name: string;
  visitTypes: { allowed: Array<EnrollmentVisitType>; disallowed: Array<EnrollmentVisitType> };
}

export const useRecommendedVisitTypes = (
  patientUuid: string,
  enrollmentUuid: string,
  programUuid: string,
  locationUuid: string,
) => {
  const { visitTypeResourceUrl } = useConfig() as OutpatientConfig;
  const { showRecommendedVisitTypeTab } = useConfig() as ConfigObject;

  const apiUrl = `${visitTypeResourceUrl}${patientUuid}/program/${programUuid}/enrollment/${enrollmentUuid}?intendedLocationUuid=${locationUuid}`;

  const { data, error, isLoading } = useSWR<{ data: EnrollmentVisitType }>(
    showRecommendedVisitTypeTab && patientUuid && enrollmentUuid && programUuid ? apiUrl : null,
    openmrsFetch,
  );

  const recommendedVisitTypes = useMemo(() => data?.data?.visitTypes?.allowed.map(mapToVisitType) ?? [], [data]);
  return { recommendedVisitTypes, error, isLoading };
};

const mapToVisitType = (visitType) => {
  return { ...visitType, display: visitType.name };
};
