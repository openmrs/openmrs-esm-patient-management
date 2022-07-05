import React, { useCallback, useEffect, useState, useMemo } from 'react';
import styles from './pagination.scss';
import CaretLeft24 from '@carbon/icons-react/es/caret--left/24';
import CaretRight24 from '@carbon/icons-react/es/caret--right/24';
import { Button } from 'carbon-components-react';

interface PaginationProps {
  hasMore: boolean;
  currentPage: number;
  setPage: (page: number) => void;
  totalPages?: number;
}
const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setPage, hasMore }) => {
  const buttons = useMemo(() => {
    let buttonsArray = [];
    for (let i = 1; i <= totalPages; i++) {
      buttonsArray.push(
        <Button
          kind="ghost"
          onClick={() => setPage(i)}
          className={`${styles.paginationButton} ${i === currentPage && styles.activeButton}`}>
          {i}
        </Button>,
      );
    }
    return buttonsArray;
  }, [totalPages, currentPage, styles, setPage]);

  const decrementPage = useCallback(() => {
    setPage(Math.max(0, currentPage - 1));
  }, [currentPage, setPage, Math.max]);

  const incrementPage = useCallback(() => {
    setPage(Math.min(totalPages, currentPage + 1));
  }, [currentPage, setPage]);

  return (
    <div className={styles.paginationBar}>
      <Button
        kind="ghost"
        hasIconOnly
        iconDescription=""
        renderIcon={CaretLeft24}
        onClick={decrementPage}
        disabled={currentPage == 1}
      />
      <div className={styles.pageNumbers}>{buttons}</div>
      <Button
        kind="ghost"
        hasIconOnly
        iconDescription=""
        renderIcon={CaretRight24}
        onClick={incrementPage}
        disabled={!hasMore && currentPage === totalPages}
      />
    </div>
  );
};

export default Pagination;
