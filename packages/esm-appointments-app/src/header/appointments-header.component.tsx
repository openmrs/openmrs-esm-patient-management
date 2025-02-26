import React, { useCallback, useContext, useMemo, useState } from 'react';
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
  appointmentServiceTypes?: string[];
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, appointmentServiceTypes, onChange }) => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);
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
