import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { type Visit } from '../../types/index';

const useTotalVisits = () => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const currentVisitDate = dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat);
  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime)';

  const visitsUrl = `/ws/rest/v1/visit?includeInactive=true&v=${customRepresentation}&fromStartDate=${dayjs(
    currentVisitDate,
  ).format('YYYY-MM-DD')}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Visit[] } }>(visitsUrl, openmrsFetch);

  const responseData = data?.data.results;

  return { data: responseData, error, isLoading };
};

export default useTotalVisits;
