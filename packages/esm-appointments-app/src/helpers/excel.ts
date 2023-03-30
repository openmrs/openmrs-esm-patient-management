import { formatDate } from '@openmrs/esm-framework';
import { parseDate } from 'tough-cookie';
import * as XLSX from 'xlsx';
import { Response } from '../hooks/useUnscheduledAppointments';
import { MappedAppointment } from '../types';

export function DownloadAppointmentAsExcel(
  appointments: Array<MappedAppointment>,
  fileName: string = `Appointments ${formatDate(new Date(), { year: true, time: true })}`,
) {
  const appointmentsJSON = appointments?.map((appointments) => {
    return {
      'Patient name': appointments.name,
      Gender: appointments.gender === 'F' ? 'Female' : 'Male',
      Age: appointments.age,
      'Appointment type': appointments.serviceType,
      Date: formatDate(new Date(appointments.dateTime), { mode: 'wide' }),
      'Phone Number': appointments.phoneNumber ?? '--',
    };
  });
  const max_width = appointmentsJSON.reduce((w, r) => Math.max(w, r['Patient name'].length), 30);
  const worksheet = XLSX.utils.json_to_sheet(appointmentsJSON as any);
  worksheet['!cols'] = [{ wch: max_width }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointment list');
  XLSX.writeFile(workbook, `${fileName}.xlsx`, {
    compression: true,
  });
}

export function DownloadUnscheduleAppointments(
  appointments: Array<Response>,
  fileName: string = `Unscheduled appointments ${formatDate(new Date(), { year: true, time: true })}`,
) {
  const appointmentsJSON = appointments?.map((appointments) => {
    return {
      'Patient name': appointments.name,
      Gender: appointments.gender === 'F' ? 'Female' : 'Male',
      Age: appointments.age,
      'Phone Number': appointments.phoneNumber ?? '--',
      Identifier: appointments.identifier ?? '--',
    };
  });
  const max_width = appointmentsJSON.reduce((w, r) => Math.max(w, r['Patient name'].length), 30);
  const worksheet = XLSX.utils.json_to_sheet(appointmentsJSON as any);
  worksheet['!cols'] = [{ wch: max_width }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointment list');
  XLSX.writeFile(workbook, `${fileName}.xlsx`, {
    compression: true,
  });
}
