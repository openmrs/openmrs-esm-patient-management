import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { omrsDateFormat } from './constants';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './header/appointments-header.component';
import AppointmentMetrics from './metrics/appointments-metrics.component';
import SelectedDateContext from './hooks/selectedDateContext';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf('day').format(omrsDateFormat));

  const params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  useEffect(() => {
    if (params.serviceType) {
      setAppointmentServiceType(params.serviceType);
    }
  }, [params.serviceType]);

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      <AppointmentsHeader
        appointmentServiceType={appointmentServiceType}
        onChange={setAppointmentServiceType}
        title={t('appointments', 'Appointments')}
      />
      <AppointmentMetrics appointmentServiceType={appointmentServiceType} />
      <AppointmentTabs appointmentServiceType={appointmentServiceType} />
    </SelectedDateContext.Provider>
  );
};

export default Appointments;
