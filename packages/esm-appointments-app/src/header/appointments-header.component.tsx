import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { PageHeader, PageHeaderContent, AppointmentsPictogram, OpenmrsDatePicker } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useAppointmentsStore, setSelectedDate, setAppointmentServiceTypes } from '../store';
import styles from './appointments-header.scss';

interface AppointmentHeaderProps {
  title: string;
  showServiceTypeFilter?: boolean;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, showServiceTypeFilter }) => {
  const { t } = useTranslation();
  const { selectedDate, appointmentServiceTypes } = useAppointmentsStore();
  const { serviceTypes } = useAppointmentServices();

  const handleChangeServiceTypeFilter = useCallback(({ selectedItems }) => {
    const selectedUuids = selectedItems.map((item) => item.id);
    setAppointmentServiceTypes(selectedUuids);
  }, []);

  const serviceTypeOptions = useMemo(
    () => serviceTypes?.map((item) => ({ id: item.uuid, label: item.name })) ?? [],
    [serviceTypes],
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
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
