import React, { useMemo } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, ErrorState, isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import EmptyState from '../empty-state/empty-state.component';
import QueueDuration from '../queue-table/components/queue-duration.component';
import { QueueMetricTile } from '../queue-table/queue-table-metrics-card.component';
import { useServiceQueuesStore } from '../store/store';
import { useClinicQueueMetrics, type QueueRollup } from '../hooks/useClinicQueueMetrics';
import { formatWaitTimeInMinutes } from '../wait-time';
import { spaBasePath } from '../constants';
import { type ConfigObject } from '../config-schema';
import metricsStyles from '../queue-table/queue-table-metrics.scss';
import queueTableStyles from '../queue-table/queue-table.scss';
import styles from './clinic-overview.scss';

interface RollupColumn {
  key: string;
  header: string;
  /** Only for cells that need more than their raw value, such as a link or a live-ticking duration. */
  renderCell?: (rollup: QueueRollup) => React.ReactNode;
}

/** The clinic-wide monitoring tab: totals for the whole clinic, then a row per queue. */
const ClinicOverview: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { waitTimeThresholds } = useConfig<ConfigObject>();
  const { selectedQueueLocationUuid, selectedServiceUuid } = useServiceQueuesStore();
  const { rollups, totals, isLoading, error } = useClinicQueueMetrics(selectedQueueLocationUuid, selectedServiceUuid);

  const columns: Array<RollupColumn> = useMemo(
    () => [
      {
        key: 'queue',
        header: t('queue', 'Queue'),
        renderCell: ({ queue }) => (
          <ConfigurableLink to={`${spaBasePath}/service-queues/queue-table-by-status/${queue.uuid}`}>
            {queue.display}
          </ConfigurableLink>
        ),
      },
      { key: 'location', header: t('location', 'Location') },
      { key: 'service', header: t('service', 'Service') },
      { key: 'waiting', header: t('waiting', 'Waiting') },
      { key: 'attending', header: t('attending', 'Attending') },
      {
        key: 'averageWait',
        header: t('averageWait', 'Average wait'),
        renderCell: ({ averageWaitMinutes }) =>
          averageWaitMinutes == null ? '--' : formatWaitTimeInMinutes(averageWaitMinutes),
      },
      {
        key: 'longestWait',
        header: t('longestWait', 'Longest wait'),
        renderCell: ({ longestWait }) =>
          longestWait ? (
            <>
              <QueueDuration startedAt={longestWait.startedAt} thresholds={waitTimeThresholds} />
              <span className={styles.longestWaitPatient}>{longestWait.patientName}</span>
            </>
          ) : (
            '--'
          ),
      },
    ],
    [t, waitTimeThresholds],
  );

  const rows = useMemo(
    () =>
      // Worst first, so the queue needing attention is the top row before anyone chooses a sort.
      [...rollups]
        .sort((a, b) => (b.longestWait?.minutes ?? -Infinity) - (a.longestWait?.minutes ?? -Infinity))
        .map((rollup) => ({
          id: rollup.queue.uuid,
          queue: rollup.queue.display,
          location: rollup.queue.location?.display ?? '--',
          service: rollup.queue.service?.display ?? '--',
          waiting: rollup.waiting,
          attending: rollup.attending,
          averageWait: rollup.averageWaitMinutes,
          longestWait: rollup.longestWait?.minutes ?? null,
        })),
    [rollups],
  );

  // Carbon rebuilds its rows from the headers alone, so the roll-up cannot ride along on the row.
  const rollupsByQueueUuid = useMemo(() => new Map(rollups.map((rollup) => [rollup.queue.uuid, rollup])), [rollups]);

  const totalsCards = [
    { key: 'waiting', title: t('waiting', 'Waiting'), value: totals.waiting },
    { key: 'attending', title: t('attending', 'Attending'), value: totals.attending },
    {
      key: 'averageWait',
      title: t('averageWait', 'Average wait'),
      value: totals.averageWaitMinutes == null ? null : formatWaitTimeInMinutes(totals.averageWaitMinutes),
    },
    {
      key: 'longestWait',
      title: t('longestWait', 'Longest wait'),
      // Ticks, unlike `averageWait` above: that is an average the server computed over entries whose
      // start times are not in the response, so it can only ever be a snapshot.
      value:
        totals.longestWait == null ? null : (
          <QueueDuration startedAt={totals.longestWait.startedAt} thresholds={waitTimeThresholds} />
        ),
    },
  ];

  return (
    <>
      <div className={metricsStyles.metricsBorder} data-testid="clinic-administrator-metrics">
        {totalsCards.map(({ key, title, value }) => (
          <QueueMetricTile key={key} headerLabel={title} value={isLoading || error || value == null ? '--' : value} />
        ))}
      </div>

      <div className={queueTableStyles.defaultQueueTable}>
        <Layer className={queueTableStyles.tableSection}>
          {/* The error card titles itself, so the section header would say "Queues" twice. */}
          {!error && (
            <div className={queueTableStyles.headerContainer}>
              <div className={isDesktop(layout) ? queueTableStyles.desktopHeading : queueTableStyles.tabletHeading}>
                <h2>{t('queues', 'Queues')}</h2>
              </div>
            </div>
          )}

          {isLoading ? (
            <DataTableSkeleton
              className={styles.tableSkeleton}
              role="progressbar"
              compact={isDesktop(layout)}
              columnCount={7}
              rowCount={4}
              showHeader={false}
              showToolbar={false}
              zebra
            />
          ) : error ? (
            <div className={styles.errorState}>
              <ErrorState error={error} headerTitle={t('queues', 'Queues')} />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState className={styles.emptyState} displayText={t('noQueuesToDisplay', 'No queues to display')} />
          ) : (
            <DataTable
              headers={columns}
              isSortable
              rows={rows}
              size={isDesktop(layout) ? 'sm' : 'lg'}
              sortRow={sortRow}
              useZebraStyles>
              {({ rows: dataRows, headers: dataHeaders, getHeaderProps, getTableProps }) => (
                <TableContainer className={queueTableStyles.tableContainer}>
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataRows.map((row) => {
                        const rollup = rollupsByQueueUuid.get(row.id);
                        return (
                          <TableRow key={row.id}>
                            {row.cells.map((cell) => {
                              const renderCell = columns.find(({ key }) => key === cell.info.header)?.renderCell;
                              return (
                                <TableCell key={cell.id}>
                                  {renderCell && rollup ? renderCell(rollup) : (cell.value as React.ReactNode)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          )}
        </Layer>
      </div>
    </>
  );
};

interface SortRowOptions {
  sortDirection: 'ASC' | 'DESC' | 'NONE';
  sortStates: { ASC: string; DESC: string; NONE: string };
  locale: string;
}

// Sorts numbers numerically rather than as strings, and keeps queues with no wait to compare at the
// bottom in either direction rather than ranking them as though they had waited the least.
function sortRow(cellA: unknown, cellB: unknown, { sortDirection, sortStates, locale }: SortRowOptions) {
  if (cellA == null || cellB == null) {
    return cellA == null ? (cellB == null ? 0 : 1) : -1;
  }

  const direction = sortDirection === sortStates.DESC ? -1 : 1;

  if (typeof cellA === 'number' && typeof cellB === 'number') {
    return direction * (cellA - cellB);
  }

  return direction * String(cellA).localeCompare(String(cellB), locale);
}

export default ClinicOverview;
