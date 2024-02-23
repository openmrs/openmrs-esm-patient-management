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
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './queue-table.scss';
import { type QueueEntry, type QueueTableColumn } from '../types';
import { TableExpandRow } from '@carbon/react';
import { TableExpandHeader } from '@carbon/react';
import { TableExpandedRow } from '@carbon/react';

interface QueueTableProps {
  queueEntries: QueueEntry[];
  queueTableColumns: QueueTableColumn[];

  // if provided, a queue entry row can be expanded with the
  // provided component rendering for info about the row
  ExpandedRow?: FC<{ queueEntry: QueueEntry }>;
}

function QueueTable({ queueEntries, queueTableColumns, ExpandedRow }: QueueTableProps) {
  const { t } = useTranslation();
  const [currentPageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 30, 40, 50];
  const { goTo, results: paginatedQueueEntries, currentPage } = usePagination(queueEntries, currentPageSize);

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
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getToolbarProps, onInputChange }) => (
        <TableContainer className={styles.tableContainer}>
          <TableToolbar {...getToolbarProps()}>
            <TableToolbarContent className={styles.toolbarContent}>
              <TableToolbarSearch
                className={styles.search}
                onChange={onInputChange}
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
                  <>
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
                  </>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={currentPageSize}
            pageSizes={pageSizes}
            totalItems={queueEntries?.length}
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
