import { formatDuration } from '@openmrs/esm-framework';

const minutesPerHour = 60;
const minutesPerDay = 24 * minutesPerHour;

/**
 * Formats a number of minutes as a wait time, matching how the table's "Wait time" column formats an
 * interval (see QueueDuration). Rounds before splitting so that a value such as 179.7 cannot render
 * as "2 hours, 60 minutes". Only call this with a finite number: Intl.DurationFormat rejects NaN.
 */
export function formatWaitTimeInMinutes(minutes: number) {
  const totalMinutes = Math.round(minutes);

  return formatDuration(
    {
      days: Math.floor(totalMinutes / minutesPerDay),
      hours: Math.floor((totalMinutes % minutesPerDay) / minutesPerHour),
      minutes: totalMinutes % minutesPerHour,
    },
    { style: 'long', minutesDisplay: 'always' },
  );
}
