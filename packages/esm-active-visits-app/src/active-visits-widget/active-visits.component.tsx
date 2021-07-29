import React, { useMemo, useEffect, useState, useCallback } from 'react';
import DataTable, {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableExpandRow,
  TableExpandHeader,
} from 'carbon-components-react/es/components/DataTable';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import Pagination from 'carbon-components-react/es/components/Pagination';
import Search from 'carbon-components-react/es/components/Search';
import { useLayoutType, useConfig, usePagination, ConfigurableLink, ExtensionSlot } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ActiveVisitRow, fetchActiveVisits } from './active-visits.resource';
import styles from './active-visits.scss';
import dayjs from 'dayjs';

function formatDatetime(startDatetime) {
  const todayDate = dayjs();
  const today =
    dayjs(startDatetime).get('date') === todayDate.get('date') &&
    dayjs(startDatetime).get('month') === todayDate.get('month') &&
    dayjs(startDatetime).get('year') === todayDate.get('year');
  if (today) {
    return `Today - ${dayjs(startDatetime).format('HH:mm')}`;
  } else {
    return dayjs(startDatetime).format("DD MMM 'YY - HH:mm");
  }
}

const ActiveVisitsTable = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const desktopView = layout === 'desktop';
  const config = useConfig();
  const [currentPageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 50];
  const [loading, setLoading] = useState(true);
  const [activeVisits, setActiveVisits] = useState<ActiveVisitRow[]>([]);
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
        header: t('IDNumber', 'ID Number'),
        key: 'IDNumber',
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

  useEffect(() => {
    const abortController = new AbortController();
    fetchActiveVisits(abortController).then(({ data }) => {
      const rowData = data.results.map((visit, ind) => ({
        id: `${ind}`,
        visitStartTime: formatDatetime(visit.startDatetime),
        IDNumber: visit?.patient?.identifiers[0]?.identifier,
        name: visit?.patient?.person?.display,
        gender: visit?.patient?.person?.gender,
        age: visit?.patient?.person?.age,
        visitType: visit?.visitType?.display,
        patientUuid: visit?.patient?.uuid,
        visitUuid: visit?.uuid,
      }));
      setActiveVisits(rowData);
      setLoading(false);
    });

    return () => abortController.abort();
  }, []);

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return activeVisits.filter((activeVisitRow) =>
        Object.keys(activeVisitRow).some((header) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${activeVisitRow[header]}`.toLowerCase().includes(search);
        }),
      );
    } else {
      return activeVisits;
    }
  }, [searchString, activeVisits]);

  const { goTo, results, currentPage } = usePagination(searchResults, currentPageSize);
  const handleSearch = useCallback((e) => setSearchString(e.target.value), []);

  useEffect(() => {
    if (currentPage !== 1) {
      goTo(1);
    }
  }, [searchString]);

  return !loading ? (
    <div className={styles.activeVisitsContainer}>
      <div className={styles.activeVisitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>{t('activeVisits', 'Active Visits')}</h4>
      </div>
      <DataTable rows={results} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps, getBatchActionProps, getRowProps }) => (
          <TableContainer title="" className={styles.tableContainer}>
            <TableToolbar>
              <TableToolbarContent>
                <Search
                  tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                  labelText=""
                  placeholder="Filter table"
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
                {rows.map((row, ind) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.info.header === 'name' ? (
                            <ConfigurableLink to={`\${openmrsSpaBase}/patient/${results[ind]?.patientUuid}/chart/`}>
                              {cell.value}
                            </ConfigurableLink>
                          ) : (
                            cell.value
                          )}
                        </TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded && (
                      <TableRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 1}>
                        <th colSpan={headers.length + 2}>
                          <ExtensionSlot
                            className={styles.visitSummaryContainer}
                            extensionSlotName="visit-summary-slot"
                            state={{
                              visitUuid: results[ind]?.visitUuid,
                              patientUuid: results[ind]?.patientUuid,
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
              forwardText=""
              backwardText=""
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
  ) : (
    <DataTableSkeleton />
  );
};

export default ActiveVisitsTable;
