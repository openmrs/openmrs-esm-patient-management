import React, { useMemo, useEffect, useState, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
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
  Tile,
} from 'carbon-components-react';
import {
  useLayoutType,
  useConfig,
  usePagination,
  ExtensionSlot,
  formatDatetime,
  parseDate,
  interpolateUrl,
  navigate,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { ActiveVisit, useActiveVisits, getOriginFromPathName } from './active-visits.resource';
import styles from './active-visits.scss';

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<ActiveVisit>;
  currentPage: number;
}
interface NameLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  from: string;
}

const PatientNameLink: React.FC<NameLinkProps> = ({ from, to, children }) => {
  const handleNameClick = (event: MouseEvent, to: string) => {
    event.preventDefault();
    navigate({ to });
    localStorage.setItem('fromPage', from);
  };
  return (
    <a onClick={(e) => handleNameClick(e, to)} href={interpolateUrl(to)}>
      {children}
    </a>
  );
};

const ActiveVisitsTable = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  const { activeVisits, isError, isLoading, isValidating } = useActiveVisits();
  const desktopView = layout === 'desktop';
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const [searchString, setSearchString] = useState('');

  const currentPathName: string = window.location.pathname;
  const fromPage: string = getOriginFromPathName(currentPathName);

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
    visitStartTime: formatDatetime(parseDate(visit.visitStartTime)),
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
  }, [searchString, currentPage, goTo]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (activeVisits?.length) {
    return (
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <div className={!desktopView ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('activeVisits', 'Active Visits')}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <DataTable
          rows={paginatedActiveVisits}
          headers={headerData}
          size={desktopView ? 'compact' : 'normal'}
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getBatchActionProps, getRowProps }) => (
            <TableContainer className={styles.tableContainer}>
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
              <Table className={styles.activeVisitsTable} {...getTableProps()}>
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
                              <PatientNameLink
                                from={fromPage}
                                to={`\${openmrsSpaBase}/patient/${paginatedActiveVisits?.[index]?.patientUuid}/chart/`}>
                                {cell.value}
                              </PatientNameLink>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
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
                      ) : (
                        <div />
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
  return (
    <div className={styles.activeVisitsContainer}>
      <Tile light className={styles.tile}>
        <div className={!desktopView ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('activeVisits', 'Active Visits')}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>
          {t('noActiveVisitsForLocation', 'There are no active visits to display for this location.')}
        </p>
      </Tile>
    </div>
  );
};

export default ActiveVisitsTable;
