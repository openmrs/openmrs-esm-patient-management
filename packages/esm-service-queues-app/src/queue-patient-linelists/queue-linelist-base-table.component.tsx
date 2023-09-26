import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  Layer,
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
  Tag,
  Tile,
  DataTableSkeleton,
  Pagination,
} from '@carbon/react';
import { Filter, OverflowMenuVertical } from '@carbon/react/icons';
import { ConfigurableLink, ExtensionSlot, formatDatetime, parseDate, usePagination } from '@openmrs/esm-framework';
import styles from './queue-linelist-base-table.scss';
import { FilterTypes } from '../types';
import QueueLinelist from './queue-linelist.component';
import { getGender } from '../helpers/functions';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface QueuePatientTableProps {
  title: string;
  patientData: Array<any>;
  headers: Array<any>;
  serviceType: string;
  isLoading: boolean;
  toggleFilter?: (filterMode: FilterTypes) => void;
}

const QueuePatientBaseTable: React.FC<QueuePatientTableProps> = ({
  title,
  patientData,
  headers,
  serviceType,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(false);
  const { results, currentPage, goTo } = usePagination(patientData ?? [], 100);

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        if (typeof filterableValue === 'boolean') {
          return false;
        }
        if (filterableValue.hasOwnProperty('content')) {
          if (Array.isArray(filterableValue.content.props.children)) {
            return ('' + filterableValue.content.props.children[1].props.children).toLowerCase().includes(filterTerm);
          }
          if (typeof filterableValue.content.props.children === 'object') {
            return ('' + filterableValue.content.props.children.props.children.props.children)
              .toLowerCase()
              .includes(filterTerm);
          }
          return ('' + filterableValue.content.props.children).toLowerCase().includes(filterTerm);
        }
        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(patientData?.length / 100);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * 100;
    });
  }, [patientData]);

  const tableRows = useMemo(
    () =>
      results?.map((entry) => {
        return {
          id: entry.id,
          name: {
            content: (
              <ConfigurableLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`}>
                {entry.name}
              </ConfigurableLink>
            ),
          },
          returnDate: formatDatetime(parseDate(entry.returnDate), { mode: 'wide' }),
          gender: getGender(entry.gender, t),
          age: entry.age,
          visitType: entry.visitType,
          phoneNumber: entry.phoneNumber,
        };
      }),
    [results, t],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div className={styles.container}>
      <ExtensionSlot name="breadcrumbs-slot" />

      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>
            {title} {serviceType}
          </p>
          <p className={styles.subTitle}>
            {patientData?.length} · Last Updated: {formatDatetime(new Date(), { mode: 'standard' })}
          </p>
        </div>

        <Button kind="ghost" size="sm" renderIcon={(props) => <OverflowMenuVertical size={16} {...props} />}>
          {t('actions', 'Actions')}
        </Button>
      </div>

      <Layer>
        <Tile className={styles.filterTile}>
          <Tag size="md" title="Clear Filter" type="blue">
            {t('today', 'Today')}
          </Tag>

          <div className={styles.actionsBtn}>
            <Button
              kind="ghost"
              renderIcon={(props) => <Filter size={16} {...props} />}
              iconDescription={t('filter', 'Filter (1)')}
              onClick={() => setShowOverlay(true)}
              size="sm">
              {t('filter', 'Filter (1)')}
            </Button>
          </div>
        </Tile>
      </Layer>

      <DataTable
        data-floating-menu-container
        filterRows={handleFilter}
        headers={headers}
        overflowMenuOnHover={false}
        rows={tableRows}
        size="md"
        useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
              <TableToolbarContent className={styles.toolbarContent}>
                <TableToolbarSearch
                  className={styles.search}
                  expanded
                  onChange={onInputChange}
                  placeholder={t('searchThisList', 'Search this list')}
                  size="sm"
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} className={styles.queueTable}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Layer>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </Layer>
              </div>
            ) : null}
          </TableContainer>
        )}
      </DataTable>

      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={100}
        onChange={({ page }) => goTo(page)}
        pageSizes={pageSizes?.length > 0 ? pageSizes : [100]}
        totalItems={patientData?.length ?? 0}
      />

      {showOverlay && <QueueLinelist closePanel={() => setShowOverlay(false)} />}
    </div>
  );
};

export default QueuePatientBaseTable;
