import { formatDate } from '@openmrs/esm-framework';
import * as XLSX from 'xlsx';

/**
 * Downloads the provided appointments as an Excel file.
 * @param {Array<MappedAppointment>} appointments - The list of appointments to download.
 * @param {string} [fileName] - The name of the downloaded file (default: 'Appointments {current date and time}').
 */
export function downloadAppointmentsAsExcel(
  appointments,
  fileName = `Appointments ${formatDate(new Date(appointments[0]?.dateTime ?? new Date()), {
    year: true,
    time: true,
  })}`,
) {
  const appointmentsJSON = appointments?.map(
    ({ name, gender, age, serviceType, dateTime, phoneNumber, identifier }) => ({
      'Patient name': name,
      Gender: gender === 'F' ? 'Female' : 'Male',
      Age: age,
      Identifier: identifier ?? '--',
      'Appointment type': serviceType,
      Date: formatDate(new Date(dateTime), { mode: 'wide' }),
      'Phone Number': phoneNumber || '--',
    }),
  );

  const worksheet = createWorksheet(appointmentsJSON);
  const workbook = createWorkbook(worksheet, 'Appointment list');
  XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
}

/**
Downloads unscheduled appointments as an Excel file.
@param {Array<Object>} unscheduledAppointments - The list of unscheduled appointments to download.
@param {string} fileName - The name of the file to download. Defaults to 'Unscheduled appointments {current date and time}'.
*/
export function downloadUnscheduledAppointments(
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
