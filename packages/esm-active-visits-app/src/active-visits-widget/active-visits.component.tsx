import React, { useMemo, useEffect, useState, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
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
  TableExpandedRow,
  SearchSkeleton,
  Tile,
  PaginationSkeleton,
} from '@carbon/react';
import {
  useLayoutType,
  isDesktop,
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 30, 40, 50];
  const { activeVisits, isLoading, isValidating, totalResults } = useActiveVisits(page - 1, pageSize);
  const [searchString, setSearchString] = useState('');

  const currentPathName = window.location.pathname;
  const fromPage = getOriginFromPathName(currentPathName);

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

  const handleSearch = useCallback((e) => setSearchString(e.target.value), []);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [searchString]);

  if (isLoading) {
    return (
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('activeVisits', 'Active Visits')}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <Search
          // tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
        <DataTableSkeleton rowCount={pageSize} showHeader={false} zebra columnCount={headerData?.length} />
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={page}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={totalResults}
          className={styles.pagination}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (newPage !== page) {
              setPage(newPage);
            }
          }}
          isLastPage
        />
      </div>
    );
  }

  if (activeVisits?.length) {
    return (
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('activeVisits', 'Active Visits')}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <Search
          // tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
        <DataTable
          rows={rowData}
          headers={headerData}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          useZebraStyles={activeVisits?.length > 1 ? true : false}>
          {({ rows, headers, getHeaderProps, getTableProps, getBatchActionProps, getRowProps }) => (
            <TableContainer className={styles.tableContainer}>
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
                      <TableExpandRow
                        {...getRowProps({ row })}
                        data-testid={`activeVisitRow${activeVisits?.[index]?.patientUuid}`}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id} data-testid={cell.id}>
                            {cell.info.header === 'name' ? (
                              <PatientNameLink
                                from={fromPage}
                                to={`\${openmrsSpaBase}/patient/${activeVisits?.[index]?.patientUuid}/chart/`}>
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
                                visitUuid: activeVisits[index]?.visitUuid,
                                patientUuid: activeVisits[index]?.patientUuid,
                              }}
                            />
                          </th>
                        </TableRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <p
                  style={{
                    height: isDesktop(layout) ? '2rem' : '3rem',
                    margin: '1rem 1.5rem',
                  }}
                  className={`${styles.emptyRow} ${styles.bodyLong01}`}>
                  {t('noVisitsFound', 'No matching visits found')}
                </p>
              )}
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={page}
                pageSize={pageSize}
                pageSizes={pageSizes}
                totalItems={totalResults}
                className={styles.pagination}
                size={isDesktop(layout) ? 'sm' : 'lg'}
                onChange={({ pageSize: newPageSize, page: newPage }) => {
                  if (newPageSize !== pageSize) {
                    setPageSize(newPageSize);
                  }
                  if (newPage !== page) {
                    setPage(newPage);
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
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('activeVisits', 'Active Visits')}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('noActiveVisitsForLocation', 'There are no active visits to display for this location.')}
          </p>
        </Tile>
      </Layer>
    </div>
  );
};

export default ActiveVisitsTable;
