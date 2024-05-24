import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { type Visit } from '../../types/index';

const useTotalVisits = () => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const currentVisitDate = dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat);
  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime)';

  const visitsUrl = `${restBaseUrl}/visit?includeInactive=true&v=${customRepresentation}&fromStartDate=${dayjs(
    currentVisitDate,
  ).format('YYYY-MM-DD')}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Visit[] } }>(visitsUrl, openmrsFetch);

  return { data: data?.data.results, error, isLoading };
};

export default useTotalVisits;
