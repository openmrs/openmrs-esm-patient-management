import React from 'react';
import Pagination from 'carbon-components-react/es/components/Pagination';
import styles from './pagination.component.scss';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { usePaginationInfo } from './usePaginationInfo';

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
  pageUrl = '',
  currentItems,
}) => {
  const { t } = useTranslation();
  const { itemsDisplayed, pageSizes } = usePaginationInfo(pageSize, totalItems, pageNumber, currentItems);

  return (
    <>
      {totalItems > 0 && (
        <div className={styles.paginationContainer}>
          <Pagination
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
