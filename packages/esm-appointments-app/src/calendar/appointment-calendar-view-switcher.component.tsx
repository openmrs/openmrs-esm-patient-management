import React from 'react';
import { Dropdown } from '@carbon/react';
import { useAppointmentsStore, setCalendarView } from '../store';

type CalendarView = 'monthly' | 'weekly' | 'daily';

const CalendarViewSwitcher = () => {
  const { calendarView } = useAppointmentsStore();

  const items: { id: CalendarView; label: string }[] = [
    { id: 'monthly', label: 'Month' },
    { id: 'weekly', label: 'Week' },
    { id: 'daily', label: 'Day' },
  ];

  return (
    <div style={{ maxWidth: '200px', marginBottom: '0.5rem' }}>
      <Dropdown
        id="calendar-view-dropdown"
        titleText=""
        label={items.find((item) => item.id === calendarView)?.label}
        items={items}
        selectedItem={items.find((item) => item.id === calendarView)}
        itemToString={(item) => (item ? item.label : '')}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            setCalendarView(selectedItem.id);
          }
        }}
      />
    </div>
  );
};

export default CalendarViewSwitcher;
