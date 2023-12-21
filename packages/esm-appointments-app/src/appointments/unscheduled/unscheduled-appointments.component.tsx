import React, { useState } from 'react';
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
import { ConfigurableLink, useConfig, usePagination } from '@openmrs/esm-framework';
import { useUnscheduledAppointments } from '../../hooks/useUnscheduledAppointments';
import { downloadUnscheduledAppointments } from '../../helpers/excel';
import { EmptyState } from '../../empty-state/empty-state.component';
import { getPageSizes, useSearchResults } from '../utils';
import { type ConfigObject } from '../../config-schema';

const UnscheduledAppointments: React.FC = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(25);

  const [searchString, setSearchString] = useState('');
  const { data: unscheduledAppointments, isLoading, error } = useUnscheduledAppointments();
  const searchResults = useSearchResults(unscheduledAppointments, searchString);
  const { customPatientChartUrl } = useConfig<ConfigObject>();

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

  const { results, currentPage, goTo } = usePagination(searchResults, pageSize);
  const rowData = results?.map((visit) => ({
    id: `${visit.uuid}`,
    name: (
      <ConfigurableLink
        style={{ textDecoration: 'none' }}
        to={customPatientChartUrl}
        templateParams={{ patientUuid: visit.uuid }}>
        {visit.name}
      </ConfigurableLink>
    ),
    gender: visit.gender === 'F' ? 'Female' : 'Male',
    phoneNumber: visit.phoneNumber === '' ? '--' : visit.phoneNumber,
    identifier: visit?.identifier,
  }));

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (!unscheduledAppointments?.length) {
    return (
      <EmptyState
        displayText={t('unscheduledAppointments_lower', 'unscheduled appointments')}
        headerTitle={t('unscheduledAppointments', 'Unscheduled appointments')}
        scheduleType="Unscheduled"
      />
    );
  }

  return (
    <div>
      <DataTable rows={rowData} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer
            title={`${t('unscheduledAppointments', 'Unscheduled appointments')} ${unscheduledAppointments.length}`}
            description={`${t(`Total ${unscheduledAppointments.length ?? 0}`)}`}>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  style={{ backgroundColor: '#f4f4f4' }}
                  tabIndex={0}
                  onChange={(event) => setSearchString(event.target.value)}
                />
                <Button
                  size="lg"
                  kind="tertiary"
                  renderIcon={Download}
                  onClick={() => downloadUnscheduledAppointments(unscheduledAppointments)}>
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
        pageSize={pageSize}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
        pageSizes={getPageSizes(unscheduledAppointments, pageSize) ?? []}
        totalItems={unscheduledAppointments.length ?? 0}
      />
    </div>
  );
};

export default UnscheduledAppointments;
