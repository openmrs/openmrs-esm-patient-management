import React, { useCallback, useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { 
  DatePicker, 
  DatePickerInput,
  MenuItemSelectable,
  MenuItemDivider,
  MenuItemGroup,
  MenuButton
} from '@carbon/react';
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
  
  const items = [{ name: 'All', uuid: '' }, ...serviceTypes];
  const [selectedItems, setSelectedItems] = useState([items[0]]);

  const handleMenuItemChange = useCallback((itemUuid: string) => {
    if (itemUuid === '') {
      setSelectedItems([items[0]]);
      onChange?.('');
    } else {
      let updatedSelectedItems;
      const isAlreadySelected = selectedItems.some((item) => item.uuid === itemUuid);
  
      if (isAlreadySelected) {
        updatedSelectedItems = selectedItems.filter((item) => item.uuid !== itemUuid);
      } else {
        updatedSelectedItems = selectedItems.filter((item) => item.uuid !== '').concat(
          items.find((item) => item.uuid === itemUuid)!
        );
      }

      if (updatedSelectedItems.length === 0) {
        updatedSelectedItems = [items[0]]; 
        onChange?.(''); 
      } else {
        const selectedUuids = updatedSelectedItems.map((item) => item.uuid);
        onChange?.(selectedUuids);
      }
  
      setSelectedItems(updatedSelectedItems);
    }
  }, [items, selectedItems, onChange, setSelectedItems]);
  
  

  useEffect(() => {
    onChange?.('');
  }, [onChange])

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
          <MenuButton
            label={t('filterByServiceType', 'Filter by service type')}
            kind="ghost"
            size="sm"
            menuAlignment="bottom-end"
            className={styles.menuButton}
          >
            <MenuItemGroup
              aria-label={t('filterByServiceType', 'Filter by service type')}
              id="serviceMenu"
            >
              {items.map((item, i) => (
                <React.Fragment key={item.uuid}>
                  <MenuItemSelectable
                    label={item.name}
                    defaultSelected={selectedItems.some((selectedItem) => selectedItem.uuid === item.uuid)}
                    onChange={() => handleMenuItemChange(item.uuid)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {i < items.length - 1 && <MenuItemDivider />}
                </React.Fragment>
              ))}
            </MenuItemGroup>
          </MenuButton>
        )}
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
