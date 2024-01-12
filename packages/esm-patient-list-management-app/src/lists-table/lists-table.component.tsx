import React, { type CSSProperties, useCallback, useId, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fuzzy from 'fuzzy';
import orderBy from 'lodash-es/orderBy';
import {
  Button,
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
  Tile,
} from '@carbon/react';
import { Star, StarFilled } from '@carbon/react/icons';
import {
  ConfigurableLink,
  isDesktop,
  showSnackbar,
  useConfig,
  useDebounce,
  useLayoutType,
  usePagination,
  useSession,
} from '@openmrs/esm-framework';
import type { ConfigSchema } from '../config-schema';
import type { PatientList } from '../api/types';
import { starPatientList } from '../api/api-remote';
import { ErrorState } from '../error-state/error-state.component';
import EmptyState from '../empty-state/empty-state.component';
import styles from './lists-table.scss';

/**
 * FIXME Temporarily moved here
 */
interface DataTableHeader {
  key: string;
  header: React.ReactNode;
}

interface PatientListTableProps {
  error?: Error | null;
  handleCreate?: () => void;
  headers?: Array<DataTableHeader>;
  isLoading?: boolean;
  isValidating?: boolean;
  listType: string;
  patientLists: Array<PatientList>;
  refetch?(): void;
  style?: CSSProperties;
}

const ListsTable: React.FC<PatientListTableProps> = ({
  error,
  handleCreate,
  headers,
  isLoading = false,
  isValidating,
  listType,
  patientLists = [],
  refetch,
  style,
}) => {
  const { t } = useTranslation();
  const id = useId();
  const userId = useSession()?.user?.uuid;
  const layout = useLayoutType();
  const config: ConfigSchema = useConfig();
  const pageSizes = [10, 20, 25, 50];
  const [pageSize, setPageSize] = useState(config.patientListsToShow ?? 20);
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });
  const [searchTerm, setSearchTerm] = useState('');
  const responsiveSize = layout === 'tablet' ? 'lg' : 'sm';
  const debouncedSearchTerm = useDebounce(searchTerm);

  const { key, order } = sortParams;
  const sortedData = order === 'DESC' ? orderBy(patientLists, [key], ['desc']) : orderBy(patientLists, [key], ['asc']);
  const { toggleStarredList, starredLists } = useStarredLists();

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
          .filter(debouncedSearchTerm, patientLists, { extract: (list) => `${list.display} ${list.type}` })
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
        columnCount={headers.length}
        compact={isDesktop(layout)}
        role="progressbar"
        rowCount={pageSize}
        showHeader={false}
        showToolbar={false}
        style={{ ...style, backgroundColor: 'transparent', padding: '0rem' }}
        zebra
      />
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('patientLists', 'Patient lists')} />;
  }

  if (patientLists?.length) {
    return (
      <>
        <div id="tableToolBar" className={styles.searchContainer}>
          <div>{isValidating && <InlineLoading />}</div>
          <Layer>
            <Search
              className={styles.searchbox}
              id={`${id}-search`}
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
                {...getTableProps()}
                className={styles.table}
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
                  {rows.map((row) => {
                    const currentList = patientLists?.find((list) => list?.id === row.id);
                    const detailPageUrl = window.getOpenmrsSpaBase() + `home/patient-lists/${row.id}`;

                    return (
                      <TableRow
                        {...getRowProps({ row })}
                        className={isDesktop(layout) ? styles.desktopRow : styles.tabletRow}
                        key={row.id}>
                        <TableCell>
                          <ConfigurableLink className={styles.link} to={detailPageUrl}>
                            {currentList?.display ?? ''}
                          </ConfigurableLink>
                        </TableCell>
                        <TableCell>{currentList?.type ?? ''}</TableCell>
                        <TableCell>{currentList?.size ?? ''}</TableCell>
                        <PatientListStarIcon
                          cohortUuid={row.id}
                          isStarred={starredLists.includes(row.id)}
                          toggleStarredList={toggleStarredList}
                        />
                      </TableRow>
                    );
                  })}
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
              backwardText={t('previousPage', 'Previous page')}
              forwardText={t('nextPage', 'Next page')}
              itemsPerPageText={t('itemsPerPage', 'Items per page:')}
              onChange={({ page: newPage, pageSize: newPageSize }) => {
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                }
                if (newPage !== currentPage) {
                  goTo(newPage);
                }
              }}
              page={currentPage}
              pageNumberText={t('pageNumber', 'Page number')}
              pageSize={pageSize}
              pageSizes={pageSizes}
              size={isDesktop(layout) ? 'sm' : 'lg'}
              totalItems={patientLists?.length}
            />
          </Layer>
        )}
      </>
    );
  }

  return <EmptyState launchForm={handleCreate} listType={listType} />;
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
        iconDescription="Star patient list"
        size={isTablet ? 'lg' : 'sm'}
        kind="ghost"
        hasIconOnly
        renderIcon={isStarred ? StarFilled : Star}
        onClick={() => toggleStarredList(cohortUuid, !isStarred)}
      />
    </TableCell>
  );
};

function useStarredLists() {
  const { t } = useTranslation();
  const [starredLists, setStarredLists] = useState([]);
  const [starhandleTimeout, setStarHandleTimeout] = useState(null);
  const { user: currentUser } = useSession();

  const setInitialStarredLists = useCallback(() => {
    const starredPatientLists = currentUser?.userProperties?.starredPatientLists ?? '';
    setStarredLists(starredPatientLists.split(','));
  }, [currentUser?.userProperties?.starredPatientLists, setStarredLists]);

  const updateUserProperties = (newStarredLists: Array<string>) => {
    const starredPatientLists = newStarredLists.join(',');
    const userProperties = { ...(currentUser?.userProperties ?? {}), starredPatientLists };

    starPatientList(currentUser?.uuid, userProperties).catch(() => {
      setInitialStarredLists();
      showSnackbar({
        subtitle: t('starringPatientListFailed', 'Marking patient lists starred / unstarred failed'),
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
  const toggleStarredList = useCallback(
    (cohortUuid, starPatientList) => {
      const newStarredLists = starPatientList
        ? [...starredLists, cohortUuid]
        : starredLists.filter((uuid) => uuid !== cohortUuid);
      setStarredLists(newStarredLists);
      if (starhandleTimeout) {
        clearTimeout(starhandleTimeout);
      }
      const timeout = setTimeout(() => updateUserProperties(newStarredLists), 1500);
      setStarHandleTimeout(timeout);
    },
    [starredLists, starhandleTimeout, setStarredLists, setStarHandleTimeout, updateUserProperties],
  );

  useEffect(() => {
    if (currentUser?.userProperties?.starredPatientLists) {
      setInitialStarredLists();
    }
  }, [currentUser?.userProperties?.starredPatientLists, setInitialStarredLists]);

  return { toggleStarredList, starredLists };
}

export default ListsTable;
