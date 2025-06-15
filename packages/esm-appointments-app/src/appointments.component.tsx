import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { omrsDateFormat } from './constants';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './header/appointments-header.component';
import AppointmentMetrics from './metrics/appointments-metrics.component';
import { useAppointmentsStore, setAppointmentServiceTypes, setSelectedDate } from './store';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const { appointmentServiceTypes } = useAppointmentsStore();

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

  return (
    <>
      <AppointmentsHeader title={t('appointments', 'Appointments')} showServiceTypeFilter />
      <AppointmentMetrics appointmentServiceTypes={appointmentServiceTypes} />
      <AppointmentTabs appointmentServiceTypes={appointmentServiceTypes} />
    </>
  );
};

export default Appointments;
