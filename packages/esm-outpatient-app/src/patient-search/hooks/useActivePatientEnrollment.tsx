import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { PatientProgram } from '../../types';
import uniqBy from 'lodash-es/uniqBy';
const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display))`;

export const useActivePatientEnrollment = (patientUuid: string) => {
  const { data, error } = useSWR<{ data: { results: Array<PatientProgram> } }>(
    `/ws/rest/v1/programenrollment?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const activePatientEnrollment = useMemo(
    () =>
      data?.data.results
        .sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
        .filter((enrollment) => enrollment.dateCompleted === null) ?? [],
    [data?.data.results],
  );

  return {
    activePatientEnrollment: uniqBy(activePatientEnrollment, (program) => program?.program?.uuid),
    error,
    isLoading: !data && !error,
  };
};
