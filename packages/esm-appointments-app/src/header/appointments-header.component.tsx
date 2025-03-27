import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { PageHeader, PageHeaderContent, AppointmentsPictogram, OpenmrsDatePicker } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useSelectedDateContext } from '../hooks/selected-date-context';
import styles from './appointments-header.scss';

interface AppointmentHeaderProps {
  title: string;
  appointmentServiceTypes?: Array<string>;
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, onChange }) => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useSelectedDateContext();
  const { serviceTypes } = useAppointmentServices();

  const [selectedItems, setSelectedItems] = useState([]);

  const handleMultiSelectChange = useCallback(
    ({ selectedItems }) => {
      const selectedUuids = selectedItems.map((item) => item.id);
      setSelectedItems(selectedUuids);
      onChange?.(selectedUuids);
    },
    [onChange],
  );

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
        {typeof onChange === 'function' && (
          <MultiSelect
            id="serviceTypeMultiSelect"
            items={serviceTypeOptions}
            itemToString={(item) => (item ? item.label : '')}
            label={t('filterAppointmentsByServiceType', 'Filter appointments by service type')}
            onChange={handleMultiSelectChange}
            type="inline"
          />
        )}
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
