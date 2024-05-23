import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import AppointmentTabs from './appointments/appointment-tabs.component';
import AppointmentsHeader from './header/appointments-header.component';
import AppointmentMetrics from './metrics/appointments-metrics.component';
import { WorkspaceOverlay } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import SelectedDateContext from './hooks/selectedDateContext';
import { omrsDateFormat } from './constants';

const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().startOf('day').format(omrsDateFormat));

  let params = useParams();

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
        title={t('home', 'Home')}
        appointmentServiceType={appointmentServiceType}
        onChange={setAppointmentServiceType}
      />
      <AppointmentMetrics appointmentServiceType={appointmentServiceType} />
      <AppointmentTabs appointmentServiceType={appointmentServiceType} />
      <WorkspaceOverlay contextKey="appointments" />
    </SelectedDateContext.Provider>
  );
};

export default Appointments;
