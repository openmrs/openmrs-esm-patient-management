import React, { useMemo } from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Layer,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { launchWorkspace, useLayoutType, ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useQueueRooms, useQueuesMutable } from '../queue-admin.resource';
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
  ];

  const queueTableRows = useMemo(() => {
    return (
      queues?.map((queue) => ({
        id: queue.uuid,
        name: queue.name || queue.display,
        description: queue.description || '--',
        service: queue.service?.display || '--',
        location: queue.location?.display || '--',
      })) || []
    );
  }, [queues]);

  const queueRoomTableRows = useMemo(() => {
    return (
      queueRooms?.map((room) => ({
        id: room.uuid,
        name: room.name || room.display,
        description: room.description || '--',
        queue: (room as any).queue?.display || '--',
      })) || []
    );
  }, [queueRooms]);

  const handleAddQueue = () => {
    launchWorkspace('service-queues-service-form');
  };

  const handleAddQueueRoom = () => {
    launchWorkspace('service-queues-room-workspace');
  };

  if (isLoadingQueues || isLoadingQueueRooms) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.section}>
          <h3>{t('queues', 'Queues')}</h3>
          <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />
        </div>
        <div className={styles.section}>
          <h3>{t('queueRooms', 'Queue Rooms')}</h3>
          <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />
        </div>
      </div>
    );
  }

  if (queuesError) {
    return (
      <div className={styles.adminPage}>
        <ErrorState error={queuesError} headerTitle={t('queues', 'Queues')} />
      </div>
    );
  }

  if (queueRoomsError) {
    return (
      <div className={styles.adminPage}>
        <ErrorState error={queueRoomsError} headerTitle={t('queueRooms', 'Queue Rooms')} />
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Queues Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>{t('queues', 'Queues')}</h3>
          <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={handleAddQueue}>
            {t('addQueue', 'Add Queue')}
          </Button>
        </div>
        <Layer>
          <DataTable rows={queueTableRows} headers={queueTableHeaders} isSortable size={responsiveSize} useZebraStyles>
            {({ rows, headers, getTableProps }) => (
              <TableContainer>
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
        </Layer>
      </div>

      {/* Queue Rooms Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>{t('queueRooms', 'Queue Rooms')}</h3>
          <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={handleAddQueueRoom}>
            {t('addQueueRoom', 'Add Queue Room')}
          </Button>
        </div>
        <Layer>
          <DataTable
            rows={queueRoomTableRows}
            headers={queueRoomTableHeaders}
            isSortable
            size={responsiveSize}
            useZebraStyles>
            {({ rows, headers, getTableProps }) => (
              <TableContainer>
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
        </Layer>
      </div>
    </div>
  );
};

export default AdminPage;
