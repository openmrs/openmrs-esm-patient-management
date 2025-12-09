import { type TFunction } from 'i18next';
import { launchWorkspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type AppointmentSummary, type AppointmentCountMap } from '../types';
import { appointmentsFormWorkspace } from '../constants';
import { CalendarDate, startOfMonth, endOfMonth, getDayOfWeek, isSameMonth } from '@internationalized/date';
import { getLocale } from '@openmrs/esm-utils';

interface FlattenedAppointmentSummary {
  serviceName: string;
  countMap: AppointmentCountMap[];
}

interface ServiceLoadSummary {
  serviceName: string;
  count: number;
}

export const getHighestAppointmentServiceLoad = (
  appointmentSummary: FlattenedAppointmentSummary[] = [],
): ServiceLoadSummary | undefined => {
  const groupedAppointments = appointmentSummary.map(({ countMap, serviceName }) => ({
    serviceName: serviceName,
    count: countMap.reduce((accumulator, currentValue) => accumulator + currentValue.allAppointmentsCount, 0),
  }));
  if (groupedAppointments.length === 0) {
    return undefined;
  }
  return groupedAppointments.find((summary) => summary.count === Math.max(...groupedAppointments.map((x) => x.count)));
};

export const flattenAppointmentSummary = (
  appointmentToTransform: AppointmentSummary[],
): FlattenedAppointmentSummary[] =>
  appointmentToTransform.flatMap((el) => ({
    serviceName: el.appointmentService.name,
    countMap: Object.entries(el.appointmentCountMap).flatMap(([, countMap]) => countMap),
  }));

export const getServiceCountByAppointmentType = (
  appointmentSummary: AppointmentSummary[],
  appointmentType: 'allAppointmentsCount' | 'missedAppointmentsCount',
): number => {
  return appointmentSummary
    .map((el) =>
      Object.values(el.appointmentCountMap).map((countMap) => {
        const value = countMap[appointmentType];
        if (typeof value === 'number') {
          return value;
        }
        return 0;
      }),
    )
    .flat(1)
    .reduce((count, val) => count + val, 0);
};

export const formatAMPM = (date: Date): string => {
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12; // Convert 0 to 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString();
  return `${hours12}:${minutesStr} ${ampm}`;
};

export const isSameCalendarMonth = (cellDate: CalendarDate, currentDate: CalendarDate) => {
  return isSameMonth(cellDate, currentDate);
};

export const monthDays = (currentDate: CalendarDate) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = currentDate.calendar.getDaysInMonth(currentDate);
  const lastMonth = currentDate.subtract({ months: 1 });
  const nextMonth = currentDate.add({ months: 1 });
  let days: CalendarDate[] = [];

  const lastMonthDays = lastMonth.calendar.getDaysInMonth(lastMonth);
  for (let i = lastMonthDays - getDayOfWeek(monthStart, getLocale()) + 1; i <= lastMonthDays; i++) {
    days.push(new CalendarDate(lastMonth.year, lastMonth.month, i));
  }

  for (let i = 1; i <= monthDays; i++) {
    days.push(new CalendarDate(currentDate.year, currentDate.month, i));
  }

  const dayLen = days.length > 30 ? 7 : 14;

  for (let i = 1; i < dayLen - getDayOfWeek(monthEnd, getLocale()); i++) {
    days.push(new CalendarDate(nextMonth.year, nextMonth.month, i));
  }
  return days;
};

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
      return gender;
  }
};

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
        closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
      ) {
        launchChildWorkspace(appointmentsFormWorkspace, {
          patientUuid: patient.id,
        });
      },
    },
    {
      startVisitWorkspaceName: 'appointments-patient-search-start-visit-workspace',
    },
  );
};
