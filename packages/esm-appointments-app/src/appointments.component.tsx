import React, { useState } from 'react';
import AppointmentList from './appointments/appointment-list.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';
import AppointmentsHeader from './appointments-header/appointments-header.component';
import { useTranslation } from 'react-i18next';
import Overlay from './overlay.component';
import AppointmentsCalendarListView from './appointments-calendar/appointments-calendar-list-view.component';
import CalendarPatientList from './appointments-calendar/calendar-patient-list/calendar-patient-list.component';

const ClinicalAppointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState<string>('');
  const pathName = window.location.pathname;
  const calendarLink = pathName.includes('calendar') ? true : false;
  const calendarListLink = pathName.includes('list') ? true : false;

  if (calendarLink) {
    return <AppointmentsCalendarListView />;
  }

  if (calendarListLink) {
    return <CalendarPatientList />;
  }

  return (
    <div>
      <AppointmentsHeader title={t('appointments', 'Appointments')} onChange={setAppointmentServiceType} />
      <ClinicMetrics serviceUuid={appointmentServiceType} />
      <AppointmentList appointmentServiceType={appointmentServiceType} />
      <Overlay />
    </div>
  );
};

export default ClinicalAppointments;
