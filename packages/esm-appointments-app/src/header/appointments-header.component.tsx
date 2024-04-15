import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DatePicker, DatePickerInput, Dropdown } from '@carbon/react';
import { Location } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import AppointmentsIllustration from './appointments-illustration.component';
import styles from './appointments-header.scss';
import SelectedDateContext from '../hooks/selectedDateContext';
import { omrsDateFormat } from '../constants';

interface AppointmentHeaderProps {
  title: string;
  appointmentServiceType?: string;
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, appointmentServiceType, onChange }) => {
  const { t } = useTranslation();
  const session = useSession();
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);
  const location = session?.sessionLocation?.display;
  const { serviceTypes } = useAppointmentServices();

  return (
    <div className={styles.header} data-testid="appointments-header">
      <div className={styles['left-justified-items']}>
        <AppointmentsIllustration />
        <div className={styles['page-labels']}>
          <p>{t('appointments', 'Appointments')}</p>
          <p className={styles['page-name']}>{title}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{location}</span>
          <span className={styles.middot}>&middot;</span>
          <DatePicker
            onChange={([date]) => setSelectedDate(dayjs(date).startOf('day').format(omrsDateFormat))}
            value={dayjs(selectedDate).format('DD MMM YYYY')}
            dateFormat="d-M-Y"
            datePickerType="single">
            <DatePickerInput
              style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none', maxWidth: '10rem' }}
              id="appointment-date-picker"
              placeholder="DD-MMM-YYYY"
              labelText=""
              type="text"
            />
          </DatePicker>
        </div>
        <div className={styles.dropdownContainer}>
          {typeof onChange === 'function' && (
            <Dropdown
              className={styles.dropdown}
              aria-label="Select service type"
              id="serviceDropdown"
              selectedItem={
                serviceTypes.find((service) => service.uuid === appointmentServiceType) || { name: 'All', uuid: '' }
              }
              items={[{ name: 'All', uuid: '' }, ...serviceTypes]}
              itemToString={(item) => (item ? item.name : '')}
              label={t('selectServiceType', 'Select service type')}
              type="inline"
              size="sm"
              direction="bottom"
              titleText={t('view', 'View')}
              onChange={({ selectedItem }) => onChange(selectedItem?.uuid)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsHeader;
