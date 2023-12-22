import React, { useMemo, useState, useCallback, type MouseEvent, type AnchorHTMLAttributes } from 'react';
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
import { useTranslation } from 'react-i18next';
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
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useActiveVisits, getOriginFromPathName } from './active-visits.resource';
import styles from './active-visits.scss';

interface NameLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  from: string;
}

function ComputeExpensiveValue(t, config) {
  let headersIndex = 0;

  const headers = [
    {
      id: headersIndex++,
      header: t('visitStartTime', 'Visit Time'),
      key: 'visitStartTime',
    },
  ];

  config?.activeVisits?.identifiers?.map((identifier) => {
    headers.push({
      id: headersIndex++,
      header: t(identifier?.header?.key, identifier?.header?.default),
      key: identifier?.header?.key,
    });
  });

  if (!config?.activeVisit?.identifiers) {
    headers.push({
      id: headersIndex++,
      header: t('idNumber', 'ID Number'),
      key: 'idNumber',
    });
  }

  config?.activeVisits?.attributes?.map((attribute) => {
    headers.push({
      id: headersIndex++,
      header: t(attribute?.header?.key, attribute?.header?.default),
      key: attribute?.header?.key,
    });
  });

  headers.push(
    {
      id: headersIndex++,
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      id: headersIndex++,
      header: t('gender', 'Gender'),
      key: 'gender',
    },
    {
      id: headersIndex++,
      header: t('age', 'Age'),
      key: 'age',
    },
    {
      id: headersIndex++,
      header: t('visitType', 'Visit Type'),
      key: 'visitType',
    },
  );

  return headers;
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
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const { activeVisits, isLoading, isValidating, error } = useActiveVisits();
  const [searchString, setSearchString] = useState('');

  const currentPathName = window.location.pathname;
  const fromPage = getOriginFromPathName(currentPathName);

  const headerData = useMemo(() => ComputeExpensiveValue(t, config), [config, t]);

  const searchResults = useMemo(() => {
    if (activeVisits !== undefined && activeVisits.length > 0) {
      if (searchString && searchString.trim() !== '') {
        const search = searchString.toLowerCase();
        return activeVisits?.filter((activeVisitRow) =>
          Object.entries(activeVisitRow).some(([header, value]) => {
            if (header === 'patientUuid') {
              return false;
            }
            return `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }

    return activeVisits;
  }, [searchString, activeVisits]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

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

  if (error) {
    return (
      <div className={styles.activeVisitsContainer}>
        <Layer>
          <ErrorState error={error} headerTitle={t('activeVisits', 'Active Visits')} />
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
  } else {
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
        />
        <DataTable
          rows={results}
          headers={headerData}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          useZebraStyles={activeVisits?.length > 1 ? true : false}>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, getExpandHeaderProps }) => (
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
                  {rows.map((row, index) => {
                    const visit = activeVisits.find((visit) => visit.id === row.id);

                    if (!visit) {
                      return null;
                    }

                    const patientLink = `$\{openmrsSpaBase}/patient/${visit.patientUuid}/chart/Patient%20Summary`;

                    return (
                      <React.Fragment key={index}>
                        <TableExpandRow
                          {...getRowProps({ row })}
                          data-testid={`activeVisitRow${visit.patientUuid || 'unknown'}`}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id} data-testid={cell.id}>
                              {cell.info.header === 'name' && visit.patientUuid ? (
                                <PatientNameLink from={fromPage} to={patientLink}>
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
                                name="visit-summary-slot"
                                state={{
                                  visitUuid: visit.visitUuid,
                                  patientUuid: visit.patientUuid,
                                }}
                              />
                            </th>
                          </TableRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        {searchResults?.length === 0 && (
          <div className={styles.filterEmptyState}>
            <Layer level={0}>
              <Tile className={styles.filterEmptyStateTile}>
                <p className={styles.filterEmptyStateContent}>{t('noVisitsToDisplay', 'No visits to display')}</p>
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
  }
};

export default ActiveVisitsTable;
