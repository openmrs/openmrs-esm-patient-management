import React, { useCallback, useMemo } from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { EmptyCardIllustration, ErrorState, launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useQueueRooms, useQueuesMutable } from '../queue-admin.resource';
import type { Queue, QueueRoom } from '../../types';
import styles from './admin-page.scss';

const AdminPage = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const { queues, isLoading: isLoadingQueues, error: queuesError } = useQueuesMutable();
  const { queueRooms, isLoading: isLoadingQueueRooms, error: queueRoomsError } = useQueueRooms();

  const queueTableHeaders = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'description',
      header: t('description', 'Description'),
    },
    {
      key: 'service',
      header: t('service', 'Service'),
    },
    {
      key: 'location',
      header: t('location', 'Location'),
    },
    {
      key: 'actions',
      header: '',
    },
  ];

  const queueRoomTableHeaders = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'description',
      header: t('description', 'Description'),
    },
    {
      key: 'queue',
      header: t('queue', 'Queue'),
    },
    {
      key: 'actions',
      header: '',
    },
  ];

  const handleAddQueue = useCallback(() => {
    launchWorkspace2('service-queues-service-form');
  }, []);

  const handleEditQueue = useCallback((queue: Queue) => {
    launchWorkspace2('service-queues-service-form', { queue });
  }, []);

  const handleDeleteQueue = useCallback((queue: Queue) => {
    const dispose = showModal('delete-queue-modal', {
      queue,
      closeModal: () => dispose(),
    });
  }, []);

  const handleAddQueueRoom = useCallback(() => {
    launchWorkspace2('service-queues-room-workspace');
  }, []);

  const handleEditQueueRoom = useCallback((queueRoom: QueueRoom) => {
    launchWorkspace2('service-queues-room-workspace', { queueRoom });
  }, []);

  const handleDeleteQueueRoom = useCallback((queueRoom: QueueRoom) => {
    const dispose = showModal('delete-queue-room-modal', {
      queueRoom,
      closeModal: () => dispose(),
    });
  }, []);

  const queueTableRows = useMemo(() => {
    return (
      queues?.map((queue) => ({
        id: queue.uuid,
        name: queue.name || queue.display,
        description: queue.description || '--',
        service: queue.service?.display || '--',
        location: queue.location?.display || '--',
        actions: (
          <OverflowMenu flipped>
            <OverflowMenuItem
              className={styles.menuitem}
              itemText={t('edit', 'Edit')}
              onClick={() => handleEditQueue(queue)}
            />
            <OverflowMenuItem
              className={styles.menuitem}
              isDelete
              itemText={t('delete', 'Delete')}
              onClick={() => handleDeleteQueue(queue)}
            />
          </OverflowMenu>
        ),
      })) || []
    );
  }, [queues, t, handleEditQueue, handleDeleteQueue]);

  const queueRoomTableRows = useMemo(() => {
    return (
      queueRooms?.map((room) => ({
        id: room.uuid,
        name: room.name || room.display,
        description: room.description || '--',
        queue: room.queue?.display || '--',
        actions: (
          <OverflowMenu flipped>
            <OverflowMenuItem
              className={styles.menuitem}
              itemText={t('edit', 'Edit')}
              onClick={() => handleEditQueueRoom(room)}
            />
            <OverflowMenuItem
              className={styles.menuitem}
              isDelete
              itemText={t('delete', 'Delete')}
              onClick={() => handleDeleteQueueRoom(room)}
            />
          </OverflowMenu>
        ),
      })) || []
    );
  }, [queueRooms, t, handleEditQueueRoom, handleDeleteQueueRoom]);

  return (
    <div className={styles.adminPage}>
      {/* Queues Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>{t('queues', 'Queues')}</h3>
          {!queuesError && (
            <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={handleAddQueue}>
              {t('addQueue', 'Add queue')}
            </Button>
          )}
        </div>
        {isLoadingQueues ? (
          <DataTableSkeleton role="progressbar" compact={!isTablet} zebra columnCount={5} rowCount={3} />
        ) : queuesError ? (
          <ErrorState error={queuesError} headerTitle={t('queues', 'Queues')} />
        ) : (
          <Layer>
            <DataTable
              rows={queueTableRows}
              headers={queueTableHeaders}
              isSortable
              size={responsiveSize}
              useZebraStyles>
              {({ rows, headers, getTableProps }) => (
                <TableContainer className={styles.tableContainer}>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            {queueTableRows.length === 0 && (
              <Tile className={styles.emptyState}>
                <EmptyCardIllustration />
                <p>{t('noQueuesToDisplay', 'No queues to display')}</p>
              </Tile>
            )}
          </Layer>
        )}
      </div>

      {/* Queue Rooms Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>{t('queueRooms', 'Queue rooms')}</h3>
          {!queueRoomsError && (
            <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={handleAddQueueRoom}>
              {t('addQueueRoom', 'Add queue room')}
            </Button>
          )}
        </div>
        {isLoadingQueueRooms ? (
          <DataTableSkeleton role="progressbar" compact={!isTablet} zebra columnCount={4} rowCount={3} />
        ) : queueRoomsError ? (
          <ErrorState error={queueRoomsError} headerTitle={t('queueRooms', 'Queue rooms')} />
        ) : (
          <Layer>
            <DataTable
              rows={queueRoomTableRows}
              headers={queueRoomTableHeaders}
              isSortable
              size={responsiveSize}
              useZebraStyles>
              {({ rows, headers, getTableProps }) => (
                <TableContainer className={styles.tableContainer}>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            {queueRoomTableRows.length === 0 && (
              <Tile className={styles.emptyState}>
                <EmptyCardIllustration />
                <p className={styles.emptyStateContent}>{t('noQueueRoomsToDisplay', 'No queue rooms to display')}</p>
              </Tile>
            )}
          </Layer>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
