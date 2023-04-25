import React, { CSSProperties, useState } from 'react';
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
  Layer,
  Pagination,
} from '@carbon/react';
import orderBy from 'lodash-es/orderBy';
import { Star, StarFilled } from '@carbon/react/icons';
import {
  useSession,
  ConfigurableLink,
  useLayoutType,
  isDesktop,
  ErrorState,
  usePagination,
  useConfig,
} from '@openmrs/esm-framework';
import { ConfigSchema } from '../config-schema';
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
}) => {
  const { t } = useTranslation();
  const userId = useSession()?.user.uuid;
  const layout = useLayoutType();
  const config = useConfig() as ConfigSchema;
  const pageSizes = [10, 20, 25, 50];
  const [pageSize, setPageSize] = useState(config.patientListsToShow ?? 10);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });

  const handleToggleStarred = async (patientListId: string, isStarred: boolean) => {
    if (userId) {
      await updatePatientList(patientListId, { isStarred });
      refetch();
    }
  };

  const { key, order } = sortParams;
  const sortedData = order === 'DESC' ? orderBy(patientLists, [key], ['desc']) : orderBy(patientLists, [key], ['asc']);

  function customSortRow(listA, listB, { sortDirection, sortStates, ...props }) {
    const { key } = props;
    setSortParams({ key, order: sortDirection });
  }
  const { paginated, goTo, results, currentPage } = usePagination(sortedData, pageSize);

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
    <div>
      <DataTable rows={results} headers={headers} size={isDesktop(layout) ? 'sm' : 'lg'} sortRow={customSortRow}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
        }: DataTableCustomRenderProps) => (
          <TableContainer style={{ ...style, backgroundColor: 'transparent' }} {...getTableContainerProps()}>
            <Table {...getTableProps()} data-testid="patientListsTable" isSortable useZebraStyles>
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
                                to={`\${openmrsSpaBase}/home/patient-lists/${patientLists[index]?.id}`}>
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
      {paginated && (
        <Layer>
          <Pagination
            size={isDesktop(layout) ? 'sm' : 'lg'}
            backwardText="Previous page"
            forwardText="Next page"
            itemsPerPageText="Items per page:"
            page={currentPage}
            pageNumberText={t('pageNumber', 'Page number')}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={patientLists?.length}
            onChange={({ page: newPage, pageSize: newPageSize }) => {
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
              if (newPage !== currentPage) {
                goTo(newPage);
              }
            }}
          />
        </Layer>
      )}
    </div>
  );
};

export default PatientListTable;
