import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Location } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import AppointmentsIllustration from './appointments-illustration.component';
import styles from './appointments-header.scss';
import { DatePicker, DatePickerInput, Dropdown, Layer } from '@carbon/react';
import dayjs from 'dayjs';
import { changeStartDate, useAppointmentDate } from '../helpers';
import { useAppointmentServices } from '../hooks/useAppointmentService';

interface AppointmentHeaderProps {
  title: string;
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, onChange }) => {
  const { t } = useTranslation();
  const session = useSession();
  const datePickerRef = useRef(null);
  const { currentAppointmentDate } = useAppointmentDate();
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
            onChange={([date]) => changeStartDate(new Date(date))}
            ref={datePickerRef}
            dateFormat="d-M-Y"
            datePickerType="single">
            <DatePickerInput
              style={{ backgroundColor: 'transparent', border: 'none', maxWidth: '10rem' }}
              id="date-picker-calendar-id"
              placeholder="DD-MMM-YYYY"
              labelText=""
              type="text"
              value={dayjs(currentAppointmentDate).format('DD MMM YYYY')}
            />
          </DatePicker>
        </div>
        {typeof onChange === 'function' && (
          <div className={styles.dropdownContainer}>
            <Layer>
              <Dropdown
                ariaLabel="Dropdown"
                id="selectServicesDropDown"
                items={[{ name: 'All', uuid: '' }, ...serviceTypes]}
                itemToString={(item) => (item ? item.name : '')}
                label={t('selectServiceType', 'Select service type')}
                titleText={t('view', 'View')}
                type="inline"
                size="sm"
                direction="bottom"
                onChange={({ selectedItem }) => onChange(selectedItem?.uuid)}
              />
            </Layer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsHeader;
