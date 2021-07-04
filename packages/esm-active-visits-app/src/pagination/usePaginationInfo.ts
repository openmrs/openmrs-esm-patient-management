import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';

export function usePaginationInfo(pageSize: number, totalItems: number, pageNumber: number, currentItems: number) {
  const { t } = useTranslation();

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(totalItems / pageSize);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * pageSize;
    });
  }, [pageSize, totalItems]);

  const numberOfItemsDisplayed = useMemo(() => {
    if (pageSize > totalItems) {
      return `${totalItems} / ${totalItems}`;
    } else if (pageSize * pageNumber > totalItems) {
      return `${pageSize * (pageNumber - 1) + currentItems} / ${totalItems}`;
    } else {
      return `${pageSize * pageNumber} / ${totalItems}`;
    }
  }, [pageSize, totalItems, pageNumber, currentItems]);

  return {
    pageSizes,
    itemsDisplayed: `${numberOfItemsDisplayed} ${t('items', ' items')}`,
  };
}
