import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './header/appointments-header.component';
import AppointmentMetrics from './metrics/appointments-metrics.component';
import Overlay from './overlay.component';
import { useParams } from 'react-router-dom';
import { changeSelectedDate } from './helpers';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState<string>('');

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      changeSelectedDate(params.date);
    }
  }, [params.date]);

  useEffect(() => {
    if (params.serviceType) {
      setAppointmentServiceType(params.serviceType);
    }
  }, [params.serviceType]);

  return (
    <>
      <AppointmentsHeader
        title={t('home', 'Home')}
        appointmentServiceType={appointmentServiceType}
        onChange={setAppointmentServiceType}
      />
      <AppointmentMetrics appointmentServiceType={appointmentServiceType} />
      <AppointmentTabs appointmentServiceType={appointmentServiceType} />
      <Overlay />
    </>
  );
};

export default Appointments;
