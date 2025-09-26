import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { omrsDateFormat } from './constants';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './header/appointments-header.component';
import AppointmentMetrics from './metrics/metrics-container.component';
import { useAppointmentsStore, setAppointmentServiceTypes, setSelectedDate, setAppointmentProviders } from './store';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const { appointmentServiceTypes, appointmentProviders } = useAppointmentsStore();

  const params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  useEffect(() => {
    if (params.serviceType) {
      setAppointmentServiceTypes([params.serviceType]);
    }
  }, [params.serviceType]);

  useEffect(() => {
    if (params.appointmentProviders) {
      setAppointmentProviders([params.appointmentProviders]);
    }
  }, [params.appointmentProviders]);

  return (
    <>
      <AppointmentsHeader title={t('appointments', 'Appointments')} showServiceTypeFilter />
      <AppointmentMetrics appointmentServiceTypes={appointmentServiceTypes} />
      <AppointmentTabs appointmentServiceTypes={appointmentServiceTypes} appointmentProviders={appointmentProviders} />
    </>
  );
};

export default Appointments;
