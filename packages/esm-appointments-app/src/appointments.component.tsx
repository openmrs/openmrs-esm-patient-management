import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './header/appointments-header.component';
import AppointmentMetrics from './metrics/metrics-container.component';
import { useAppointmentsStore } from './store';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const { setAppointmentServiceTypes } = useAppointmentsStore();

  const params = useParams();

  useEffect(() => {
    if (params.serviceType) {
      setAppointmentServiceTypes([params.serviceType]);
    }
  }, [params.serviceType, setAppointmentServiceTypes]);

  return (
    <>
      <AppointmentsHeader title={t('appointments', 'Appointments')} showServiceTypeFilter />
      <AppointmentMetrics />
      <AppointmentTabs />
    </>
  );
};

export default Appointments;
