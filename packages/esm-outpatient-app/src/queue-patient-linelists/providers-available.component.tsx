import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import QueuePatientBaseTable from './queue-linelist-base-table.component';
import { usePagination } from '@openmrs/esm-framework';
import { useProviders } from './queue-linelist.resource';

const pageSize = 20;

const AvailableProvidersTable: React.FC = () => {
  const { t } = useTranslation();
  const { providers, isLoading } = useProviders();
  const { results: paginatedProviders } = usePagination(providers, pageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('providerName', 'Provider Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('serviceType', 'Service Type'),
        key: 'serviceType',
      },
      {
        id: 2,
        header: t('location', 'Location'),
        key: 'location',
      },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      paginatedProviders?.map((provider) => {
        return {
          id: provider.uuid ? provider.uuid : '--',
          name: provider?.person ? provider.person?.display : '--',
          serviceType: provider?.serviceType ? provider?.serviceType : '--',
          location: provider?.location ? provider.location : '--',
        };
      }),
    [paginatedProviders],
  );

  return (
    <div>
      <QueuePatientBaseTable
        title={t('providersAvailable', 'Providers available')}
        headers={tableHeaders}
        rows={tableRows}
        patientData={paginatedProviders}
        serviceType=""
        isLoading={isLoading}
      />
    </div>
  );
};

export default AvailableProvidersTable;
