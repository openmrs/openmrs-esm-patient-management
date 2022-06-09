import React from 'react';
import { useTranslation } from 'react-i18next';
import QueuePatientBaseTable from './linelist-base-table.component';
import { useQueueDetails } from './queue-patient.resource';

const ServicesTable: React.FC = () => {
  const { t } = useTranslation();
  const { linelistsQueueEntries, isLoading } = useQueueDetails();

  return (
    <div>
      <QueuePatientBaseTable
        title={t('linelistTableTitle', 'A list of patients waiting for ')}
        patientData={linelistsQueueEntries}
      />
    </div>
  );
};

export default ServicesTable;
