import React, { CSSProperties, useMemo, useState } from 'react';
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
  Button,
  InlineLoading,
  SkeletonIcon,
  Search,
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
import { starPatientList } from '../api/api-remote';
import { PatientListEmptyState } from './empty-state/empty-state.component';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '../api/hooks';

interface PatientListTableContainerProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  loading?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  refetch(): void;
  listType: string;
  handleCreate?: () => void;
  error: Error;
  isValidating: boolean;
  searchTerm: string;
  setSearchTerm: (searchString: string) => void;
}

const PatientListTableContainer: React.FC<PatientListTableContainerProps> = ({
  style,
  patientLists = [],
  loading = false,
  headers,
  refetch,
  listType,
  handleCreate,
  error,
  isValidating,
  searchTerm,
  setSearchTerm,
}) => {
  const { t } = useTranslation();
  const userId = useSession()?.user.uuid;
  const layout = useLayoutType();
  const config = useConfig() as ConfigSchema;
  const pageSizes = [10, 20, 25, 50];
  const [pageSize, setPageSize] = useState(config.patientListsToShow ?? 20);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });

  const { key, order } = sortParams;
  const sortedData = order === 'DESC' ? orderBy(patientLists, [key], ['desc']) : orderBy(patientLists, [key], ['asc']);

  function customSortRow(listA, listB, { sortDirection, sortStates, ...props }) {
    const { key } = props;
    setSortParams({ key, order: sortDirection });
  }
  const { paginated, goTo, results, currentPage } = usePagination(sortedData, pageSize);

  const handleSearch = (str) => {
    setSearchTerm(str);
    goTo(1);
  };

  return (
    <div>
      <div id="table-tool-bar" className={styles.searchContainer}>
        <div>{isValidating && <InlineLoading />}</div>
        <Layer>
          <Search
            id="patient-list-search"
            labelText=""
            size={isDesktop(layout) ? 'sm' : 'lg'}
            className={styles.search}
            onChange={(evnt) => handleSearch(evnt.target.value)}
            value={searchTerm}
            placeholder={t('searchThisList', 'Search this list')}
          />
        </Layer>
      </div>
      {loading ? (
        <DataTableSkeleton
          style={{ ...style, backgroundColor: 'transparent', padding: '0rem' }}
          showToolbar={false}
          showHeader={false}
          rowCount={pageSize}
          columnCount={headers.length}
          zebra
          compact={isDesktop(layout)}
        />
      ) : error ? (
        <ErrorState error={error} headerTitle={t('patientLists', 'Patient Lists')} />
      ) : !patientLists?.length ? (
        <PatientListEmptyState launchForm={handleCreate} listType={listType} />
      ) : (
        <>
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
                              return <PatientListStarIcon cohortUuid={row.id} />;

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
      )}
    </div>
  );
};

interface PatientListStarIconProps {
  cohortUuid: string;
}

const PatientListStarIcon = ({ cohortUuid }) => {
  const [userActionInProgress, setUserActionInProgress] = useState(false);
  const { sessionLocation } = useSession();
  const { user, mutateUser } = useCurrentUser();
  const isPatientListStarred = useMemo(
    () => !!user?.userProperties?.starredPatientLists?.includes(cohortUuid),
    [user?.userProperties?.starredPatientLists, cohortUuid],
  );
  const isTablet = useLayoutType() === 'tablet';

  const onSucess = () => {
    mutateUser().then(() => setUserActionInProgress(false));
  };

  const handleToggleStarred = () => {
    setUserActionInProgress(true);

    starPatientList(user, cohortUuid, !isPatientListStarred, sessionLocation.uuid, onSucess);
  };
  return (
    <TableCell className={`cds--table-column-menu ${styles.starButton}`} key={cohortUuid} style={{ cursor: 'pointer' }}>
      {userActionInProgress ? (
        <Button size={isTablet ? 'lg' : 'sm'} kind="ghost" hasIconOnly>
          <SkeletonIcon />
        </Button>
      ) : (
        <Button
          size={isTablet ? 'lg' : 'sm'}
          kind="ghost"
          hasIconOnly
          renderIcon={isPatientListStarred ? StarFilled : Star}
          iconDescription={''}
          onClick={handleToggleStarred}
        />
      )}
    </TableCell>
  );
};

export default PatientListTableContainer;
