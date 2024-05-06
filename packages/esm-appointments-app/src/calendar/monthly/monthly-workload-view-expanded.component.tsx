import React, { useEffect, useRef } from 'react';
import { Popover, PopoverContent } from '@carbon/react';
import styles from './monthly-view-workload.scss';
import MonthlyWorkloadView, { type MonthlyWorkloadViewProps } from './monthly-workload-view.component';

interface MonthlyWorkloadViewExpandedProps extends MonthlyWorkloadViewProps {
  count: number;
}

const MonthlyWorkloadViewExpanded: React.FC<MonthlyWorkloadViewExpandedProps> = ({ count, events, dateTime }) => {
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
      <button className={styles.showMoreItems} onClick={() => setIsOpen((prev) => !prev)}>
        {count} more
      </button>
      <PopoverContent>
        <MonthlyWorkloadView events={events} dateTime={dateTime} showAllServices={true} />
      </PopoverContent>
    </Popover>
  );
};

export default MonthlyWorkloadViewExpanded;
