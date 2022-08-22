import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { CaretLeft, CaretRight } from '@carbon/react/icons';
import styles from './pagination.scss';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages?: number;
}
const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setCurrentPage, hasMore }) => {
  const { t } = useTranslation();
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
        type="button"
        kind="ghost"
        hasIconOnly
        iconDescription={t('previousPage', 'Previous page')}
        renderIcon={CaretLeft}
        onClick={decrementPage}
        disabled={currentPage == 1}
      />
      <div className={styles.pageNumbers}>
        {[...Array(totalPages).keys()].map((indx) => (
          <Button
            key={indx}
            kind="ghost"
            onClick={() => setCurrentPage(indx + 1)}
            className={`${styles.paginationButton} ${indx + 1 === currentPage && styles.activeButton}`}
            type="button">
            {indx + 1}
          </Button>
        ))}
      </div>
      <Button
        kind="ghost"
        hasIconOnly
        iconDescription={t('nextPage', 'Next page')}
        renderIcon={CaretRight}
        onClick={incrementPage}
        disabled={!hasMore && currentPage === totalPages}
        type="button"
      />
    </div>
  );
};

export default Pagination;
