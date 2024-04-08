import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import { usePagination } from '@openmrs/esm-framework';
import React, { type FC, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './queue-table.scss';
import { type QueueEntry, type QueueTableColumn } from '../types';
import { TableExpandRow } from '@carbon/react';
import { TableExpandHeader } from '@carbon/react';
import { TableExpandedRow } from '@carbon/react';
import { Tile } from '@carbon/react';

interface DataTableHeader {
  key: string;
  header: React.ReactNode;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: Record<string, any>;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface QueueTableProps {
  queueEntries: QueueEntry[];
  queueTableColumns: QueueTableColumn[];

  // if provided, a queue entry row can be expanded with the
  // provided component rendering more info about the row
  ExpandedRow?: FC<{ queueEntry: QueueEntry }>;

  // if provided, adds addition table toolbar elements
  tableFilter?: React.ReactNode;
}

function QueueTable({ queueEntries, queueTableColumns, ExpandedRow, tableFilter }: QueueTableProps) {
  const { t } = useTranslation();
  const [currentPageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 30, 40, 50];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries.filter((queueEntry) => {
      return queueTableColumns.some((column) => {
        const columnSearchTerm = column.getFilterableValue?.(queueEntry)?.toLocaleLowerCase();
        return columnSearchTerm?.includes(searchTermLowercase);
      });
    });
  }, [queueEntries, searchTerm]);

  const { goTo, results: paginatedQueueEntries, currentPage } = usePagination(filteredQueueEntries, currentPageSize);

  useEffect(() => {
    goTo(1);
  }, [searchTerm]);

  const headers = queueTableColumns.map((column) => ({ header: t(column.headerI18nKey), key: column.headerI18nKey }));
  const rowsData =
    paginatedQueueEntries?.map((queueEntry) => {
      const row: Record<string, JSX.Element | string> = { id: queueEntry.uuid };
      queueTableColumns.forEach(({ headerI18nKey, CellComponent }) => {
        row[headerI18nKey] = <CellComponent queueEntry={queueEntry} />;
      });
      return row;
    }) ?? [];

  return (
    <DataTable rows={rowsData} headers={headers} useZebraStyles>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getToolbarProps }) => (
        <TableContainer className={styles.tableContainer}>
          <TableToolbar {...getToolbarProps()}>
            <TableToolbarContent className={styles.toolbarContent}>
              {tableFilter}
              <TableToolbarSearch
                className={styles.search}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchThisList', 'Search this list')}
                size="sm"
              />
            </TableToolbarContent>
          </TableToolbar>
          <Table {...getTableProps()} className={styles.queueTable} useZebraStyles>
            <TableHead>
              <TableRow>
                {ExpandedRow && <TableExpandHeader />}
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => {
                const Row = ExpandedRow ? TableExpandRow : TableRow;

                return (
                  <React.Fragment key={row.id}>
                    <Row {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </Row>
                    {ExpandedRow && (
                      <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 1}>
                        <ExpandedRow queueEntry={paginatedQueueEntries[i]} />
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                  <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                </div>
              </Tile>
            </div>
          )}
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={currentPageSize}
            pageSizes={pageSizes}
            totalItems={filteredQueueEntries?.length}
            onChange={({ pageSize, page }) => {
              if (pageSize !== currentPageSize) {
                setPageSize(pageSize);
              }
              if (page !== currentPage) {
                goTo(page);
              }
            }}
          />
        </TableContainer>
      )}
    </DataTable>
  );
}

export default QueueTable;
