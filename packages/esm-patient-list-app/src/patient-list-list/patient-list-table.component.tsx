import React, { CSSProperties, useMemo } from 'react';
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
  Pagination,
} from '@carbon/react';
import { Star, StarFilled } from '@carbon/react/icons';
import { useSession, ConfigurableLink, useLayoutType, isDesktop, usePagination } from '@openmrs/esm-framework';
import styles from './patient-list-list.scss';
import { PatientList } from '../api/types';
import { updatePatientList } from '../api/api-remote';
import { PatientListEmptyState } from './empty-state/empty-state.component';

interface PatientListTableProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  loading?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  refetch(): void;
  listType: string;
  handleCreate?: () => void;
}

const PatientListTable: React.FC<PatientListTableProps> = ({
  style,
  patientLists = [],
  loading = false,
  headers,
  refetch,
  listType,
  handleCreate,
}) => {
  const userId = useSession()?.user.uuid;
  const layout = useLayoutType();

  const handleToggleStarred = async (patientListId: string, isStarred: boolean) => {
    if (userId) {
      await updatePatientList(patientListId, { isStarred });
      refetch();
    }
  };

  const { results, goTo, currentPage } = usePagination(patientLists, 10);

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(patientLists.length / 10);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * 10;
    });
  }, [patientLists]);

  if (loading) {
    return (
      <div className={styles.container}>
        <DataTableSkeleton
          style={{ ...style, backgroundColor: 'transparent', padding: '0rem' }}
          showToolbar={false}
          showHeader={false}
          rowCount={4}
          columnCount={4}
          zebra
        />
      </div>
    );
  }

  if (patientLists?.length) {
    return (
      <div>
        <DataTable rows={results} headers={headers}>
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
        <Pagination
          backwardText="Previous page"
          forwardText="Next page"
          itemsPerPageText="Items per page:"
          page={currentPage}
          pageNumberText="Page Number"
          pageSize={10}
          onChange={({ page }) => goTo(page)}
          pageSizes={pageSizes}
          totalItems={patientLists.length ?? 0}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PatientListEmptyState launchForm={handleCreate} listType={listType} />
    </div>
  );
};

export default PatientListTable;
