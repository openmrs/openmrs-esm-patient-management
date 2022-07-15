import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import QueuePatientBaseTable from './queue-linelist-base-table.component';
import { formatDatetime, parseDate, ConfigurableLink } from '@openmrs/esm-framework';
import { useServiceQueueEntries } from '../active-visits/active-visits-table.resource';
import { filterType } from '../types';

interface ServicesTableProps {
  toggleFilter?: (filterMode: filterType) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({ toggleFilter }) => {
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

  const tableRows = useMemo(
    () =>
      serviceQueueEntries?.map((entry) => {
        return {
          id: entry.id,
          name: {
            content: (
              <ConfigurableLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`}>
                {entry.name}
              </ConfigurableLink>
            ),
          },
          returnDate: formatDatetime(parseDate(entry.returnDate), { mode: 'wide' }),
          gender: entry.gender,
          age: entry.age,
          visitType: entry.visitType,
          phoneNumber: entry.phoneNumber,
        };
      }),
    [serviceQueueEntries],
  );

  return (
    <div>
      <QueuePatientBaseTable
        title={t('alistOfClients', 'A list of clients waiting for ')}
        headers={tableHeaders}
        rows={tableRows}
        patientData={serviceQueueEntries}
        serviceType={service}
        isLoading={isLoading}
        toggleFilter={() => toggleFilter(filterType.SHOW)}
      />
    </div>
  );
};

export default ServicesTable;
