import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Pagination,
  Search,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableExpandRow,
  TableExpandHeader,
} from 'carbon-components-react';
import { useLayoutType, useConfig, usePagination, ConfigurableLink, ExtensionSlot } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ActiveVisit, useActiveVisits } from './active-visits.resource';
import styles from './active-visits.scss';
import dayjs from 'dayjs';

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<ActiveVisit>;
  currentPage: number;
}

const ActiveVisitsTable = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();

  const { data: activeVisits, isError, isLoading, isValidating } = useActiveVisits();

  const desktopView = layout === 'desktop';
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 50];
  const [currentPageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const [searchString, setSearchString] = useState('');

  const headerData = useMemo(
    () => [
      {
        id: 0,
        header: t('visitStartTime', 'Visit Time'),
        key: 'visitStartTime',
      },
      {
        id: 1,
        header: t('idNumber', 'ID Number'),
        key: 'idNumber',
      },
      {
        id: 2,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 3,
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: 4,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: 5,
        header: t('visitType', 'Visit Type'),
        key: 'visitType',
      },
    ],
    [t],
  );

  const rowData = activeVisits.map((visit) => ({
    ...visit,
    visitStartTime: formatDatetime(visit.visitStartTime),
  }));

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return rowData.filter((activeVisitRow) =>
        Object.keys(activeVisitRow).some((header) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${activeVisitRow[header]}`.toLowerCase().includes(search);
        }),
      );
    } else {
      return rowData;
    }
  }, [searchString, rowData]);

  const {
    goTo,
    results: paginatedActiveVisits,
    currentPage,
  }: PaginationData = usePagination(searchResults, currentPageSize);

  const handleSearch = useCallback((e) => setSearchString(e.target.value), []);

  useEffect(() => {
    if (currentPage !== 1) {
      goTo(1);
    }
  }, [searchString]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (activeVisits?.length) {
    return (
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <h4 className={styles.productiveHeading02}>{t('activeVisits', 'Active Visits')}</h4>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <DataTable rows={paginatedActiveVisits} headers={headerData} isSortable>
          {({ rows, headers, getHeaderProps, getTableProps, getBatchActionProps, getRowProps }) => (
            <TableContainer title="" className={styles.tableContainer}>
              <TableToolbar>
                <TableToolbarContent>
                  <Search
                    tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                    labelText=""
                    placeholder={t('filterTable', 'Filter table')}
                    onChange={handleSearch}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table className={styles.activeVisitsTable} {...getTableProps()} size={desktopView ? 'short' : 'normal'}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <React.Fragment key={index}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'name' ? (
                              <ConfigurableLink
                                to={`\${openmrsSpaBase}/patient/${paginatedActiveVisits?.[index]?.patientUuid}/chart/`}>
                                {cell.value}
                              </ConfigurableLink>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded && (
                        <TableRow className={styles.expandedActiveVisitRow}>
                          <th colSpan={headers.length + 2}>
                            <ExtensionSlot
                              className={styles.visitSummaryContainer}
                              extensionSlotName="visit-summary-slot"
                              state={{
                                visitUuid: paginatedActiveVisits[index]?.visitUuid,
                                patientUuid: paginatedActiveVisits[index]?.patientUuid,
                              }}
                            />
                          </th>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <p
                  style={{ height: desktopView ? '2rem' : '3rem', marginLeft: desktopView ? '2rem' : '3rem' }}
                  className={`${styles.emptyRow} ${styles.bodyLong01}`}>
                  {t('noVisitsFound', 'No visits found')}
                </p>
              )}
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={searchResults.length}
                className={styles.pagination}
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
      </div>
    );
  }
};

function formatDatetime(startDatetime) {
  const dateToday = dayjs();
  const today =
    dayjs(startDatetime).get('date') === dateToday.get('date') &&
    dayjs(startDatetime).get('month') === dateToday.get('month') &&
    dayjs(startDatetime).get('year') === dateToday.get('year');
  if (today) {
    return `Today - ${dayjs(startDatetime).format('HH:mm')}`;
  } else {
    return dayjs(startDatetime).format("DD MMM 'YY - HH:mm");
  }
}

export default ActiveVisitsTable;
