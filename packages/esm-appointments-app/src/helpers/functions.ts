import dayjs, { type Dayjs } from 'dayjs';
import { type TFunction } from 'i18next';
import { type Calendar } from '@internationalized/date';
import { launchWorkspace2, type Workspace2DefinitionProps, restBaseUrl } from '@openmrs/esm-framework';
import { AppointmentStatus } from '../types';
import { appointmentsFormWorkspace, omrsDateFormat } from '../constants';
import { isSameLocalMonth, buildMonthGrid } from '../calendar/utils/intl-calendar';

export const buildAppointmentsUrl = (isoDate: string): string => {
  const startOfDay = dayjs(isoDate).startOf('day').format(omrsDateFormat);
  return `${restBaseUrl}/appointments?forDate=${encodeURIComponent(startOfDay)}`;
};

export const formatTime = (date: Date, locale = 'en'): string => {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' } as Intl.DateTimeFormatOptions).format(
    date,
  );
};

export const formatAMPM = (date: Date): string => formatTime(date, 'en');

/**
 * Returns true when two Dayjs dates fall in the same month.
 *
 * When a `calendar` object is provided the comparison is made in the local
 * calendar system (e.g., Ethiopian months) rather than the Gregorian month.
 * Falls back to a pure Gregorian comparison when no calendar is supplied.
 *
 * @param cellDate    - The cell date to test
 * @param currentDate - The currently selected/displayed date
 * @param calendar    - Optional @internationalized/date Calendar object
 */
export const isSameMonth = (cellDate: Dayjs, currentDate: Dayjs, calendar?: Calendar) => {
  if (!calendar || calendar.identifier === 'gregory') {
    return cellDate.isSame(currentDate, 'month');
  }
  return isSameLocalMonth(cellDate.format('YYYY-MM-DD'), currentDate.format('YYYY-MM-DD'), calendar);
};

/**
 * Builds the list of Dayjs dates that should appear in the monthly calendar grid.
 *
 * When a `calendar` object is provided the grid respects the local calendar
 * month boundaries (e.g., Ethiopian months of 30 days, 13-month year).
 * Leading/trailing days from adjacent months fill out complete 7-day rows.
 *
 * @param currentDate - The currently selected date (Gregorian Dayjs)
 * @param calendar    - Optional @internationalized/date Calendar object
 */
export const monthDays = (currentDate: Dayjs, calendar?: Calendar): Dayjs[] => {
  if (calendar && calendar.identifier !== 'gregory') {
    return buildMonthGrid(currentDate, calendar).map((iso) => dayjs(iso));
  }

  const monthStart = dayjs(currentDate).startOf('month');
  const monthEnd = dayjs(currentDate).endOf('month');
  const daysInMonth = dayjs(currentDate).daysInMonth();
  const lastMonth = dayjs(currentDate).subtract(1, 'month');
  const nextMonth = dayjs(currentDate).add(1, 'month');
  const days: Dayjs[] = [];

  for (let i = lastMonth.daysInMonth() - monthStart.day() + 1; i <= lastMonth.daysInMonth(); i++) {
    days.push(lastMonth.date(i));
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(currentDate.date(i));
  }
  const dayLen = days.length > 30 ? 7 : 14;
  for (let i = 1; i < dayLen - monthEnd.day(); i++) {
    days.push(nextMonth.date(i));
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
      startVisitWorkspaceName: 'appointments-start-visit-workspace',
    },
  );
};

/**
 * Return whether we can transition from one appointment status to another,
 * based on logic in backend. See:
 * https://github.com/Bahmni/openmrs-module-appointments/blob/master/api/src/main/java/org/openmrs/module/appointments/model/AppointmentStatus.java
 * https://github.com/Bahmni/openmrs-module-appointments/blob/master/api/src/main/java/org/openmrs/module/appointments/validator/impl/DefaultAppointmentStatusChangeValidator.java
 */
export const canTransition = (fromStatus: AppointmentStatus, toStatus: AppointmentStatus): boolean => {
  const sequences = {
    [AppointmentStatus.REQUESTED]: 0,
    [AppointmentStatus.SCHEDULED]: 1,
    [AppointmentStatus.CHECKEDIN]: 3,
    [AppointmentStatus.COMPLETED]: 4,
    [AppointmentStatus.CANCELLED]: 4,
    [AppointmentStatus.MISSED]: 4,
  };

  return sequences[fromStatus] < sequences[toStatus] || toStatus === AppointmentStatus.SCHEDULED;
};
