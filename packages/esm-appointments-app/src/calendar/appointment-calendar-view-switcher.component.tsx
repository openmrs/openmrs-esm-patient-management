import React, { useMemo } from 'react';
import { Dropdown } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppointmentsStore, setCalendarView } from '../store';
import { useSelectedDate } from '../hooks/useSelectedDate';

type CalendarView = 'monthly' | 'weekly' | 'daily';

const CalendarViewSwitcher: React.FC = () => {
  /* Enable translation for dropdown labels */
  const { t } = useTranslation();

  /* Router navigation for view changes */
  const navigate = useNavigate();

  /* Get current calendar view from global store */
  const { calendarView } = useAppointmentsStore();

  /* Get selected date to preserve context during navigation */
  const selectedDate = useSelectedDate();

  /* Define available calendar view options */
  const items = useMemo(
    () => [
      { id: 'monthly' as CalendarView, label: t('month', 'Month') },
      { id: 'weekly' as CalendarView, label: t('week', 'Week') },
      { id: 'daily' as CalendarView, label: t('day', 'Day') },
    ],
    [t],
  );

  /* Resolve currently selected dropdown item */
  const selectedItem = useMemo(() => items.find((item) => item.id === calendarView), [items, calendarView]);

  return (
    <div style={{ maxWidth: '200px', marginBottom: '0.5rem' }}>
      <Dropdown
        id="calendar-view-dropdown"
        titleText=""
        label={selectedItem?.label}
        items={items}
        selectedItem={selectedItem}
        itemToString={(item) => (item ? item.label : '')}
        onChange={({ selectedItem }) => {
          if (selectedItem) {
            /* Update global view state and sync URL */
            setCalendarView(selectedItem.id);
            navigate(`/calendar/${selectedDate}`);
          }
        }}
      />
    </div>
  );
};

export default CalendarViewSwitcher;
