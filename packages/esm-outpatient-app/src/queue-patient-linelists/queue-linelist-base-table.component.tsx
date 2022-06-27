import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableHeader,
  OverflowMenu,
  OverflowMenuItem,
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
  Button,
  Tag,
} from 'carbon-components-react';
import { navigate, showModal, ExtensionSlot, formatDatetime, usePagination } from '@openmrs/esm-framework';
import { getOriginFromPathName } from '../active-visits/active-visits-table.resource';
import styles from './queue-linelist-base-table.scss';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import { Filter16 } from '@carbon/icons-react';

const currentPathName: string = window.location.pathname;
const fromPage: string = getOriginFromPathName(currentPathName);

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
}

function ActionsMenu({ patientUuid }: { patientUuid: string }) {
  const { t } = useTranslation();

  const launchEndVisitModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem className={styles.menuItem} id="#outreachFrom" itemText={t('outreachFrom', 'Outreach From')}>
        {t('outreachFrom', 'Outreach From')}
      </OverflowMenuItem>
      <OverflowMenuItem className={styles.menuItem} id="#locatorFrom" itemText={t('locatorFrom', 'locatorFrom')}>
        {t('locatorFrom', 'Locator From')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#contactDetails"
        hasDivider
        isDelete
        itemText={t('fullContactDetails', 'Full Contact Details')}>
        {t('fullContactDetails', 'Full Contact Details')}
      </OverflowMenuItem>
    </OverflowMenu>
  );
}

const pageSize = 20;

const QueuePatientBaseTable: React.FC<QueuePatientTableProps> = ({
  title,
  patientData,
  headers,
  rows,
  serviceType,
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

        <Button kind="ghost" size="small" renderIcon={OverflowMenuVertical16}>
          {t('actions', 'Actions')}
        </Button>
      </div>

      <Tile className={styles.filterTile}>
        <Tag size="md" title="Clear Filter" type="blue">
          {t('today', 'Today')}
        </Tag>

        <div className={styles.actionsBtn}>
          <Button renderIcon={Filter16} kind="ghost">
            {t('filter', 'Filter (1)')}
          </Button>
        </div>
      </Tile>

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
              <TableToolbar>
                <TableToolbarContent>
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
                          <TableCell className="bx--table-column-menu">
                            <ActionsMenu patientUuid={rows?.[index]?.id} />
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          )}
        </DataTable>
      ) : (
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
        </Tile>
      )}
    </div>
  );
};

export default QueuePatientBaseTable;
