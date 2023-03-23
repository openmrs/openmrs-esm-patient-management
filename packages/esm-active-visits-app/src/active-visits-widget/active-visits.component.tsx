import React, { useMemo, useState, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
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
  TableExpandRow,
  TableExpandHeader,
  TableExpandedRow,
  Tile,
} from '@carbon/react';
import {
  useLayoutType,
  isDesktop,
  useConfig,
  usePagination,
  ExtensionSlot,
  interpolateUrl,
  navigate,
  ErrorState,
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
  const [pageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 30, 40, 50];
  const { activeVisits, isLoading, totalResults, isValidating, isError } = useActiveVisits();
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

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return activeVisits.filter((activeVisitRow) =>
        Object.entries(activeVisitRow).some(([header, value]) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${value}`.toLowerCase().includes(search);
        }),
      );
    }

    return activeVisits;
  }, [searchString, activeVisits]);

  const { paginated, goTo, results, totalPages, currentPage } = usePagination(searchResults, pageSize);

  const handleSearch = useCallback(
    (e) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

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
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          disabled
        />
        <DataTableSkeleton
          rowCount={pageSize}
          showHeader={false}
          showToolbar={false}
          zebra
          columnCount={headerData?.length}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.activeVisitsContainer}>
        <Layer>
          <ErrorState error={isError} headerTitle={t('activeVisits', 'Active Visits')} />
        </Layer>
      </div>
    );
  }

  if (!activeVisits.length) {
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
  }

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
        rows={results}
        headers={headerData}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        useZebraStyles={activeVisits?.length > 1 ? true : false}>
        {({ rows, headers, getHeaderProps, getTableProps, getBatchActionProps, getRowProps, getExpandHeaderProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table className={styles.activeVisitsTable} {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
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
          </TableContainer>
        )}
      </DataTable>
      {searchResults.length === 0 && (
        <div className={styles.filterEmptyState}>
          <Layer level={0}>
            <Tile className={styles.filterEmptyStateTile}>
              <p className={styles.filterEmptyStateContent}>{t('noPatientsToDisplay', 'No patients to display')}</p>
              <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
            </Tile>
          </Layer>
        </div>
      )}
      {paginated && (
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={searchResults?.length}
          className={styles.pagination}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (newPage !== currentPage) {
              goTo(newPage);
            }
          }}
        />
      )}
    </div>
  );
};

export default ActiveVisitsTable;
