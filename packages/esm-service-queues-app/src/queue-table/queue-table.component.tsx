import React, { useCallback, useEffect, useState, useTransition } from 'react';
import styles from '../active-visits/active-visits-table.scss';
import { updateSelectedServiceUuid, useSelectedServiceUuid } from '../helpers/helpers';
import {
  Button,
  DataTable,
  Dropdown,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  Tile,
  Pagination,
} from '@carbon/react';
import { ExtensionSlot, isDesktop, useConfig, useLayoutType, usePagination, useSession } from '@openmrs/esm-framework';
import { type VisitQueueEntry, useUnmappedVisitQueueEntries } from '../active-visits/active-visits-table.resource';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../config-schema';
import { useQueues } from '../helpers/useQueues';
import { TableToolbarSearch } from '@carbon/react';
import { type AllowedStatus, type QueueServiceInfo } from '../types';

export const QueueTableByStatus: React.FC = () => {
  const layout = useLayoutType();
  const currentUser = useSession();
  const { t } = useTranslation();

  const currentLocationUuid = currentUser?.sessionLocation?.uuid;
  const { visitQueueEntries: visitQueueEntriesByLocation, isLoading } =
    useUnmappedVisitQueueEntries(currentLocationUuid);
  const currentQueueUuid = useSelectedServiceUuid();
  const { queues } = useQueues();
  const allQueueAllowedStatuses = useCallback(() => {
    const allStatusFromAllQueues = queues.flatMap((q) => q.allowedStatuses);
    const statusByUuid = new Map<string, AllowedStatus>();
    for (const status of allStatusFromAllQueues) {
      statusByUuid.set(status.uuid, status);
    }
    return [...statusByUuid.values()];
  }, [queues]);

  const currentQueue = queues.find((q) => q.uuid === currentQueueUuid);
  const allowedStatuses = currentQueue?.allowedStatuses ?? allQueueAllowedStatuses();

  const [currentStatusUuid, setCurrentStatusUuid] = useState<string>(allowedStatuses?.[0]?.uuid);

  useEffect(() => {
    if (currentQueue) {
      const newQueueHasCurrentStatus = currentQueue?.allowedStatuses?.some((s) => s.uuid == currentStatusUuid);
      if (!newQueueHasCurrentStatus) {
        setCurrentStatusUuid(currentQueue.allowedStatuses?.[0]?.uuid);
      }
    }
  }, [currentQueue]);

  const currentStatusIndex = Math.max(0, allowedStatuses?.findIndex((s) => s.uuid == currentStatusUuid));

  const visitQueueEntriesByLocationAndQueueAndStatus = visitQueueEntriesByLocation
    ?.filter((entry) => !currentQueueUuid || entry.queueEntry.queue.uuid == currentQueueUuid)
    ?.filter((entry) => !currentStatusUuid || entry.queueEntry.status.uuid == currentStatusUuid);

  const noStatuses = !allowedStatuses?.length;
  if (isLoading) {
    return <>Loading....</>;
  } else if (noStatuses) {
    return <>No available statuses configured for queue</>;
  }

  const handleServiceChange = ({ selectedItem }: { selectedItem: QueueServiceInfo }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</h4>
        </div>
      </div>
      <div className={styles.filterContainer}>
        <Dropdown
          id="serviceFilter"
          titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
          label={currentQueue?.name ?? t('all', 'All')}
          type="inline"
          items={[{ display: `${t('all', 'All')}` }, ...queues]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleServiceChange}
          size="sm"
        />
      </div>
      <Tabs
        selectedIndex={currentStatusIndex}
        onChange={({ selectedIndex }) => setCurrentStatusUuid(allowedStatuses[selectedIndex].uuid)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label={t('queueStatus', 'Queue Status')} contained>
          {allowedStatuses?.map((s) => <Tab key={s?.uuid}>{s?.display}</Tab>)}
        </TabList>
        <TabPanels>
          {allowedStatuses?.map((s) => (
            <TabPanel key={s?.uuid} style={{ padding: 0 }}>
              <QueueTable visitQueueEntriesByLocationAndQueueAndStatus={visitQueueEntriesByLocationAndQueueAndStatus} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

interface QueueTableProps {
  visitQueueEntriesByLocationAndQueueAndStatus: VisitQueueEntry[];
}

function QueueTable({ visitQueueEntriesByLocationAndQueueAndStatus }: QueueTableProps) {
  const { t } = useTranslation();
  const { queueTableColumns } = useConfig<ConfigObject>();
  const [currentPageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 30, 40, 50];
  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(visitQueueEntriesByLocationAndQueueAndStatus, currentPageSize);

  const headers = queueTableColumns.map((column) => ({ header: t(column.headerI18nKey), key: column.headerI18nKey }));
  const rows =
    paginatedQueueEntries?.map((queueEntry) => {
      const row: Record<string, JSX.Element> = {};
      queueTableColumns.forEach((conf) => {
        row[conf.headerI18nKey] = <ExtensionSlot name={conf.extensionSlotName} state={{ queueEntry }} />;
      });

      return row;
    }) ?? [];

  return (
    <DataTable rows={rows} headers={headers}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getToolbarProps, onInputChange }) => (
        <TableContainer className={styles.tableContainer}>
          <TableToolbar
            {...getToolbarProps()}
            style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
            <TableToolbarContent className={styles.toolbarContent}>
              <TableToolbarSearch
                className={styles.search}
                onChange={onInputChange}
                placeholder={t('searchThisList', 'Search this list')}
                size="sm"
              />
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
                <Button kind="ghost" size="sm" renderIcon={(props) => <Add size={16} {...props} />} onClick={() => {}}>
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
            totalItems={visitQueueEntriesByLocationAndQueueAndStatus?.length}
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
  );
}
