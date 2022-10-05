import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DataTableSkeleton } from '@carbon/react';
import { useMetrics, useAppointmentMetrics, useServiceMetricsCount, useServices } from './queue-metrics.resource';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './clinic-metrics.scss';
import { useSession, useLocations } from '@openmrs/esm-framework';

export interface Service {
  uuid: string;
  display: string;
}

function ClinicMetrics() {
  const { t } = useTranslation();
  const locations = useLocations();
  const session = useSession();

  const { metrics, isLoading } = useMetrics();
  const { totalScheduledAppointments } = useAppointmentMetrics();
  const [userLocation, setUserLocation] = useState('');
  const { allServices } = useServices(userLocation);
  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceUuid, setSelectedServiceUuid] = useState('');
  const { serviceCount } = useServiceMetricsCount(selectedService);

  useEffect(() => {
    if (!userLocation && session?.sessionLocation !== null) {
      setUserLocation(session?.sessionLocation?.uuid);
    } else if (!userLocation && locations) {
      setUserLocation([...locations].shift()?.uuid);
    }
  }, [session, locations, userLocation]);

  useEffect(() => {
    if (!selectedService && !selectedServiceUuid) {
      const service = allServices.find((s) => s.display.toLowerCase() === 'triage');
      setSelectedService(service?.display);
      setSelectedServiceUuid(service?.uuid);
    }
  }, [allServices, selectedService, selectedServiceUuid]);

  const handleServiceCountChange = ({ selectedItem }: { selectedItem: Service }) => {
    setSelectedService(selectedItem.display);
    setSelectedServiceUuid(selectedItem.uuid);
  };

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer}>
        <MetricsCard
          label={t('patients', 'Patients')}
          value={totalScheduledAppointments}
          headerLabel={t('scheduledAppointments', 'Scheduled appts. today')}
          service="scheduled"
        />
        <MetricsCard
          label={t('patients', 'Patients')}
          value={serviceCount}
          headerLabel={`${t('waitingFor', 'Waiting for')}:`}
          service={selectedService}
          serviceUuid={selectedServiceUuid}>
          <Dropdown
            id="inline"
            type="inline"
            initialSelectedItem={{ display: `${t('triage', 'Triage')}` }}
            label={selectedService}
            items={allServices?.length ? [...allServices] : []}
            itemToString={(item) => (item ? item.display : '')}
            onChange={handleServiceCountChange}
          />
        </MetricsCard>
        <MetricsCard
          label={t('minutes', 'Minutes')}
          value="--"
          headerLabel={t('averageWaitTime', 'Average wait time today')}
          service="waitTime"
        />
      </div>
    </>
  );
}

export default ClinicMetrics;
