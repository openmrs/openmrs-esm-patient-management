import { AppointmentSummary } from '../types';

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
