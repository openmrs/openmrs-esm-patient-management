import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { OutpatientConfig } from '../../config-schema';
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
  const { visitTypeResourceUrl, showRecommendedVisitTypeTab } = useConfig() as OutpatientConfig;
  const { data, error } = useSWR<{ data: EnrollmentVisitType }>(
    showRecommendedVisitTypeTab &&
      patientUuid &&
      enrollmentUuid &&
      programUuid &&
      `${visitTypeResourceUrl}${patientUuid}/program/${programUuid}/enrollment/${enrollmentUuid}?intendedLocationUuid=${locationUuid}`,
    openmrsFetch,
  );

  const recommendedVisitTypes = useMemo(() => data?.data?.visitTypes?.allowed.map(mapToVisitType) ?? [], [data]);
  return { recommendedVisitTypes, error, isLoading: !data && !error };
};

const mapToVisitType = (visitType) => {
  return { ...visitType, display: visitType.name };
};
