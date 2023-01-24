import { AppointmentSummary, Appointment } from '../types';
import { formatDate, parseDate, formatDatetime } from '@openmrs/esm-framework';
import dayjs, { Dayjs } from 'dayjs';

export const getHighestAppointmentServiceLoad = (appointmentSummary: Array<any> = []) => {
  const groupedAppointments = appointmentSummary?.map(({ countMap, serviceName }) => ({
    serviceName: serviceName,
    count: countMap.reduce((cummulator, currentValue) => cummulator + currentValue.allAppointmentsCount, 0),
  }));
  return groupedAppointments.find((summary) => summary.count === Math.max(...groupedAppointments.map((x) => x.count)));
};

export const flattenAppointmentSummary = (appointmentToTransfrom: Array<any>) =>
  appointmentToTransfrom.flatMap((el: any) => ({
    serviceName: el.appointmentService.name,
    countMap: Object.entries(el.appointmentCountMap).flatMap((el) => el[1]),
  }));

export const getServiceCountByAppointmentType = (
  appointmentSummary: Array<AppointmentSummary>,
  appointmentType: string,
) => {
  return appointmentSummary
    .map((el) => Object.entries(el.appointmentCountMap).flatMap((el) => el[1][appointmentType]))
    .flat(1)
    .reduce((count, val) => count + val, 0);
};

function getAppointmentDuration(startTime = 0, endTime = 0) {
  const diff = endTime - startTime;
  var minutes = Math.floor(diff / 60000);
  return minutes + 'min';
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export const getTodaysAppointment = (appointment: Appointment, t?: Function) => {
  let formattedAppointment = {
    id: appointment?.uuid,
    name: appointment.patient?.name,
    age: appointment.patient?.birthDate,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.contact,
    dob: formatDate(parseDate(appointment.patient?.birthDate), { mode: 'wide' }),
    patientUuid: appointment.patient?.uuid,
    dateTime: formatAMPM(parseDate(appointment.startDateTime)),
    serviceType: appointment.service ? appointment.service.name : '--',
    serviceColor: appointment.service?.color ? appointment.service.color : '__',
    serviceUuid: appointment.service ? appointment.service.uuid : null,
    appointmentKind: appointment.appointmentKind ? appointment.appointmentKind : '--',
    status: appointment.status,
    provider: appointment.provider ? appointment.provider.person?.display : '--',
    location: appointment.location ? appointment.location.name : '--',
    comments: appointment.comments ? appointment.comments : '--',
    appointmentNumber: appointment.appointmentNumber,
    color: appointment.service.color,
    identifier: appointment.patient?.identifier,
    duration: appointment.service?.durationMins
      ? appointment?.service?.durationMins + t('minutes', 'min')
      : getAppointmentDuration(appointment.startDateTime, appointment.endDateTime),
    recurring: appointment.recurring,
  };
  return formattedAppointment;
};

export const formatAppointmentData = (appointment: Appointment) => ({
  id: appointment.uuid,
  name: appointment.patient?.name,
  age: appointment.patient?.birthDate,
  gender: appointment.patient?.gender,
  phoneNumber: appointment.patient?.contact,
  dob: formatDate(parseDate(appointment.patient?.birthDate), { mode: 'wide' }),
  patientUuid: appointment.patient?.uuid,
  dateTime: appointment.startDateTime,
  serviceType: appointment.service ? appointment.service.name : '--',
  serviceUuid: appointment.service ? appointment.service.uuid : null,
  appointmentKind: appointment.appointmentKind ? appointment.appointmentKind : '--',
  status: appointment.status,
  provider: appointment.providers ? appointment?.providers[0]?.name : '--',
  location: appointment.location ? appointment.location?.name : '--',
  comments: appointment.comments ? appointment.comments : '--',
  appointmentNumber: appointment.appointmentNumber,
  providers: appointment.providers,
  identifier: appointment.patient.identifier,
});

export const isSameMonth = (cellDate: Dayjs, currentDate: Dayjs) => {
  return cellDate.isSame(currentDate, 'month');
};

export const monthDays = (currentDate: Dayjs) => {
  const monthStart = dayjs(currentDate).startOf('month');
  const monthEnd = dayjs(currentDate).endOf('month');
  const monthDays = dayjs(currentDate).daysInMonth();
  const lastMonth = dayjs(currentDate).subtract(1, 'month');
  const nextMonth = dayjs(currentDate).add(1, 'month');
  let days: Dayjs[] = [];

  for (let i = lastMonth.daysInMonth() - monthStart.day(); i < lastMonth.daysInMonth(); i++) {
    days.push(currentDate.date(i).month(lastMonth.month()));
  }

  for (let i = 1; i <= monthDays; i++) {
    days.push(currentDate.date(i));
  }

  const dayLen = days.length > 30 ? 7 : 14;

  for (let i = 1; i < dayLen - monthEnd.day(); i++) {
    days.push(currentDate.date(i).month(nextMonth.month()));
  }
  return days;
};
