import React, { useCallback, useMemo } from 'react';
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
    setCurrentPage(Math.max(1, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  const incrementPage = useCallback(() => {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  }, [currentPage, setCurrentPage, totalPages]);

  const pageButtons = useMemo(() => {
    const left = currentPage > 2 ? currentPage - 2 : 1;
    const right = totalPages - currentPage < 2 ? totalPages : currentPage + 2;
    const totalButtons = right - left + 1;
    return [...Array(totalButtons).keys()].map((indx) => (
      <Button
        key={indx}
        kind="ghost"
        onClick={() => setCurrentPage(indx + left)}
        className={`${styles.paginationButton} ${indx + left === currentPage && styles.activeButton}`}
        type="button">
        {indx + left}
      </Button>
    ));
  }, [currentPage, totalPages, setCurrentPage]);

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
      <div className={styles.pageNumbers}>{pageButtons}</div>
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
