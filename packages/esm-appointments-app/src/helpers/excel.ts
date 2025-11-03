import { writeFile, utils, type WorkSheet } from 'xlsx';
import { formatDate } from '@openmrs/esm-framework';
import { type Appointment } from '../types';
import { type ConfigObject } from '../config-schema';
import { getPatientPhoneNumber } from './functions';

type RowData = {
  id: string; // Corresponds to the UUID of an appointment
  identifier?: string; // Optional identifier property
} & Record<string, unknown>; // Allow for other dynamic properties

/**
 * Exports the provided appointments as an Excel spreadsheet.
 * @param {Array<Appointment>} appointments - The list of appointments to export.
 * @param {Array} rowData - The current rows of the table as rendered in the UI.
 * @param {string} [fileName] - The name of the downloaded file
 * @param {ConfigObject} [config] - Configuration object
 */
export async function exportAppointmentsToSpreadsheet(
  appointments: Array<Appointment>,
  rowData: Array<RowData>,
  fileName = 'Appointments',
  config?: ConfigObject,
) {
  const appointmentsJSON = await Promise.all(
    appointments.map(async (appointment: Appointment) => {
      const matchingAppointment = rowData.find((row) => row.id === appointment.uuid);
      const identifier = matchingAppointment?.identifier ?? appointment.patient.identifier;
      let phoneNumber = '--';
      if (config?.includePhoneNumberInExcelSpreadsheet) {
        phoneNumber = await getPatientPhoneNumber(appointment.patient.uuid);
      }

      const appointmentData: Record<string, any> = {
        'Patient name': appointment.patient.name,
        Gender: appointment.patient.gender === 'F' ? 'Female' : 'Male',
        Age: appointment.patient.age,
        Identifier: identifier,
        'Appointment type': appointment.service?.name,
        Date: formatDate(new Date(appointment.startDateTime), { mode: 'wide' }),
      };
      if (config?.includePhoneNumberInExcelSpreadsheet) {
        appointmentData['Telephone number'] = phoneNumber;
      }
      return appointmentData;
    }),
  );

  const worksheet = createWorksheet(appointmentsJSON);
  const workbook = createWorkbook(worksheet, 'Appointment list');
  writeFile(workbook, `${fileName}.xlsx`, { compression: true });
}

/**
Exports unscheduled appointments as an Excel spreadsheet.
@param {Array<Object>} unscheduledAppointments - The list of unscheduled appointments to export.
@param {string} fileName - The name of the file to download. Defaults to 'Unscheduled appointments {current date and time}'.
*/
export function exportUnscheduledAppointmentsToSpreadsheet(
  unscheduledAppointments: Array<any>,
  fileName: string = `Unscheduled appointments ${formatDate(new Date(), { year: true, time: true })}`,
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

  writeFile(workbook, `${fileName}.xlsx`, { compression: true });
}

function createWorksheet(data: any[]) {
  const max_width = data.reduce((w, r) => Math.max(w, r['Patient name'].length), 30);
  const worksheet = utils.json_to_sheet(data);
  worksheet['!cols'] = [{ wch: max_width }];
  return worksheet;
}

function createWorkbook(worksheet: WorkSheet, sheetName: string) {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}
