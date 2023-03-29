import React, { CSSProperties } from 'react';
import {
  DataTable,
  DataTableCustomRenderProps,
  DataTableHeader,
  DataTableSkeleton,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Star, StarFilled } from '@carbon/react/icons';
import { useSession, ConfigurableLink, useLayoutType, isDesktop, ErrorState } from '@openmrs/esm-framework';
import styles from './patient-list-list.scss';
import { PatientList } from '../api/types';
import { updatePatientList } from '../api/api-remote';
import { PatientListEmptyState } from './empty-state/empty-state.component';
import { useTranslation } from 'react-i18next';

interface PatientListTableProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  loading?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  refetch(): void;
  listType: string;
  handleCreate?: () => void;
  error: Error;
  pageSize: number;
}

const PatientListTable: React.FC<PatientListTableProps> = ({
  style,
  patientLists = [],
  loading = false,
  headers,
  refetch,
  listType,
  handleCreate,
  error,
  pageSize,
}) => {
  const { t } = useTranslation();
  const userId = useSession()?.user.uuid;
  const layout = useLayoutType();

  const handleToggleStarred = async (patientListId: string, isStarred: boolean) => {
    if (userId) {
      await updatePatientList(patientListId, { isStarred });
      refetch();
    }
  };

  if (loading) {
    return (
      <DataTableSkeleton
        style={{ ...style, backgroundColor: 'transparent', padding: '0rem' }}
        showToolbar={false}
        showHeader={false}
        rowCount={pageSize}
        columnCount={headers.length}
        zebra
        compact={isDesktop(layout)}
      />
    );
  }

  if (error) {
    <ErrorState error={error} headerTitle={t('patientLists', 'Patient Lists')} />;
  }

  if (!patientLists?.length) {
    return <PatientListEmptyState launchForm={handleCreate} listType={listType} />;
  }

  return (
    <DataTable rows={patientLists} headers={headers} size={isDesktop(layout) ? 'sm' : 'lg'}>
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getTableProps,
        getTableContainerProps,
      }: DataTableCustomRenderProps) => (
        <TableContainer style={{ ...style, backgroundColor: 'transparent' }} {...getTableContainerProps()}>
          <Table {...getTableProps()} isSortable useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    className={isDesktop(layout) ? styles.desktopHeader : styles.tabletHeader}
                    key={header.key}
                    {...getHeaderProps({ header })}
                    isSortable>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className={styles.tableBody}>
              {rows.map((row, index) => (
                <TableRow
                  className={isDesktop(layout) ? styles.desktopRow : styles.tabletRow}
                  key={row.id}
                  {...getRowProps({ row })}>
                  {row.cells.map((cell) => {
                    switch (cell.info.header) {
                      case 'display':
                        return (
                          <TableCell className={styles.tableCell} key={cell.id}>
                            <ConfigurableLink
                              className={styles.link}
                              to={`\${openmrsSpaBase}/patient-list/${patientLists[index]?.id}`}>
                              {cell.value}
                            </ConfigurableLink>
                          </TableCell>
                        );

                      case 'isStarred':
                        return (
                          <TableCell
                            key={cell.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleToggleStarred(row.id, !cell.value)}>
                            {cell.value ? (
                              <StarFilled size={16} className={styles.interactiveText01} />
                            ) : (
                              <Star size={16} className={styles.interactiveText01} />
                            )}
                          </TableCell>
                        );

                      case 'type':
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;

                      default:
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default PatientListTable;
