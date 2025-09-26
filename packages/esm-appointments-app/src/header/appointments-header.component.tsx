import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import {
  PageHeader,
  PageHeaderContent,
  AppointmentsPictogram,
  OpenmrsDatePicker,
  useConfig,
} from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useAppointmentsStore, setSelectedDate, setAppointmentServiceTypes, setAppointmentProviders } from '../store';
import styles from './appointments-header.scss';
import { type ConfigObject } from '../config-schema';
import { useProviders } from '../hooks/useProviders';

interface AppointmentHeaderProps {
  title: string;
  showServiceTypeFilter?: boolean;
  showProvidersColumn?: boolean;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, showServiceTypeFilter }) => {
  const { t } = useTranslation();
  const { selectedDate, appointmentServiceTypes, appointmentProviders } = useAppointmentsStore();
  const { serviceTypes } = useAppointmentServices();

  const config = useConfig<ConfigObject>();
  const { showProviderColumn } = config;
  const { providers } = useProviders();

  const handleChangeServiceTypeFilter = useCallback(({ selectedItems }) => {
    const selectedUuids = selectedItems.map((item) => item.id);
    setAppointmentServiceTypes(selectedUuids);
  }, []);

  const handleChangeProviderFilter = useCallback(({ selectedItems }) => {
    const selectedUuids = selectedItems.map((item) => item.id);
    setAppointmentProviders(selectedUuids);
  }, []);

  const serviceTypeOptions = useMemo(
    () => serviceTypes?.map((item) => ({ id: item.uuid, label: item.name })) ?? [],
    [serviceTypes],
  );

  const providerOptions = useMemo(
    () => providers?.map((item) => ({ id: item.uuid, label: item.display })) ?? [],
    [providers],
  );

  return (
    <PageHeader className={styles.header} data-testid="appointments-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
      <div className={styles.rightJustifiedItems}>
        <OpenmrsDatePicker
          data-testid="appointment-date-picker"
          id="appointment-date-picker"
          labelText=""
          onChange={(date) => setSelectedDate(dayjs(date).startOf('day').format(omrsDateFormat))}
          value={dayjs(selectedDate).toDate()}
        />
        <div className="styles.metricsContent">
          {showServiceTypeFilter && (
            <MultiSelect
              id="serviceTypeMultiSelect"
              items={serviceTypeOptions}
              itemToString={(item) => (item ? item.label : '')}
              label={t('filterAppointmentsByServiceType', 'Filter appointments by service type')}
              onChange={handleChangeServiceTypeFilter}
              type="inline"
              selectedItems={serviceTypeOptions.filter((item) => appointmentServiceTypes.includes(item.id))}
            />
          )}

          {showProviderColumn && (
            <MultiSelect
              id="providerMultiSelect"
              items={providerOptions}
              itemToString={(item) => (item ? item.label : '')}
              label={t('filterAppointmentsByProvider', 'Filter appointments by provider')}
              onChange={handleChangeProviderFilter}
              type="inline"
              selectedItems={providerOptions.filter((item) => appointmentProviders.includes(item.id))}
            />
          )}
        </div>
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
