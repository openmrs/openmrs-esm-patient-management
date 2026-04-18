import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useServiceQueueEntries } from '../service-queues.resource';
import QueuePatientBaseTable from './queue-linelist-base-table.component';

const ServicesTable: React.FC = () => {
  const { t } = useTranslation();

  const pathSegments = window.location.pathname.split('/');
  const service = decodeURIComponent(pathSegments[6]);
  const locationUuid = pathSegments[8];

  const { serviceQueueEntries, isLoading } = useServiceQueueEntries(service, locationUuid);

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
        header: t('phoneNumber', 'Phone number'),
        key: 'phoneNumber',
      },
    ],
    [t],
  );

  return (
    <div>
      <QueuePatientBaseTable
        title={t('aListOfPatients', 'A list of patients waiting for ')}
        headers={tableHeaders}
        patientData={serviceQueueEntries}
        serviceType={service}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ServicesTable;
