import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableCustomRenderProps,
  DataTableHeader,
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
  Button,
} from '@carbon/react';
import orderBy from 'lodash-es/orderBy';
import { Star, StarFilled } from '@carbon/react/icons';
import {
  ConfigurableLink,
  getSessionStore,
  isDesktop,
  showToast,
  useConfig,
  useLayoutType,
  usePagination,
  useSession,
} from '@openmrs/esm-framework';
import type { ConfigSchema } from '../config-schema';
import type { PatientList } from '../api/types';
import { ErrorState } from './error-state/error-state.component';
import { PatientListEmptyState } from './empty-state/empty-state.component';
import styles from './patient-list-list.scss';
import { starPatientList } from '../api/api-remote';

interface PatientListTableContainerProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  isLoading?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  refetch?(): void;
  listType: string;
  handleCreate?: () => void;
  error?: any;
  isValidating?: boolean;
  searchTerm?: string;
  setSearchTerm?: (searchString: string) => void;
}

const PatientListTableContainer: React.FC<PatientListTableContainerProps> = ({
  style,
  patientLists = [],
  isLoading = false,
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
  const userId = useSession()?.user?.uuid;
  const layout = useLayoutType();
  const config: ConfigSchema = useConfig();
  const pageSizes = [10, 20, 25, 50];
  const [pageSize, setPageSize] = useState(config.patientListsToShow ?? 20);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });

  const { key, order } = sortParams;
  const sortedData = order === 'DESC' ? orderBy(patientLists, [key], ['desc']) : orderBy(patientLists, [key], ['asc']);
  const { toggleStarredList, starredLists } = usePatientListStar();

  function customSortRow(listA, listB, { sortDirection, sortStates, ...props }) {
    const { key } = props;
    setSortParams({ key, order: sortDirection });
  }
  const { paginated, goTo, results, currentPage } = usePagination(sortedData, pageSize);

  const handleSearch = (str) => {
    setSearchTerm(str);
    goTo(1);
  };

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
              className={styles.search}
              id="patient-list-search"
              labelText=""
              onChange={(evnt) => handleSearch(evnt.target.value)}
              placeholder={t('searchThisList', 'Search this list')}
              size={isDesktop(layout) ? 'sm' : 'lg'}
              value={searchTerm}
            />
          </Layer>
        </div>
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
                              <PatientListStarIcon
                                cohortUuid={row.id}
                                isStarred={starredLists.includes(row.id)}
                                toggleStarredList={toggleStarredList}
                              />
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

  return <PatientListEmptyState launchForm={handleCreate} listType={listType} />;
};

interface PatientListStarIconProps {
  cohortUuid: string;
  isStarred: boolean;
  toggleStarredList: (cohortUuid: string, starList) => void;
}

const PatientListStarIcon: React.FC<PatientListStarIconProps> = ({ cohortUuid, isStarred, toggleStarredList }) => {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <TableCell className={`cds--table-column-menu ${styles.starButton}`} key={cohortUuid} style={{ cursor: 'pointer' }}>
      <Button
        size={isTablet ? 'lg' : 'sm'}
        kind="ghost"
        hasIconOnly
        renderIcon={isStarred ? StarFilled : Star}
        onClick={() => toggleStarredList(cohortUuid, !isStarred)}
      />
    </TableCell>
  );
};

function usePatientListStar() {
  const { t } = useTranslation();
  const [starredLists, setStarredLists] = useState([]);
  console.log(starredLists);
  const [starhandleTimeout, setStarHandleTimeout] = useState(null);
  const { user: currentUser } = useSession();
  console.log("user starred lists", currentUser?.userProperties?.starredPatientLists);

  const setInitialStarredLists = useCallback(() => {
    const starredPatientLists = currentUser?.userProperties?.starredPatientLists ?? '';
    setStarredLists(starredPatientLists.split(','));
  }, [currentUser?.userProperties?.starredPatientLists, setStarredLists]);

  const updateUserProperties = (newStarredLists: Array<string>) => {
    const starredPatientLists = newStarredLists.join(',');
    const userProperties = { ...(currentUser?.userProperties ?? {}), starredPatientLists };

    starPatientList(currentUser?.uuid, userProperties)
      // .then(() => mutateUser())
      .catch(() => {
        setInitialStarredLists();
        showToast({
          description: t('starringPatientListFailed', 'Marking patient lists starred / unstarred failed'),
          kind: 'error',
          title: 'Failed to update patient lists',
        });
      });
  };
  /**
   * Handles toggling the starred list
   * It uses a timeout to store all the changes made by the user
   * and pass the changes in a single request
   * @param cohortUuid
   * @param starPatientList
   */
  const toggleStarredList = (cohortUuid, starPatientList) => {
    const newStarredLists = starPatientList
      ? [...starredLists, cohortUuid]
      : starredLists.filter((uuid) => uuid !== cohortUuid);
    setStarredLists(newStarredLists);
    if (starhandleTimeout) {
      clearTimeout(starhandleTimeout);
    }
    const timeout = setTimeout(() => updateUserProperties(newStarredLists), 1500);
    setStarHandleTimeout(timeout);
  };

  useEffect(() => {
    if (currentUser?.userProperties?.starredPatientLists) {
      setInitialStarredLists();
    }
  }, [currentUser?.userProperties?.starredPatientLists, setInitialStarredLists]);

  return { toggleStarredList, starredLists };
}

export default PatientListTableContainer;
