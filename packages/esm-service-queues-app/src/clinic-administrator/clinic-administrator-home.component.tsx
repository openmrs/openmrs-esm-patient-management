import React from 'react';
import {
  DataTable,
  DataTableSkeleton,
  Dropdown,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  ConfigurableLink,
  EmptyCardIllustration,
  ErrorState,
  formatDuration,
  isDesktop,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import { useClinicQueueMetrics, type QueueRollup } from '../hooks/useClinicQueueMetrics';
import {
  MetricsCard,
  MetricsCardBody,
  MetricsCardHeader,
  MetricsCardItem,
} from '../metrics/metrics-cards/metrics-card.component';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import QueueDuration from '../queue-table/components/queue-duration.component';
import {
  updateSelectedQueueLocationName,
  updateSelectedQueueLocationUuid,
  useServiceQueuesStore,
} from '../store/store';
import { type ConfigObject } from '../config-schema';
import styles from './clinic-administrator-home.scss';

const allLocations = 'all';

function formatMinutes(minutes: number) {
  return formatDuration(
    { hours: Math.floor(minutes / 60), minutes: minutes % 60 },
    { style: 'long', minutesDisplay: 'always' },
  );
}

const ClinicAdministratorHome: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { waitTimeThresholds } = useConfig<ConfigObject>();
  const { selectedQueueLocationUuid, selectedQueueLocationName } = useServiceQueuesStore();
  const { queueLocations } = useQueueLocations();
  const { rollups, totals, isLoading, error } = useClinicQueueMetrics(selectedQueueLocationUuid);

  const allLocationsLabel = t('allLocations', 'All locations');

  const handleLocationChange = ({ selectedItem }: { selectedItem: { id: string; name: string } }) => {
    const isAll = !selectedItem || selectedItem.id === allLocations;
    updateSelectedQueueLocationUuid(isAll ? null : selectedItem.id);
    updateSelectedQueueLocationName(isAll ? null : selectedItem.name);
  };

  const headers = [
    { key: 'queue', header: t('queue', 'Queue') },
    { key: 'location', header: t('location', 'Location') },
    { key: 'service', header: t('service', 'Service') },
    { key: 'waiting', header: t('waiting', 'Waiting') },
    { key: 'attending', header: t('attending', 'Attending') },
    { key: 'averageWait', header: t('averageWait', 'Average wait') },
    { key: 'longestWait', header: t('longestWait', 'Longest wait') },
  ];

  // Worst first, so the queue needing attention is the top row before anyone chooses a sort. Every
  // cell value is scalar so Carbon can sort it; the duration columns render off the minute counts.
  const sortedRollups = [...rollups].sort((a, b) => (b.longestWait?.minutes ?? -1) - (a.longestWait?.minutes ?? -1));
  const rows = sortedRollups.map((rollup) => ({
    id: rollup.queue.uuid,
    queue: rollup.queue.display,
    location: rollup.queue.location?.display ?? '--',
    service: rollup.queue.service?.display ?? '--',
    waiting: rollup.waiting,
    attending: rollup.attending,
    averageWait: rollup.averageWaitMinutes ?? -1,
    longestWait: rollup.longestWait?.minutes ?? -1,
  }));
  const rollupsByQueueUuid = new Map(sortedRollups.map((rollup) => [rollup.queue.uuid, rollup]));

  const totalsCards = [
    { key: 'waiting', title: t('waiting', 'Waiting'), label: t('patients', 'Patients'), value: totals.waiting },
    { key: 'attending', title: t('attending', 'Attending'), label: t('patients', 'Patients'), value: totals.attending },
    {
      key: 'averageWait',
      title: t('averageWait', 'Average wait'),
      label: t('minutes', 'Minutes'),
      value: totals.averageWaitMinutes,
    },
    {
      key: 'longestWait',
      title: t('longestWait', 'Longest wait'),
      label: totals.longestWait?.patientName ?? '',
      value: totals.longestWait && formatMinutes(totals.longestWait.minutes),
    },
  ];

  return (
    <div className={styles.container}>
      <PatientQueueHeader
        showFilters={false}
        title={selectedQueueLocationName ?? allLocationsLabel}
        actions={
          <div className={styles.headerActions}>
            <Dropdown
              aria-label={t('selectQueueLocation', 'Select a queue location')}
              className={styles.locationDropdown}
              id="clinicAdministratorLocationDropdown"
              items={[{ id: allLocations, name: allLocationsLabel }, ...queueLocations]}
              itemToString={(item: { name?: string } | null) => item?.name ?? ''}
              label={selectedQueueLocationName ?? allLocationsLabel}
              onChange={handleLocationChange}
              titleText={t('location', 'Location')}
              type="inline"
            />
            <ConfigurableLink to={`${window.getOpenmrsSpaBase()}home/service-queues/waiting-list`}>
              {t('waitingList', 'Waiting list')}
            </ConfigurableLink>
            <ConfigurableLink to={`${window.getOpenmrsSpaBase()}home/service-queues/admin`}>
              {t('queueConfiguration', 'Queue configuration')}
            </ConfigurableLink>
          </div>
        }
      />

      <div className={styles.metrics} data-testid="clinic-administrator-metrics">
        {totalsCards.map(({ key, title, label, value }) => (
          <MetricsCard key={key}>
            <MetricsCardHeader title={title} />
            <MetricsCardBody>
              <MetricsCardItem label={label} value={isLoading || value == null ? '--' : value} />
            </MetricsCardBody>
          </MetricsCard>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>{t('queues', 'Queues')}</h2>
        {isLoading ? (
          <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra columnCount={7} rowCount={4} />
        ) : error ? (
          <ErrorState error={error} headerTitle={t('queues', 'Queues')} />
        ) : rows.length === 0 ? (
          <Layer>
            <Tile className={styles.emptyState}>
              <EmptyCardIllustration />
              <p className={styles.emptyStateContent}>{t('noQueuesToDisplay', 'No queues to display')}</p>
            </Tile>
          </Layer>
        ) : (
          <Layer>
            <DataTable headers={headers} isSortable rows={rows} size={isDesktop(layout) ? 'sm' : 'lg'} useZebraStyles>
              {({ rows: dataRows, headers: dataHeaders, getHeaderProps, getTableProps }) => (
                <TableContainer className={styles.tableContainer}>
                  <Table {...getTableProps()} aria-label={t('queues', 'Queues')}>
                    <TableHead>
                      <TableRow>
                        {dataHeaders.map((header) => {
                          const { key, ...headerProps } = getHeaderProps({ header });
                          return (
                            <TableHeader key={key} {...headerProps}>
                              {header.header}
                            </TableHeader>
                          );
                        })}
                        <TableHeader aria-label={t('viewQueue', 'View queue')} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataRows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              <RollupCell
                                cell={cell}
                                longestWait={rollupsByQueueUuid.get(row.id)?.longestWait}
                                thresholds={waitTimeThresholds}
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <ConfigurableLink
                              to={`${window.getOpenmrsSpaBase()}home/service-queues/queue-table-by-status/${row.id}`}>
                              {t('view', 'View')}
                            </ConfigurableLink>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </Layer>
        )}
      </div>
    </div>
  );
};

interface RollupCellProps {
  cell: { info: { header: string }; value: unknown };
  longestWait: QueueRollup['longestWait'];
  thresholds: ConfigObject['waitTimeThresholds'];
}

function RollupCell({ cell, longestWait, thresholds }: RollupCellProps) {
  if (cell.info.header === 'averageWait') {
    const minutes = cell.value as number;
    return <>{minutes < 0 ? '--' : formatMinutes(minutes)}</>;
  }

  if (cell.info.header === 'longestWait') {
    return longestWait ? (
      <>
        <QueueDuration startedAt={longestWait.startedAt} thresholds={thresholds} />
        <span className={styles.longestWaitPatient}>{longestWait.patientName}</span>
      </>
    ) : (
      <>--</>
    );
  }

  return <>{cell.value as React.ReactNode}</>;
}

export default ClinicAdministratorHome;
