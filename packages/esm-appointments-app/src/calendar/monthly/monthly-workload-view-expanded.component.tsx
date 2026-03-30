import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import MonthlyWorkloadView, { type MonthlyWorkloadViewProps } from './monthly-workload-view.component';
import styles from './monthly-view-workload.scss';

interface MonthlyWorkloadViewExpandedProps extends MonthlyWorkloadViewProps {
  count: number;
}

const MonthlyWorkloadViewExpanded: React.FC<MonthlyWorkloadViewExpandedProps> = ({ count, events, dateTime }) => {
  /* Enable translation for dynamic UI text */
  const { t } = useTranslation();

  /* Control popover visibility state */
  const [isOpen, setIsOpen] = useState(false);

  /* Reference to popover container for outside click detection */
  const popoverRef = useRef(null);

  /* Close popover when clicking outside of it */
  const handleClickOutside = useCallback((event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  /* Attach and clean up global click listener */
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <Popover open={isOpen} align="top" ref={popoverRef}>
      <button
        className={styles.showMoreItems}
        onClick={(e) => {
          /* Prevent parent click handlers and toggle popover */
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}>
        {t('countMore', '{{count}} more', { count })}
      </button>
      <PopoverContent>
        {/* Expand to show all services for the selected date */}
        <MonthlyWorkloadView events={events} dateTime={dateTime} showAllServices={true} />
      </PopoverContent>
    </Popover>
  );
};

export default MonthlyWorkloadViewExpanded;
