import React from 'react';
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
} from '@carbon/react';
import { Filter, OverflowMenuVertical } from '@carbon/react/icons';
import { ExtensionSlot, formatDatetime } from '@openmrs/esm-framework';
import styles from './queue-linelist-base-table.scss';

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
  rows: any;
  serviceType: string;
  isLoading: boolean;
}

const QueuePatientBaseTable: React.FC<QueuePatientTableProps> = ({
  title,
  patientData,
  headers,
  rows,
  serviceType,
  isLoading,
}) => {
  const { t } = useTranslation();

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

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div className={styles.container}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />

      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>
            {title} {serviceType}
          </p>
          <p className={styles.subTitle}>
            {patientData?.length} · Last Updated: {formatDatetime(new Date(), { mode: 'standard' })}
          </p>
        </div>

        <Button kind="ghost" size="small" renderIcon={(props) => <OverflowMenuVertical size={16} {...props} />}>
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
              size="sm">
              {t('filter', 'Filter (1)')}
            </Button>
          </div>
        </Tile>
      </Layer>

      {patientData?.length ? (
        <DataTable
          data-floating-menu-container
          filterRows={handleFilter}
          headers={headers}
          overflowMenuOnHover={false}
          rows={rows}
          size="compact"
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
                <TableToolbarContent className={styles.toolbarContent}>
                  <TableToolbarSearch
                    className={styles.search}
                    expanded
                    light
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
      ) : (
        <Layer>
          <Tile className={styles.tile}>
            <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
          </Tile>
        </Layer>
      )}
    </div>
  );
};

export default QueuePatientBaseTable;
