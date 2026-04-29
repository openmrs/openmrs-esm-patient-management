import { writeFile, utils, type WorkSheet } from 'xlsx';
import { fetchCurrentPatient, formatDate, getConfig } from '@openmrs/esm-framework';
import { type AppointmentExcelInput } from '../types';
import { type ConfigObject } from '../config-schema';
import { moduleName } from '../constants';

type RowData = {
  id: string; // Corresponds to the UUID of an appointment
  identifier?: string; // Optional identifier property
} & Record<string, unknown>; // Allow for other dynamic properties

interface AppointmentSpreadsheetData {
  'Patient name': string;
  Gender: string;
  Age: number;
  Identifier: string;
  'Appointment type'?: string;
  Date?: string;
  'Telephone number'?: string;
}

/**
 * Exports the provided appointments as an Excel spreadsheet.
 * @param {Array<Appointment>} appointments - The list of appointments to export.
 * @param {Array} rowData - The current rows of the table as rendered in the UI.
 * @param {string} [fileName] - The name of the downloaded file
 */
export async function exportAppointmentsToSpreadsheet(
  appointments: Array<AppointmentExcelInput>,
  rowData: Array<RowData>,
  fileName = 'Appointments',
) {
  const config = await getConfig<ConfigObject>(moduleName);
  const includePhoneNumbers = config.includePhoneNumberInExcelSpreadsheet ?? false;

  const appointmentsJSON = await Promise.all(
    appointments.map(async (appointment: AppointmentExcelInput) => {
      const matchingAppointment = rowData.find((row) => row.id === appointment.uuid);
      const identifier = matchingAppointment?.identifier ?? appointment.patient.identifier;

      const patientInfo = await fetchCurrentPatient(appointment.patient.uuid);
      const phoneNumber =
        includePhoneNumbers && patientInfo?.telecom
          ? patientInfo.telecom.map((telecomObj) => telecomObj?.value).join(', ')
          : '';

      return {
        'Patient name': appointment.name,
        Gender: appointment.gender === 'F' ? 'Female' : 'Male',
        Age: appointment.age,
        Identifier: identifier,
        'Appointment type': appointment.service?.name,
        Date: formatDate(new Date(appointment.startDateTime), { mode: 'wide' }),
        ...(includePhoneNumbers ? { 'Telephone number': phoneNumber } : {}),
      };
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
  unscheduledAppointments: Array<AppointmentExcelInput>,
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

  writeFile(workbook, `${fileName}.xlsx`, {
    compression: true,
  });
}

function createWorksheet(data: Record<string, string | number | undefined>[]) {
  const max_width = data.reduce((w, r) => Math.max(w, String(r['Patient name'] || '').length), 30);
  const worksheet = utils.json_to_sheet(data);
  worksheet['!cols'] = [{ wch: max_width }];
  return worksheet;
}

function createWorkbook(worksheet: WorkSheet, sheetName: string) {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}
