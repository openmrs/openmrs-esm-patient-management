import React, { useCallback, useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DatePicker, DatePickerInput, MultiSelect } from '@carbon/react';
import { PageHeader, PageHeaderContent, AppointmentsPictogram } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import SelectedDateContext from '../hooks/selectedDateContext';
import styles from './appointments-header.scss';

interface AppointmentHeaderProps {
  title: string;
  appointmentServiceType?: string[];
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, appointmentServiceType, onChange }) => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);
  const { serviceTypes } = useAppointmentServices();

  const items = [...serviceTypes];
  const [selectedItems, setSelectedItems] = useState([]);

  const handleMultiSelectChange = useCallback(
    ({ selectedItems }) => {
      const selectedUuids = selectedItems.map((item) => item.id);
      if (selectedUuids.length === 0) {
        setSelectedItems([]);
      } else {
        setSelectedItems(selectedUuids);
        onChange?.(selectedUuids);
      }
    },
    [onChange],
  );

  useEffect(() => {
    onChange?.('');
  }, [onChange]);

  return (
    <PageHeader className={styles.header} data-testid="appointments-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
      <div className={styles.rightJustifiedItems}>
        <DatePicker
          dateFormat="d-M-Y"
          datePickerType="single"
          onChange={([date]) => setSelectedDate(dayjs(date).startOf('day').format(omrsDateFormat))}
          value={dayjs(selectedDate).format('DD MMM YYYY')}>
          <DatePickerInput
            style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none', maxWidth: '10rem' }}
            id="appointment-date-picker"
            labelText=""
            placeholder="DD-MMM-YYYY"
            type="text"
          />
        </DatePicker>
        {typeof onChange === 'function' && (
          <MultiSelect
            id="serviceTypeMultiSelect"
            label={t('filterByServiceType', 'Filter by service type')}
            items={items.map((item) => ({ id: item.uuid, label: item.name }))}
            itemToString={(item) => (item ? item.label : '')}
            onChange={handleMultiSelectChange}
            initialSelectedItems={items.length > 0 ? [items[0]] : []}
            type="inline"
          />
        )}
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
