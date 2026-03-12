import React, { useMemo } from 'react';
import { filterByServiceType } from '../utils';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type AppointmentPanelConfig } from '../../scheduled-appointments-config-schema';

interface AppointmentsListProps {
  appointmentServiceTypes?: Array<string>;
  date: string;
  excludeCancelledAppointments?: boolean;
}

/**
 * This component is both rendered as a regular componant and as an extension.
 * As an extension, it can be configured to display appointments of certain status.
 */
const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointmentServiceTypes,
  date,
  excludeCancelledAppointments = false,
}) => {
  const { t } = useTranslation();
  const { status, title = t('todays', "Today's") } = useConfig<AppointmentPanelConfig>();
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const appointmentsFilteredByServiceType = filterByServiceType(appointmentList, appointmentServiceTypes).map(
    (appointment) => ({
      id: appointment.uuid,
      ...appointment,
    }),
  );

  const activeAppointments = useMemo(() => {
    return excludeCancelledAppointments
      ? appointmentsFilteredByServiceType.filter((appointment) => appointment.status !== 'Cancelled')
      : appointmentsFilteredByServiceType;
  }, [excludeCancelledAppointments, appointmentsFilteredByServiceType]);

  return (
    <AppointmentsTable
      appointments={activeAppointments}
      hasActiveFilters={appointmentServiceTypes?.length > 0}
      isLoading={isLoading}
      tableHeading={title}
    />
  );
};

export default AppointmentsList;
