import {
  DataTable,
  DataTableSkeleton,
  DefinitionTooltip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Layer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
} from '@carbon/react';

import { isDesktop, useLayoutType, usePagination, useSession } from '@openmrs/esm-framework';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatWaitTime, getOriginFromPathName, getTagColor, getTagType, trimVisitNumber } from '../helpers/functions';
import styles from './styles.scss';
import { usePatientQueuesList } from './patient-queues.resource';
import EmptyState from '../../empty-state/empty-state.component';
import AssignBedWorkSpace from '../../workspace/allocate-bed-workspace.component';
import AdmissionActionButton from './admission-action-button.component';
import { type patientDetailsProps } from '../types';
import ViewActionsMenu from './view-action-menu.component';

interface ActiveVisitsTableProps {
  status: string;
  setPatientCount?: (value: number) => void;
}

const ActivePatientsTable: React.FC<ActiveVisitsTableProps> = ({ status, setPatientCount }) => {
  const { t } = useTranslation();
  const session = useSession();
  const currentPathName: string = window.location.pathname;
  const fromPage: string = getOriginFromPathName(currentPathName);
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<patientDetailsProps>();

  const layout = useLayoutType();
  const { patientQueueEntries, isLoading } = usePatientQueuesList(session?.sessionLocation?.uuid, status);
  const handleBedAssigmentModal = useCallback(
    (entry) => {
      setSelectedPatientDetails({
        name: entry.name,
        patientUuid: entry.patientUuid,
        encounter: entry.encounter,
        locationUuid: session?.sessionLocation?.uuid,
        locationTo: entry.locationTo,
        locationFrom: entry.locationFrom,
        queueUuid: entry.uuid,
      });
      setShowOverlay(true);
    },
    [session?.sessionLocation?.uuid],
  );

  const renderActionButton = useCallback(
    (entry) => {
      const buttonTexts = {
        pending: 'Assign Bed',
        completed: 'Transfer',
      };
      const buttonText = buttonTexts[status] || 'Un-assign';

      return (
        <AdmissionActionButton
          entry={entry}
          handleBedAssigmentModal={handleBedAssigmentModal}
          buttonText={buttonText}
        />
      );
    },
    [handleBedAssigmentModal, status],
  );

  const { goTo, results: paginatedQueueEntries, currentPage } = usePagination(patientQueueEntries, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('visitNumber', 'Visit Number'),
        key: 'visitNumber',
      },
      {
        id: 1,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 2,
        header: t('locationFrom', 'Location From'),
        key: 'locationFrom',
      },
      {
        id: 3,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 4,
        header: t('priorityLevel', 'Priority Level'),
        key: 'priorityLevel',
      },
      {
        id: 5,
        header: t('waitTime', 'Wait time'),
        key: 'waitTime',
      },
      {
        id: 6,
        header: t('actions', 'Actions'),
        key: 'actions',
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return paginatedQueueEntries?.map((entry) => ({
      ...entry,
      visitNumber: {
        content: <span>{trimVisitNumber(entry.visitNumber)}</span>,
      },
      name: {
        content: entry.name,
      },
      locationFrom: {
        content: entry.locationFromName,
      },
      priority: {
        content: (
          <>
            {entry?.priorityComment ? (
              <DefinitionTooltip className={styles.tooltip} align="bottom-left" definition={entry.priorityComment}>
                <Tag
                  role="tooltip"
                  className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                  type={getTagType(entry.priority as string)}>
                  {entry.priority}
                </Tag>
              </DefinitionTooltip>
            ) : (
              <Tag
                className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                type={getTagType(entry.priority as string)}>
                {entry.priority}
              </Tag>
            )}
          </>
        ),
      },
      priorityLevel: {
        content: <span>{entry.priorityLevel}</span>,
      },
      waitTime: {
        content: (
          <Tag>
            <span className={styles.statusContainer} style={{ color: `${getTagColor(entry.waitTime)}` }}>
              {formatWaitTime(entry.waitTime, t)}
            </span>
          </Tag>
        ),
      },
      actions: {
        content: (
          <div className={styles.displayFlex}>
            {renderActionButton(entry)}
            {status === 'completed' && (
              <ViewActionsMenu to={`\${openmrsSpaBase}/patient/${entry?.patientUuid}/chart`} from={fromPage} />
            )}
          </div>
        ),
      },
      notes: {
        content: entry.comment,
      },
    }));
  }, [paginatedQueueEntries, status, t, renderActionButton, fromPage]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if ((!isLoading && patientQueueEntries && status === 'pending') || status === 'completed' || status === '') {
    setPatientCount(patientQueueEntries.length);
  }

  if (patientQueueEntries?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.headerBtnContainer}></div>

        <DataTable
          data-floating-menu-container
          headers={tableHeaders}
          overflowMenuOnHover={isDesktop(layout) ? true : false}
          rows={tableRows}
          isSortable
          size="xs"
          useZebraStyles>
          {({ rows, headers, getTableProps, getRowProps, onInputChange }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{
                  position: 'static',
                  height: '3rem',
                  overflow: 'visible',
                  backgroundColor: 'color',
                }}>
                <TableToolbarContent className={styles.toolbarContent}>
                  <Layer>
                    <TableToolbarSearch
                      className={styles.search}
                      onChange={onInputChange}
                      placeholder={t('searchThisList', 'Search this list')}
                      size="sm"
                    />
                  </Layer>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.activeVisitsTable}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader>{header.header?.content ?? header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <>
                        <TableExpandRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                        </TableExpandRow>

                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedLabQueueVisitRow} colSpan={headers.length + 2}>
                            <>
                              <span>{tableRows[index]?.comment ?? ''}</span>
                            </>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={patientQueueEntries?.length}
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
        {showOverlay && (
          <AssignBedWorkSpace
            patientDetails={selectedPatientDetails}
            closePanel={() => setShowOverlay(false)}
            queueStatus={status}
            headerTitle={t(
              'assignBedToPatient',
              `Assign Bed to Patient ${selectedPatientDetails.name} in the ${session?.sessionLocation?.display} Ward`,
            )}
          />
        )}
      </div>
    );
  }

  return <EmptyState msg={t('noQueueItems', 'No queue items to display')} helper="" />;
};
export default ActivePatientsTable;
