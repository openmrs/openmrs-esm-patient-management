import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import DefaultQueueTable from './queue-table/default-queue-table.component';

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PatientQueueHeader title={t('serviceQueues', 'Service queues')} showLocationDropdown />
      <ClinicMetrics />
      <DefaultQueueTable />
    </>
  );
};

export default Home;
