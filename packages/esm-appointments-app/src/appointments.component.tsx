import React, { useState } from 'react';
import AppointmentList from './appointments/appointment-list.component';
import ClinicMetrics from './appointments-metrics/appointments-metrics.component';
import AppointmentsHeader from './appointments-header/appointments-header.component';
import { useTranslation } from 'react-i18next';
import Overlay from './overlay.component';
import { navigate, useSession } from '@openmrs/esm-framework';

const ClinicalAppointments: React.FC = () => {
  const { t } = useTranslation();
  const [appointmentServiceType, setAppointmentServiceType] = useState<string>('');
  const session = useSession();

  if (session.sessionLocation === null) {
    navigate({
      to: `\${openmrsSpaBase}/login/location?returnToUrl=${window.location.pathname}`,
    });
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
