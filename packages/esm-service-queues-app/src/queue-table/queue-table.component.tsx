import React, { useState, useTransition } from 'react';
import styles from '../active-visits/active-visits-table.scss';
import { useSelectedQueueUuid } from '../helpers/helpers';
import {
  Button,
  DataTable,
  type DataTableHeader,
  DataTableSkeleton,
  DefinitionTooltip,
  Dropdown,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  Tile,
  Pagination,
} from '@carbon/react';
import { ExtensionSlot, isDesktop, useConfig, useLayoutType, usePagination, useSession } from '@openmrs/esm-framework';
import { useUnmappedVisitQueueEntries } from '../active-visits/active-visits-table.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import { Add, ColumnInsert } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../config-schema';

const scheduledAppointmentsPanelsSlot = 'scheduled-appointments-panels-slot';

export const QueueTable: React.FC = () => {
  const layout = useLayoutType();
  const currentUser = useSession();
  const { t } = useTranslation();
  const { queueTableColumns } = useConfig<ConfigObject>();
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const currentLocationUuid = currentUser?.sessionLocation?.uuid;
  const { visitQueueEntries, isLoading } = useUnmappedVisitQueueEntries(currentLocationUuid);

  const { goTo, results: paginatedQueueEntries, currentPage } = usePagination(visitQueueEntries, currentPageSize);

  const headers = queueTableColumns.map((column) => ({ header: t(column.headerI18nKey), key: column.id }));
  const rows =
    paginatedQueueEntries?.map((queueEntry) => {
      const row = {};
      queueTableColumns.forEach((conf) => {
        row[conf.id] = <ExtensionSlot name={conf.extensionSlotName} state={{ queueEntry }} />;
      });

      return row;
    }) ?? [];

  if (isLoading) {
    return <>Loading....</>;
  }
  function setShowOverlay(arg0: boolean) {
    throw new Error('Function not implemented.');
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</h4>
        </div>
      </div>
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getToolbarProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar
              {...getToolbarProps()}
              style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
              <TableToolbarContent className={styles.toolbarContent}>
                {/* <div className={styles.filterContainer}>
                    <Dropdown
                      id="serviceFilter"
                      titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
                      label={currentServiceName}
                      type="inline"
                      items={[{ display: `${t('all', 'All')}` }, ...services]}
                      itemToString={(item) => (item ? item.display : '')}
                      onChange={handleServiceChange}
                      size="sm"
                    />
                  </div>
                  <TableToolbarSearch
                    className={styles.search}
                    onChange={onInputChange}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  /> */}
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} className={styles.activeVisitsTable}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                  <p className={styles.separator}>{t('or', 'or')}</p>
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={(props) => <Add size={16} {...props} />}
                    onClick={() => setShowOverlay(true)}>
                    {t('addPatientToList', 'Add patient to list')}
                  </Button>
                </Tile>
              </div>
            ) : null}
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={visitQueueEntries?.length}
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
};
