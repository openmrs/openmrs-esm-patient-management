import React, { useMemo } from 'react';
import Pagination from 'carbon-components-react/es/components/Pagination';
import styles from './pagination.component.scss';
import { useConfig } from '@openmrs/esm-framework';

interface ActiveVisitsPaginationProps {
  currentItems: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: any;
  pageUrl?: string;
}

const ActiveVisitsPagination: React.FC<ActiveVisitsPaginationProps> = ({
  totalItems,
  pageSize,
  onPageNumberChange,
  pageNumber,
}) => {
  const config = useConfig();
  const pageSizes = config?.activeVisits?.pageSizes;

  return (
    <>
      {totalItems > 0 && (
        <div className={styles.paginationContainer}>
          <Pagination
            backwardText=""
            forwardText=""
            className={styles.pagination}
            page={pageNumber}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={totalItems}
            onChange={onPageNumberChange}
          />
        </div>
      )}
    </>
  );
};

export default ActiveVisitsPagination;
