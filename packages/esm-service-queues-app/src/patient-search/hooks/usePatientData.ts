import { useEffect, useState } from 'react';
import isNil from 'lodash-es/isNil';
import { usePatient, useVisit } from '@openmrs/esm-framework';
import { useScheduledVisits } from '../hooks/useScheduledVisits';
import { SearchTypes } from '../../types';

const usePatientData = (selectedPatientUuid: string) => {
  const { patient } = usePatient(selectedPatientUuid);
  const { activeVisit } = useVisit(selectedPatientUuid);
  const { appointments, isLoading, isError } = useScheduledVisits(selectedPatientUuid);
  const [searchType, setSearchType] = useState<SearchTypes>(SearchTypes.SCHEDULED_VISITS);

  const hasAppointments = !(isNil(appointments?.futureVisits) && isNil(appointments?.recentVisits));

  useEffect(() => {
    if (searchType === SearchTypes.SCHEDULED_VISITS && appointments && !hasAppointments) {
      setSearchType(SearchTypes.VISIT_FORM);
    }
  }, [hasAppointments, appointments]);

  return {
    patient,
    activeVisit,
    appointments,
    isLoading,
    isError,
    searchType,
    setSearchType,
    hasAppointments,
  };
};

export default usePatientData;
