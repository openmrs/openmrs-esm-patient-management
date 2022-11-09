import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import QueuePatientBaseTable from './queue-linelist-base-table.component';
import { usePagination, ConfigurableLink, formatDate } from '@openmrs/esm-framework';
import { useAppointments } from './queue-linelist.resource';

const pageSize = 100;

const AppointmentsTable: React.FC = () => {
  const { t } = useTranslation();
  const { appointmentQueueEntries, isLoading } = useAppointments();
  const { results: paginatedAppointments } = usePagination(appointmentQueueEntries, pageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('returnDate', 'Return Date'),
        key: 'returnDate',
      },
      {
        id: 2,
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: 3,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: 4,
        header: t('visitType', 'Visit Type'),
        key: 'visitType',
      },
      {
        id: 5,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 6,
        header: t('phoneNumber', 'Phone Number'),
        key: 'phoneNumber',
      },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      paginatedAppointments?.map((appointment) => {
        return {
          id: appointment.uuid,
          name: {
            content: (
              <ConfigurableLink to={`\${openmrsSpaBase}/patient/${appointment.patient.uuid}/chart`}>
                {appointment.patient.name}
              </ConfigurableLink>
            ),
          },
          returnDate: formatDate(new Date(appointment.startDateTime), { mode: 'wide' }),
          gender: appointment.patient?.gender,
          age: appointment.patient.age,
          visitType: appointment.appointmentKind,
          status: appointment.status,
          phoneNumber: appointment.patient?.phoneNumber,
        };
      }),
    [paginatedAppointments],
  );

  return (
    <div>
      <QueuePatientBaseTable
        title={t('scheduledAppointmentsList', 'Scheduled appointments patient list')}
        headers={tableHeaders}
        rows={tableRows}
        patientData={paginatedAppointments}
        serviceType=""
        isLoading={isLoading}
      />
    </div>
  );
};

export default AppointmentsTable;
