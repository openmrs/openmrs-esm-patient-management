import dayjs, { type Dayjs } from 'dayjs';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import { type AppointmentSummary, type Appointment } from '../types';

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

export const formatAMPM = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
};

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

  for (let i = lastMonth.daysInMonth() - monthStart.day() + 1; i <= lastMonth.daysInMonth(); i++) {
    days.push(dayjs().month(lastMonth.month()).date(i));
  }

  for (let i = 1; i <= monthDays; i++) {
    days.push(currentDate.date(i));
  }

  const dayLen = days.length > 30 ? 7 : 14;

  for (let i = 1; i < dayLen - monthEnd.day(); i++) {
    days.push(dayjs().month(nextMonth.month()).date(i));
  }
  return days;
};

export const getGender = (gender, t) => {
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

export async function fetchPatientFromRestApi(patientUuid: string) {
  try {
    const { data } = await openmrsFetch(`${restBaseUrl}/patient/${patientUuid}?v=full`);
    return data;
  } catch (error) {
    return null;
  }
}

export function extractPhoneFromPersonAttributes(restPatientData: any): string {
  if (!restPatientData?.person?.attributes || !Array.isArray(restPatientData.person.attributes)) {
    return '--';
  }

  const phoneValues = restPatientData.person.attributes
    .filter(
      (attr: any) =>
        attr?.attributeType?.display === 'Telephone Number' ||
        attr?.attributeType?.name === 'Telephone Number' ||
        attr?.attributeType?.display === 'Telephone contact' ||
        attr?.attributeType?.name === 'Telephone contact' ||
        attr?.attributeType?.display?.toLowerCase().includes('phone') ||
        attr?.attributeType?.display?.toLowerCase().includes('telephone') ||
        attr?.attributeType?.display?.toLowerCase().includes('mobile') ||
        attr?.attributeType?.display?.toLowerCase().includes('contact'),
    )
    .map((attr: any) => attr?.value)
    .filter(Boolean);

  return phoneValues.length > 0 ? phoneValues.join(', ') : '--';
}

export function extractPhoneFromFhirTelecom(patientInfo: any): string {
  if (!patientInfo?.telecom || !Array.isArray(patientInfo.telecom)) {
    return '--';
  }

  const phoneValues = patientInfo.telecom
    .filter(
      (telecom: any) =>
        telecom?.system === 'phone' ||
        telecom?.system === 'mobile' ||
        (telecom?.use && (telecom.use === 'mobile' || telecom.use === 'home' || telecom.use === 'work')),
    )
    .map((telecom: any) => telecom?.value)
    .filter(Boolean);

  return phoneValues.length > 0 ? phoneValues.join(', ') : '--';
}

export function usePatientPhone(patient: any) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    const extractPhone = async () => {
      if (patient?.id) {
        try {
          const fhirPhone = extractPhoneFromFhirTelecom(patient);
          if (fhirPhone && fhirPhone !== '--') {
            setPhoneNumber(fhirPhone);
            return;
          }

          const restPatient = await fetchPatientFromRestApi(patient.id);
          if (restPatient) {
            const restPhone = extractPhoneFromPersonAttributes(restPatient);
            setPhoneNumber(restPhone);
          } else {
            setPhoneNumber('--');
          }
        } catch (error) {
          console.error('Error extracting phone number:', error);
          setPhoneNumber('--');
        }
      }
    };

    extractPhone();
  }, [patient]);

  return phoneNumber;
}
