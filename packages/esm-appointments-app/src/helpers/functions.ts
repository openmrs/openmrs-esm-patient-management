import dayjs, { type Dayjs } from 'dayjs';
import { type TFunction } from 'i18next';
import { launchWorkspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { AppointmentStatus } from '../types';
import { appointmentsFormWorkspace } from '../constants';

/* Format a Date object into 12-hour time with AM/PM */
export const formatAMPM = (date: Date): string => {
  const hours24 = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;

  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours12}:${minutesStr} ${ampm}`;
};

/* Check if two dates fall within the same calendar month */
export const isSameMonth = (cellDate: Dayjs, currentDate: Dayjs): boolean => {
  return cellDate.isSame(currentDate, 'month');
};

/* Generate full calendar grid including leading/trailing days for alignment */
export const monthDays = (currentDate: Dayjs): Dayjs[] => {
  const start = dayjs(currentDate).startOf('month').startOf('week');
  const end = dayjs(currentDate).endOf('month').endOf('week');

  const days: Dayjs[] = [];
  let current = start.clone();

  /* Iterate through each day in the grid range */
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push(current);
    current = current.add(1, 'day');
  }

  return days;
};

/* Map gender codes to translated display values */
export const getGender = (gender: string | undefined, t: TFunction<'translation', undefined>): string => {
  switch (gender) {
    case 'M':
      return t('male', 'Male');
    case 'F':
      return t('female', 'Female');
    case 'O':
      return t('other', 'Other');
    case 'U':
      return t('unknown', 'Unknown');
    default:
      return gender ?? '';
  }
};

/* Launch appointment creation workflow with patient selection */
export const launchCreateAppointmentForm = (t: TFunction<'translation', undefined>) => {
  launchWorkspace2(
    'appointments-patient-search-workspace',
    {
      initialQuery: '',
      workspaceTitle: t('createNewAppointment', 'Create new appointment'),
      onPatientSelected(
        patientUuid: string,
        patient: fhir.Patient,
        launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
      ) {
        /* Open appointment form workspace for selected patient */
        launchChildWorkspace(appointmentsFormWorkspace, {
          patientUuid: patient.id,
        });
      },
    },
    {
      startVisitWorkspaceName: 'appointments-start-visit-workspace',
    },
  );
};

/* Validate if status transition follows allowed progression rules */
export const canTransition = (fromStatus: AppointmentStatus, toStatus: AppointmentStatus): boolean => {
  const sequences: Record<AppointmentStatus, number> = {
    [AppointmentStatus.SCHEDULED]: 1,
    [AppointmentStatus.CHECKEDIN]: 3,
    [AppointmentStatus.COMPLETED]: 4,
    [AppointmentStatus.CANCELLED]: 4,
    [AppointmentStatus.MISSED]: 4,
  };

  return sequences[fromStatus] < sequences[toStatus] || toStatus === AppointmentStatus.SCHEDULED;
};
