import * as XLSX from 'xlsx';
import { fetchCurrentPatient, formatDate, getConfig } from '@openmrs/esm-framework';
import { type Appointment } from '../types';
import { type ConfigObject } from '../config-schema';
import { moduleName } from '../constants';

/**
 * Exports the provided appointments as an Excel spreadsheet.
 * @param {Array<Appointment>} appointments - The list of appointments to export.
 * @param {string} [fileName] - The name of the downloaded file
 */
export async function exportAppointmentsToSpreadsheet(appointments: Array<Appointment>, fileName = 'Appointments') {
  const config = await getConfig<ConfigObject>(moduleName);
  const includePhoneNumbers = config.includePhoneNumberInExcelSpreadsheet ?? false;

  const appointmentsJSON = await Promise.all(
    appointments.map(async (appointment: Appointment) => {
      const patientInfo = await fetchCurrentPatient(appointment.patient.uuid);
      const phoneNumber =
        includePhoneNumbers && patientInfo?.telecom
          ? patientInfo.telecom.map((telecomObj) => telecomObj?.value).join(', ')
          : '';

      return {
        'Patient name': appointment.patient.name,
        Gender: appointment.patient.gender === 'F' ? 'Female' : 'Male',
        Age: appointment.patient.age,
        Identifier: appointment.patient.identifier ?? '--',
        'Appointment type': appointment.service?.name,
        Date: formatDate(new Date(appointment.startDateTime), { mode: 'wide' }),
        ...(includePhoneNumbers ? { 'Telephone number': phoneNumber } : {}),
      };
    }),
  );

  const worksheet = createWorksheet(appointmentsJSON);
  const workbook = createWorkbook(worksheet, 'Appointment list');
  XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
}

/**
Exports unscheduled appointments as an Excel spreadsheet.
@param {Array<Object>} unscheduledAppointments - The list of unscheduled appointments to export.
@param {string} fileName - The name of the file to download. Defaults to 'Unscheduled appointments {current date and time}'.
*/
export function exportUnscheduledAppointmentsToSpreadsheet(
  unscheduledAppointments: Array<any>,
  fileName = `Unscheduled appointments ${formatDate(new Date(), { year: true, time: true })}`,
) {
  const appointmentsJSON = unscheduledAppointments?.map((appointment) => ({
    'Patient name': appointment.name,
    Gender: appointment.gender === 'F' ? 'Female' : 'Male',
    Age: appointment.age,
    'Phone Number': appointment.phoneNumber ?? '--',
    Identifier: appointment.identifier ?? '--',
  }));

  const worksheet = createWorksheet(appointmentsJSON);
  const workbook = createWorkbook(worksheet, 'Appointment list');

  XLSX.writeFile(workbook, `${fileName}.xlsx`, {
    compression: true,
  });
}

function createWorksheet(data: any[]) {
  const max_width = data.reduce((w, r) => Math.max(w, r['Patient name'].length), 30);
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [{ wch: max_width }];
  return worksheet;
}

function createWorkbook(worksheet: XLSX.WorkSheet, sheetName: string) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}
