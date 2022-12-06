import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import QueuePatientBaseTable from './queue-linelist-base-table.component';
import { useServiceQueueEntries } from '../active-visits/active-visits-table.resource';

const ServicesTable: React.FC = () => {
  const { t } = useTranslation();

  const currentPathName: string = window.location.pathname;
  let service = currentPathName.split('/')[4];
  const { serviceQueueEntries, isLoading } = useServiceQueueEntries(service);

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
        header: t('phoneNumber', 'Phone Number'),
        key: 'phoneNumber',
      },
    ],
    [t],
  );

  return (
    <div>
      <QueuePatientBaseTable
        title={t('alistOfClients', 'A list of clients waiting for ')}
        headers={tableHeaders}
        patientData={serviceQueueEntries}
        serviceType={service}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ServicesTable;
