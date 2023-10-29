import React, { type CSSProperties, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import fuzzy from 'fuzzy';
import orderBy from 'lodash-es/orderBy';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { Star, StarFilled } from '@carbon/react/icons';
import {
  ConfigurableLink,
  isDesktop,
  useConfig,
  useDebounce,
  useLayoutType,
  usePagination,
  useSession,
} from '@openmrs/esm-framework';
import { updatePatientList } from '../api/api-remote';
import type { ConfigSchema } from '../config-schema';
import type { PatientList } from '../api/types';
import EmptyState from '../empty-state/empty-state.component';
import ErrorState from '../error-state/error-state.component';
import styles from './lists-table.scss';

/**
 * FIXME Temporarily moved here
 */
interface DataTableHeader {
  key: string;
  header: React.ReactNode;
}

interface PatientListTableProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  isLoading?: boolean;
  isValidating?: boolean;
  headers?: Array<DataTableHeader>;
  refetch?(): void;
  listType: string;
  handleCreate?: () => void;
  error?: any;
}

const ListsTable: React.FC<PatientListTableProps> = ({
  style,
  patientLists = [],
  isLoading = false,
  isValidating,
  headers,
  refetch,
  listType,
  handleCreate,
  error,
}) => {
  const { t } = useTranslation();
  const userId = useSession()?.user?.uuid;
  const layout = useLayoutType();
  const config: ConfigSchema = useConfig();
  const pageSizes = [10, 20, 25, 50];
  const [pageSize, setPageSize] = useState(config.patientListsToShow ?? 20);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });
  const [searchTerm, setSearchTerm] = useState('');
  const responsiveSize = layout === 'tablet' ? 'lg' : 'sm';
  const debouncedSearchTerm = useDebounce(searchTerm);

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

  const filteredLists = useMemo(() => {
    if (!debouncedSearchTerm) {
      return results;
    }

    return debouncedSearchTerm
      ? fuzzy
          .filter(debouncedSearchTerm, results, { extract: (list) => `${list.display} ${list.type}` })
          .sort((r1, r2) => r1.score - r2.score)
          .map((result) => result.original)
      : results;
  }, [results, debouncedSearchTerm]);

  const tableRows = useMemo(
    () =>
      filteredLists?.map((list) => ({
        id: list.id,
        display: list.display,
        description: list.description,
        type: list.type,
        size: list.size,
      })) ?? [],
    [filteredLists],
  );

  if (isLoading) {
    return (
      <DataTableSkeleton
        role="progressbar"
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
    return <ErrorState error={error} headerTitle={t('patientLists', 'Patient lists')} />;
  }

  if (patientLists.length) {
    return (
      <>
        <div id="tableToolBar" className={styles.searchContainer}>
          <div>{isValidating && <InlineLoading />}</div>
          <Layer>
            <Search
              className={styles.searchbox}
              id="patient-list-search"
              labelText=""
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder={t('searchThisList', 'Search this list')}
              size={responsiveSize}
              value={searchTerm}
            />
          </Layer>
        </div>
        <DataTable rows={tableRows} headers={headers} size={responsiveSize} sortRow={customSortRow}>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
            <TableContainer {...getTableContainerProps()}>
              <Table
                className={styles.table}
                {...getTableProps()}
                data-testid="patientListsTable"
                isSortable
                useZebraStyles>
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
        {filteredLists?.length === 0 && (
          <div className={styles.filterEmptyState}>
            <Layer level={0}>
              <Tile className={styles.filterEmptyStateTile}>
                <p className={styles.filterEmptyStateContent}>{t('noMatchingLists', 'No matching lists to display')}</p>
                <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
              </Tile>
            </Layer>
          </div>
        )}
        {paginated && (
          <Layer>
            <Pagination
              size={isDesktop(layout) ? 'sm' : 'lg'}
              backwardText={t('previousPage', 'Previous page')}
              forwardText={t('nextPage', 'Next page')}
              itemsPerPageText={t('itemsPerPage', 'Items per page:')}
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
      </>
    );
  }

  return <EmptyState launchForm={handleCreate} listType={listType} />;
};

export default ListsTable;
