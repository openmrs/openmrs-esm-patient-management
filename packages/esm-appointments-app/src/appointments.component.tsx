import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentList from './appointments/appointment-tabs.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';
import AppointmentsHeader from './appointments-header/appointments-header.component';
import Overlay from './overlay.component';
import AppointmentsCalendarListView from './appointments-calendar/appointments-calendar-view.component';
import CalendarPatientList from './appointments-calendar/patient-list/calendar-patient-list.component';

const ClinicalAppointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState<string>('');
  const pathname = window.location.pathname;

  if (pathname.includes('calendar')) {
    return <AppointmentsCalendarListView />;
  }

  if (pathname.includes('list')) {
    return <CalendarPatientList />;
  }

  return (
    <>
      <AppointmentsHeader title={t('appointments', 'Appointments')} onChange={setAppointmentServiceType} />
      <ClinicMetrics serviceUuid={appointmentServiceType} />
      <AppointmentList appointmentServiceType={appointmentServiceType} />
      <Overlay />
    </>
  );
};

export default ClinicalAppointments;
