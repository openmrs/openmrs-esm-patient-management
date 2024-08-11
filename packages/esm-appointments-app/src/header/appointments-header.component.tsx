import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DatePicker, DatePickerInput, Dropdown } from '@carbon/react';
import { PageHeader, PageHeaderContent, AppointmentsPictogram } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import SelectedDateContext from '../hooks/selectedDateContext';
import styles from './appointments-header.scss';

interface AppointmentHeaderProps {
  title: string;
  appointmentServiceType?: string;
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, appointmentServiceType, onChange }) => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);
  const { serviceTypes } = useAppointmentServices();

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
          <Dropdown
            aria-label={t('selectServiceType', 'Select service type')}
            className={styles.dropdown}
            direction="bottom"
            id="serviceDropdown"
            items={[{ name: 'All', uuid: '' }, ...serviceTypes]}
            itemToString={(item) => (item ? item.name : '')}
            label={t('selectServiceType', 'Select service type')}
            onChange={({ selectedItem }) => onChange(selectedItem?.uuid)}
            selectedItem={
              serviceTypes.find((service) => service.uuid === appointmentServiceType) || { name: 'All', uuid: '' }
            }
            size="sm"
            titleText={t('view', 'View')}
            type="inline"
          />
        )}
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
