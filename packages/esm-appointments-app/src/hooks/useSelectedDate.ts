import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

/**
 * A custom hook to get the selected date from the URL parameter. Date should be in YYYY-MM-DD format,
 * although looser strings accepted by dayjs is also fine. If no date is specified, it defaults to the current date.
 */
export function useSelectedDate() {
  const params = useParams();
  return useMemo(() => {
    if (params.date) {
      const parsedDate = dayjs(params.date, 'YYYY-MM-DD').startOf('day');
      if (!parsedDate.isValid()) {
        console.warn(
          `Invalid date format in URL parameter: ${params.date}. Format should be YYYY-MM-DD. Falling back to current date.`,
        );
      } else {
        return parsedDate.format('YYYY-MM-DD');
      }
    }
    return dayjs().startOf('day').format('YYYY-MM-DD');
  }, [params]);
}
