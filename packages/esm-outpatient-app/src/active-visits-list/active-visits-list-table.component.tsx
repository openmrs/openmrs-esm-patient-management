import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  ContentSwitcher,
  DataTable,
  DataTableSize,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Tile,
} from 'carbon-components-react';
import Add16 from '@carbon/icons-react/es/add/16';
import { useLayoutType, ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useActiveVisits } from '../patient-queue-metrics/queue-metrics.resource';
import styles from './active-visits-list-table.scss';

enum tableSizes {
  DEFAULT = 0,
  LARGE = 1,
}

const ActiveVisitsListTable: React.FC = () => {
  const { t } = useTranslation();
  const { activeVisits, isError, isLoading, isValidating } = useActiveVisits();
  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const [tableSize, setTableSize] = useState<DataTableSize>('sm');
  const isDesktop = useLayoutType() === 'desktop';

  useEffect(() => {
    if (contentSwitcherValue === tableSizes.DEFAULT) {
      setTableSize('compact');
    } else if (contentSwitcherValue === tableSizes.LARGE) {
      setTableSize('normal');
    }
  }, [contentSwitcherValue]);

  const headerData = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 2,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 3,
        header: t('waitTime', 'Wait time (mins)'),
        key: 'waitTime',
      },
    ],
    [t],
  );

  const getTagType = (priority: string) => {
    switch (priority) {
      case 'Emergency':
        return 'red';
      case 'Not urgent':
        return 'green';
      default:
        return 'gray';
    }
  };

  const tableRows = useMemo(() => {
    return activeVisits?.map((visit) => ({
      ...visit,
      priority: {
        content: (
          <Tag className={visit.priority === 'Priority' && styles.priorityTag} type={getTagType(visit?.priority)}>
            {visit.priority}
          </Tag>
        ),
      },
      name: {
        // TODO: Interpolate patient uuid into URL
        content: <ConfigurableLink to={`\${openmrsSpaBase}/patient/${visit.id}/chart`}>{visit.name}</ConfigurableLink>,
      },
    }));
  }, [activeVisits]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (activeVisits?.length) {
    return (
      <div className={styles.container} data-floating-menu-container>
        <div className={styles.activeVisitsListContainer}>
          <div className={styles.activeVisitsListHeaderContainer}>
            <label className={styles.heading}>{t('activeVisits', 'Active visits')}</label>
            <div className={styles.switcherContainer}>
              <label className={styles.contentSwitcherLabel}>{t('view', 'View:')} </label>
              <ContentSwitcher onChange={({ index }) => setContentSwitcherValue(index)}>
                <Switch className={styles.switch} name={'first'} text={t('default', 'Default')} />
                <Switch className={styles.switch} name={'second'} text={t('large', 'Large')} />
              </ContentSwitcher>
            </div>
            <Button
              size="small"
              kind="secondary"
              renderIcon={Add16}
              iconDescription={t('addPatientList', 'Add patient to list')}>
              {t('addPatientList', 'Add patient to list')}
            </Button>
          </div>
          <DataTable
            rows={tableRows}
            headers={headerData}
            size={tableSize}
            overflowMenuOnHover={isDesktop ? true : false}
            useZebraStyles>
            {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()} className={styles.activeVisitsTable}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader />
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                      ))}
                      <TableExpandHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, i) => (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                          <TableCell className="bx--table-column-menu">
                            <ActionsMenu />
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow
                            className={styles.expandedActiveVisitRow}
                            colSpan={headers.length + 2}></TableExpandedRow>
                        ) : (
                          <div />
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.activeVisitsListContainer}>
      <div className={styles.activeVisitsListHeaderContainer}>
        <label className={styles.heading}>{t('activeVisits', 'Active visits')}</label>
        <Button
          size="small"
          kind="secondary"
          renderIcon={Add16}
          iconDescription={t('addPatientToList', 'Add patient to list')}>
          {t('addPatientList', 'Add patient to list')}
        </Button>
      </div>
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
          <Button kind="ghost" size="small" renderIcon={Add16}>
            {t('addPatientToList', 'Add patient to list')}
          </Button>
        </Tile>
      </div>
    </div>
  );
};

export default ActiveVisitsListTable;

function ActionsMenu() {
  const { t } = useTranslation();

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editPatientDetails"
        itemText={t('editPatientDetails', 'Edit patient details')}>
        {t('editPatientDetails', 'Edit patient details')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#setWaitTimeManually"
        itemText={t('setWaitTimeManually', 'Set wait time manually')}>
        {t('setWaitTimeManually', 'Set wait time manually')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#endVisit"
        hasDivider
        isDelete
        itemText={t('endVisit', 'End visit')}>
        {t('endVisit', 'End Visit')}
      </OverflowMenuItem>
    </OverflowMenu>
  );
}
