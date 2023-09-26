import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './appointments-header/appointments-header.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';
import Overlay from './overlay.component';

const ClinicalAppointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState<string>('');

  return (
    <>
      <AppointmentsHeader title={t('home', 'Home')} onChange={setAppointmentServiceType} />
      <ClinicMetrics serviceUuid={appointmentServiceType} />
      <AppointmentTabs appointmentServiceType={appointmentServiceType} />
      <Overlay />
    </>
  );
};

export default ClinicalAppointments;
