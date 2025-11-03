import dayjs, { type Dayjs } from 'dayjs';
import { openmrsFetch, restBaseUrl, fetchCurrentPatient } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import { type AppointmentSummary, type Appointment } from '../types';

// FHIR2 R4 endpoint - true FHIR2 implementation
async function fetchPatientFromFhir2(patientUuid: string): Promise<any> {
  if (!patientUuid) {
    return null;
  }

  try {
    const { data } = await openmrsFetch(`/openmrs/ws/fhir2/R4/Patient/${patientUuid}`);
    return data;
  } catch (error) {
    return null;
  }
}

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

export async function fetchPatientFromRestApi(patientUuid: string): Promise<any> {
  if (!patientUuid) {
    return null;
  }

  try {
    const { data } = await openmrsFetch(`${restBaseUrl}/patient/${patientUuid}?v=full`);

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

export function extractPhoneFromPersonAttributes(restPatientData: any): string {
  if (!restPatientData?.person?.attributes || !Array.isArray(restPatientData.person.attributes)) {
    return '--';
  }

  const phoneAttributes = restPatientData.person.attributes
    .filter((attr: any) => {
      if (!attr?.attributeType) return false;

      const display = (attr.attributeType.display || '').toLowerCase();
      const name = (attr.attributeType.name || '').toLowerCase();
      const description = (attr.attributeType.description || '').toLowerCase();

      // Check for various phone-related terms
      const phoneTerms = ['phone', 'telephone', 'mobile', 'contact', 'cell'];

      return phoneTerms.some((term) => display.includes(term) || name.includes(term) || description.includes(term));
    })
    .map((attr: any) => ({
      value: attr?.value?.trim(),
      type: attr?.attributeType?.display || attr?.attributeType?.name || 'Unknown',
      priority: getPriorityForPhoneType(attr?.attributeType?.display || attr?.attributeType?.name || ''),
    }))
    .filter((phone: any) => phone.value && phone.value.length > 0);

  if (phoneAttributes.length === 0) {
    return '--';
  }

  // Sort by priority (mobile first, then others)
  phoneAttributes.sort((a, b) => a.priority - b.priority);

  // Return the highest priority phone(s)
  const topPriority = phoneAttributes[0].priority;
  const topPhones = phoneAttributes.filter((phone) => phone.priority === topPriority).map((phone) => phone.value);

  return topPhones.join(', ');
}

export async function getPatientPhoneNumber(patientUuid: string): Promise<string> {
  if (!patientUuid) {
    return '--';
  }

  try {
    // Step 1: Try FHIR2 R4 endpoint directly
    const fhir2Patient = await fetchPatientFromFhir2(patientUuid);
    if (fhir2Patient) {
      const fhir2Phone = extractPhoneFromFhirTelecom(fhir2Patient);
      if (fhir2Phone && fhir2Phone !== '--') {
        return fhir2Phone;
      }
    }

    // Step 2: Try framework FHIR function (fallback)
    const fhirPatient = await fetchCurrentPatient(patientUuid);
    if (fhirPatient) {
      const fhirPhone = extractPhoneFromFhirTelecom(fhirPatient);
      if (fhirPhone && fhirPhone !== '--') {
        return fhirPhone;
      }
    }

    // Step 3: Fallback to REST API
    const restPatient = await fetchPatientFromRestApi(patientUuid);
    if (restPatient) {
      return extractPhoneFromPersonAttributes(restPatient);
    }

    return '--';
  } catch (error) {
    return '--';
  }
}

function getPriorityForPhoneType(typeName: string): number {
  const type = typeName.toLowerCase();

  if (type.includes('mobile') || type.includes('cell')) return 1;
  if (type.includes('primary') || type.includes('main')) return 2;
  if (type.includes('home') || type.includes('residence')) return 3;
  if (type.includes('work') || type.includes('office') || type.includes('business')) return 4;
  if (type.includes('emergency')) return 5;
  if (type.includes('telephone') || type.includes('phone')) return 6;

  return 9; // Default priority for unknown types
}

export function extractPhoneFromFhirTelecom(patientInfo: any): string {
  if (!patientInfo?.telecom || !Array.isArray(patientInfo.telecom)) {
    return '--';
  }

  const phoneContacts = patientInfo.telecom
    .filter((telecom: any) => {
      // Check for phone system
      if (telecom?.system === 'phone') return true;
      if (telecom?.system === 'mobile') return true;

      // Check for phone use types
      if (telecom?.use && ['mobile', 'home', 'work', 'temp'].includes(telecom.use)) {
        return telecom.system === 'phone' || !telecom.system; // Accept if system is phone or undefined
      }

      return false;
    })
    .map((telecom: any) => ({
      value: telecom?.value?.trim(),
      use: telecom?.use || 'unspecified',
      system: telecom?.system || 'phone',
    }))
    .filter((contact: any) => contact.value && contact.value.length > 0);

  if (phoneContacts.length === 0) {
    return '--';
  }

  // Prioritize mobile phones, then home, then work, then others
  const priorityOrder = ['mobile', 'home', 'work', 'temp', 'unspecified'];

  phoneContacts.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a.use);
    const bPriority = priorityOrder.indexOf(b.use);
    return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
  });

  // Return the highest priority phone number, or all if multiple with same priority
  const topPriorityUse = phoneContacts[0].use;
  const topPriorityPhones = phoneContacts
    .filter((contact) => contact.use === topPriorityUse)
    .map((contact) => contact.value);

  return topPriorityPhones.join(', ');
}

export function usePatientPhone(patient: any) {
  const [phoneNumber, setPhoneNumber] = useState<string>('--');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const extractPhone = async () => {
      // Reset state
      setIsLoading(true);
      setPhoneNumber('--');

      // Check if we have a valid patient
      if (!patient?.id && !patient?.uuid) {
        setIsLoading(false);
        return;
      }

      const patientId = patient.id || patient.uuid;

      try {
        // Step 1: Try FHIR2 R4 directly first  
        const fhir2Patient = await fetchPatientFromFhir2(patientId);
        if (fhir2Patient) {
          const fhir2Phone = extractPhoneFromFhirTelecom(fhir2Patient);
          if (fhir2Phone && fhir2Phone !== '--') {
            setPhoneNumber(fhir2Phone);
            setIsLoading(false);
            return;
          }
        }

        // Step 2: Try framework FHIR function
        const fhirPhone = extractPhoneFromFhirTelecom(patient);
        if (fhirPhone && fhirPhone !== '--') {
          setPhoneNumber(fhirPhone);
          setIsLoading(false);
          return;
        }

        // Step 3: Fallback to REST API for person attributes
        const restPatient = await fetchPatientFromRestApi(patientId);
        if (restPatient) {
          const restPhone = extractPhoneFromPersonAttributes(restPatient);
          setPhoneNumber(restPhone);
        } else {
          setPhoneNumber('--');
        }
      } catch (error) {
        setPhoneNumber('--');
      } finally {
        setIsLoading(false);
      }
    };

    extractPhone();
  }, [patient?.id, patient?.uuid]);

  return { phoneNumber, isLoading };
}
