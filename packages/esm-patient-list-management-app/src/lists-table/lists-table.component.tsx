import React, { type CSSProperties, useCallback, useId, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fuzzy from 'fuzzy';
import orderBy from 'lodash-es/orderBy';
import type { TFunction } from 'i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
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
import { CustomPagination } from './custom-pagination.component';
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
  const layout = useLayoutType();
  const config: ConfigSchema = useConfig();
  const pageSize = config.patientListsToShow ?? 10;
  const [sortParams, setSortParams] = useState({ key: '', order: 'none' });
  const [searchTerm, setSearchTerm] = useState('');
  const responsiveSize = layout === 'tablet' ? 'lg' : 'sm';
  const debouncedSearchTerm = useDebounce(searchTerm);

  const { toggleStarredList, starredLists } = useStarredLists();

  function customSortRow(listA, listB, { sortDirection, sortStates, ...props }) {
    const { key } = props;
    setSortParams({ key, order: sortDirection });
  }

  const filteredLists: Array<PatientList> = useMemo(() => {
    if (!debouncedSearchTerm) {
      return patientLists;
    }

    return fuzzy
      .filter(debouncedSearchTerm, patientLists, { extract: (list) => `${list.display} ${list.type}` })
      .sort((r1, r2) => r1.score - r2.score)
      .map((result) => result.original);
  }, [patientLists, debouncedSearchTerm]);

  const { key, order } = sortParams;
  const sortedData =
    order === 'DESC' ? orderBy(filteredLists, [key], ['desc']) : orderBy(filteredLists, [key], ['asc']);

  const { paginated, goTo, results, currentPage } = usePagination(sortedData, pageSize);

  const tableRows = useMemo(
    () =>
      debouncedSearchTerm
        ? filteredLists
        : results.map((list) => ({
            id: list.id,
            display: list.display,
            description: list.description,
            type: list.type,
            size: list.size,
          })) ?? [],
    [filteredLists, results],
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

  if (patientLists.length === 0) {
    return <EmptyState launchForm={handleCreate} listType={listType} />;
  }

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
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()} className={styles.tableContainer}>
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
                  const listDetailsPageUrl = '${openmrsSpaBase}/home/patient-lists/${listUuid}';

                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      className={isDesktop(layout) ? styles.desktopRow : styles.tabletRow}
                      key={row.id}>
                      <TableCell>
                        <ConfigurableLink
                          className={styles.link}
                          to={listDetailsPageUrl}
                          templateParams={{ listUuid: row.id }}>
                          {currentList?.display ?? ''}
                        </ConfigurableLink>
                      </TableCell>
                      <TableCell>{currentList?.type ?? ''}</TableCell>
                      <TableCell>{currentList?.size ?? ''}</TableCell>
                      <PatientListStarIcon
                        cohortUuid={row.id}
                        isStarred={starredLists.includes(row.id)}
                        toggleStarredList={toggleStarredList}
                        t={t}
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
        <CustomPagination
          currentItems={results.length}
          totalItems={filteredLists.length}
          onPageNumberChange={({ page }) => {
            goTo(page);
          }}
          pageNumber={currentPage}
          pageSize={pageSize}
        />
      )}
    </>
  );
};

interface PatientListStarIconProps {
  cohortUuid: string;
  isStarred: boolean;
  toggleStarredList: (cohortUuid: string, starList) => void;
  t: TFunction;
}

const PatientListStarIcon: React.FC<PatientListStarIconProps> = ({ cohortUuid, isStarred, toggleStarredList, t }) => {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <TableCell className={`cds--table-column-menu ${styles.starButton}`} key={cohortUuid} style={{ cursor: 'pointer' }}>
      <Button
        iconDescription={isStarred ? t('unstarList', 'Unstar list') : t('starList', 'Star list')}
        size={isTablet ? 'lg' : 'sm'}
        kind="ghost"
        hasIconOnly
        renderIcon={isStarred ? StarFilled : Star}
        tooltipPosition="left"
        enterDelayMs={500}
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
