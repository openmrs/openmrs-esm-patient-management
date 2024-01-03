import React, { useMemo, useEffect, useState, useCallback, type AnchorHTMLAttributes } from 'react';
import classNames from 'classnames';
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
  Tile,
  Button,
} from '@carbon/react';
import {
  useLayoutType,
  isDesktop,
  useConfig,
  usePagination,
  ExtensionSlot,
  formatDatetime,
  parseDate,
  showModal,
  ConfigurableLink,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './visits-missing-inqueue.scss';
import { getOriginFromPathName } from '../active-visits/active-visits-table.resource';
import { type ActiveVisit, useMissingQueueEntries } from './visits-missing-inqueue.resource';
import { Add } from '@carbon/react/icons';

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<ActiveVisit>;
  currentPage: number;
}

function AddMenu({ visitDetails }: { visitDetails: ActiveVisit }) {
  const { t } = useTranslation();
  const launchAddVisitToQueueModal = useCallback(() => {
    const dispose = showModal('add-visit-to-queue-modal', {
      closeModal: () => dispose(),
      visitDetails,
    });
  }, [visitDetails]);

  return (
    <Button
      kind="ghost"
      onClick={launchAddVisitToQueueModal}
      iconDescription={t('addisitToQueueTooltip', 'Add to queue')}
      renderIcon={(props) => <Add size={16} {...props} />}>
      {t('addToQueue', 'Add to queue')}
    </Button>
  );
}

const MissingQueueEntries = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  const { activeVisits, isLoading, visitsIsValidating } = useMissingQueueEntries();
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 30, 40, 50];
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
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('activeVisitsNotInQueue', 'Active visits not in queue')}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{visitsIsValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <DataTable
          rows={paginatedActiveVisits}
          headers={headerData}
          size={isDesktop(layout) ? 'xs' : 'md'}
          useZebraStyles={activeVisits?.length > 1 ? true : false}>
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
                              <ConfigurableLink
                                to={`\${openmrsSpaBase}/patient/${paginatedActiveVisits?.[index]?.patientUuid}/chart/`}>
                                {cell.value}
                              </ConfigurableLink>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="cds--table-column-menu">
                          <AddMenu visitDetails={paginatedActiveVisits?.[index]} />
                        </TableCell>
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableRow className={styles.expandedActiveVisitRow}>
                          <th colSpan={headers.length + 2}>
                            <ExtensionSlot
                              className={styles.visitSummaryContainer}
                              name="visit-summary-slot"
                              state={{
                                visitUuid: paginatedActiveVisits[index]?.visitUuid,
                                patientUuid: paginatedActiveVisits[index]?.patientUuid,
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
                  className={classNames(styles.emptyRow, styles.bodyLong01)}>
                  {t('noVisitsNotInQueueFound', 'No visits currently not in queue found')}
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
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('activeVisits', 'Active Visits')}</h4>
          </div>
          <p className={styles.content}>
            {t('noActiveVisitsForLocation', 'There are no active visits to display for this location.')}
          </p>
        </Tile>
      </Layer>
    </div>
  );
};

export default MissingQueueEntries;
