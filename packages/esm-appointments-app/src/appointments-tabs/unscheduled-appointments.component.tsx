import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVisits } from '../hooks/useVisits';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  DataTableSkeleton,
} from '@carbon/react';
import { useAppointments } from './appointments-table.resource';
import { ConfigurableLink, formatDatetime, usePagination } from '@openmrs/esm-framework';
import { EmptyState } from '../empty-state/empty-state.component';
import isEmpty from 'lodash-es/isEmpty';

const UnscheduledAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading: isVisitLoading, visits } = useVisits();
  const { appointments, isLoading } = useAppointments();
  const patientUuids = appointments?.map(({ patientUuid }) => patientUuid);
  const filteredAppointments = useMemo(
    () => (!isVisitLoading ? visits?.filter((visit) => !patientUuids.includes(visit.patient.uuid)) : []),
    [isVisitLoading, patientUuids, visits],
  );
  const headerData = [
    {
      header: 'Name',
      key: 'name',
    },
    {
      header: 'Start date & time',
      key: 'startDateTime',
    },
    {
      header: 'Visit Type',
      key: 'visitType',
    },
    {
      header: 'Location',
      key: 'location',
    },
  ];

  const { results, currentPage, goTo } = usePagination(filteredAppointments, 10);

  const rowData = results?.map((visit) => ({
    id: `${visit.uuid}`,
    name: (
      <ConfigurableLink
        style={{ textDecoration: 'none' }}
        to={`\${openmrsSpaBase}/patient/${visit.patient.uuid}/chart`}>
        {visit.patient['person'].display}
      </ConfigurableLink>
    ),
    startDateTime: formatDatetime(new Date(visit.startDatetime), { mode: 'wide' }),
    visitType: visit.visitType.display,
    location: visit.location.display,
  }));

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(filteredAppointments.length / 10);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * 10;
    });
  }, [filteredAppointments]);

  if (isLoading && isVisitLoading) {
    return <DataTableSkeleton />;
  }

  if (isEmpty(filteredAppointments)) {
    return (
      <EmptyState
        headerTitle={t('unscheduledAppointments', 'Unscheduled appointments')}
        displayText={t('unscheduledAppointments_lower', 'unscheduled appointments')}
      />
    );
  }

  return (
    <div>
      <DataTable rows={rowData} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps, onInputChange }) => (
          <TableContainer title={`${t('UnscheduledAppointments', 'Unscheduled appointments')} ${rowData.length}`}>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch style={{ backgroundColor: '#f4f4f4' }} tabIndex={0} onChange={onInputChange} />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
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

      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={10}
        onChange={({ page }) => goTo(page)}
        pageSizes={pageSizes.length > 0 ? pageSizes : [10]}
        totalItems={appointments.length ?? 0}
      />
    </div>
  );
};

export default UnscheduledAppointments;
