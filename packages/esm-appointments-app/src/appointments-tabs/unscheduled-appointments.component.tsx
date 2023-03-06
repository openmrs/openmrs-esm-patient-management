import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Button,
} from '@carbon/react';
import { Download } from '@carbon/react/icons';
import { ConfigurableLink, usePagination } from '@openmrs/esm-framework';
import { EmptyState } from '../empty-state/empty-state.component';
import { useUnscheduledAppointments } from '../hooks/useUnscheduledAppointments';
import isEmpty from 'lodash-es/isEmpty';

const UnscheduledAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { data: unscheduledAppointments, isLoading, error } = useUnscheduledAppointments();
  const headerData = [
    {
      header: 'Patient Name',
      key: 'name',
    },
    {
      header: 'Identifier',
      key: 'identifier',
    },
    {
      header: 'Gender',
      key: 'gender',
    },
    {
      header: 'Phone Number',
      key: 'phoneNumber',
    },
  ];

  const { results, currentPage, goTo } = usePagination(unscheduledAppointments, 10);

  const rowData = results?.map((visit) => ({
    id: `${visit.uuid}`,
    name: (
      <ConfigurableLink style={{ textDecoration: 'none' }} to={`\${openmrsSpaBase}/patient/${visit.uuid}/chart`}>
        {visit.name}
      </ConfigurableLink>
    ),
    identifier: visit.identifier,
    gender: visit.gender === 'F' ? 'Female' : 'Male',
    phoneNumber: visit.phoneNumber === '' ? '--' : visit.phoneNumber,
  }));

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(unscheduledAppointments.length / 10);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * 10;
    });
  }, [unscheduledAppointments]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isEmpty(unscheduledAppointments)) {
    return (
      <EmptyState
        headerTitle={t('unscheduledAppointments_lower', 'unscheduled appointments')}
        displayText={t('unscheduledAppointments', 'Unscheduled appointments')}
      />
    );
  }

  return (
    <div>
      <DataTable rows={rowData} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps, onInputChange }) => (
          <TableContainer title={`${t('unscheduledAppointments', 'Unscheduled appointments')} ${rowData.length}`}>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch style={{ backgroundColor: '#f4f4f4' }} tabIndex={0} onChange={onInputChange} />
                <Button size="lg" kind="ghost" renderIcon={Download}>
                  {t('download', 'Download')}
                </Button>
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
        totalItems={unscheduledAppointments.length ?? 0}
      />
    </div>
  );
};

export default UnscheduledAppointments;
