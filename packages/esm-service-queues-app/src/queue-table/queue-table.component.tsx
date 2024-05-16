import React, { useEffect, useState, type FC } from 'react';
import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  Tile,
} from '@carbon/react';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type QueueEntry, type QueueTableColumn } from '../types';
import styles from './queue-table.scss';
import { useColumns } from './cells/columns.resource';

interface QueueTableProps {
  queueEntries: QueueEntry[];

  // the queueUuid and statusUuid are used to determine the columns
  // to display based on the tablesConfig configuration.
  // For a table displaying entries of a particular queue (across all statuses)
  // statusUuid param should be null.
  // For a table displaying entries from multiple quueues
  // both queueUuid and statusUuid params should be null
  queueUuid: string;
  statusUuid: string;

  // If provided, overides the columns specified by the tablesConfig configuration.
  queueTableColumnsOverride?: QueueTableColumn[];

  // if provided, a queue entry row can be expanded with the
  // provided component rendering more info about the row
  ExpandedRow?: FC<{ queueEntry: QueueEntry }>;

  // if provided, adds addition table toolbar elements
  tableFilter?: React.ReactNode[];
}

function QueueTable({
  queueEntries,
  queueUuid,
  statusUuid,
  queueTableColumnsOverride,
  ExpandedRow,
  tableFilter,
}: QueueTableProps) {
  const { t } = useTranslation();
  const [currentPageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 30, 40, 50];

  const { goTo, results: paginatedQueueEntries, currentPage } = usePagination(queueEntries, currentPageSize);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

  const columnsFromConfig = useColumns(queueUuid, statusUuid);
  const columns = queueTableColumnsOverride ?? columnsFromConfig ?? [];

  useEffect(() => {
    goTo(1);
  }, [queueEntries]);

  const rowsData =
    paginatedQueueEntries?.map((queueEntry) => {
      const row: Record<string, JSX.Element | string> = { id: queueEntry.uuid };
      columns.forEach(({ key, CellComponent }) => {
        row[key] = <CellComponent queueEntry={queueEntry} />;
      });
      return row;
    }) ?? [];

  if (columns.length == 0) {
    return <p>{t('noColumnsDefined', 'No table columns defined. Check Configuration')}</p>;
  }

  return (
    <DataTable
      data-floating-menu-container
      overflowMenuOnHover={isDesktop(layout)}
      rows={rowsData}
      headers={columns}
      size={responsiveSize}
      useZebraStyles>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getToolbarProps, getExpandHeaderProps }) => (
        <>
          <TableContainer className={styles.tableContainer}>
            {tableFilter && (
              <TableToolbar {...getToolbarProps()}>
                <TableToolbarContent className={styles.toolbarContent}>{tableFilter}</TableToolbarContent>
              </TableToolbar>
            )}
            <Table {...getTableProps()} className={styles.queueTable} useZebraStyles>
              <TableHead>
                <TableRow>
                  {ExpandedRow && <TableExpandHeader enableToggle {...getExpandHeaderProps()} />}
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
                      {ExpandedRow && row.isExpanded && (
                        <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 1}>
                          <ExpandedRow queueEntry={paginatedQueueEntries[i]} />
                        </TableExpandedRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
        </>
      )}
    </DataTable>
  );
}

export default QueueTable;
