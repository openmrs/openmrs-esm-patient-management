import React, { useEffect, useRef } from 'react';
import { Popover, PopoverContent } from '@carbon/react';
import styles from './monthly-view-workload.scss';
import MonthlyWorkloadView, { type MonthlyWorkloadViewProps } from './monthly-workload-view.component';
import { useTranslation } from 'react-i18next';

interface MonthlyWorkloadViewExpandedProps extends MonthlyWorkloadViewProps {
  count: number;
}

const MonthlyWorkloadViewExpanded: React.FC<MonthlyWorkloadViewExpandedProps> = ({ count, events, dateTime }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = useRef(null);

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Popover open={isOpen} align="top" ref={popoverRef}>
      <button
        className={styles.showMoreItems}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}>
        {t('countMore', '{{count}} more', { count })}
      </button>
      <PopoverContent>
        <MonthlyWorkloadView events={events} dateTime={dateTime} showAllServices={true} />
      </PopoverContent>
    </Popover>
  );
};

export default MonthlyWorkloadViewExpanded;
