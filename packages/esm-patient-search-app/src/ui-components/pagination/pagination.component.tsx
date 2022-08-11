import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { CaretLeft, CaretRight } from '@carbon/react/icons';
import styles from './pagination.scss';

interface PaginationProps {
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages?: number;
}
const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setCurrentPage, hasMore }) => {
  const decrementPage = useCallback(() => {
    setCurrentPage(Math.max(0, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  const incrementPage = useCallback(() => {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  }, [currentPage, setCurrentPage, totalPages]);

  if (totalPages <= 1) {
    return <></>;
  }

  return (
    <div className={styles.paginationBar}>
      <Button
        kind="ghost"
        hasIconOnly
        iconDescription=""
        renderIcon={<CaretLeft size={24} />}
        onClick={decrementPage}
        disabled={currentPage == 1}
      />
      <div className={styles.pageNumbers}>
        {[...Array(totalPages).keys()].map((indx) => (
          <Button
            key={indx}
            kind="ghost"
            onClick={() => setCurrentPage(indx + 1)}
            className={`${styles.paginationButton} ${indx + 1 === currentPage && styles.activeButton}`}>
            {indx + 1}
          </Button>
        ))}
      </div>
      <Button
        kind="ghost"
        hasIconOnly
        iconDescription=""
        renderIcon={<CaretRight size={24} />}
        onClick={incrementPage}
        disabled={!hasMore && currentPage === totalPages}
      />
    </div>
  );
};

export default Pagination;
