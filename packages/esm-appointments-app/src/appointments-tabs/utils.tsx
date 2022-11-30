import { useMemo } from 'react';
import { DataTableHeader } from '@carbon/react';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

export function getPageSizes<T>(data: Array<T>) {
  const numberOfPages = Math.ceil(data.length / 10);
  return [...Array(numberOfPages).keys()].map((x) => {
    return (x + 1) * 10;
  });
}
export const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
  return rowIds.filter((rowId) =>
    headers.some(({ key }) => {
      const cellId = getCellId(rowId, key);
      const filterableValue = cellsById[cellId].value;
      const filterTerm = inputValue.toLowerCase();

      if (typeof filterableValue === 'boolean') {
        return false;
      }
      if (filterableValue.hasOwnProperty('content')) {
        if (Array.isArray(filterableValue.content.props.children)) {
          return ('' + filterableValue.content.props.children[1]).toLowerCase().includes(filterTerm);
        }
        if (typeof filterableValue.content.props.children === 'object') {
          return ('' + filterableValue.content.props.children.props.children).toLowerCase().includes(filterTerm);
        }
        return ('' + filterableValue.content.props.children).toLowerCase().includes(filterTerm);
      }
      return ('' + filterableValue).toLowerCase().includes(filterTerm);
    }),
  );
};
