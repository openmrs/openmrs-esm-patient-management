import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandRow,
  TableExpandHeader,
  ContentSwitcher,
  Switch,
  Button,
  Tag,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
  TableExpandedRow,
} from 'carbon-components-react';
import Add16 from '@carbon/icons-react/es/add/16';

import { useLayoutType, ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ActiveVisit, useActiveVisits } from '../patient-queue-metrics/queue-metrics.resource';
import styles from './active-visits-list-table.scss';

const ActiveVisitsListTable: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { activeVisits, isError, isLoading, isValidating } = useActiveVisits();
  const desktopView = layout === 'desktop';

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
        content: <ConfigurableLink to={`\${openmrsSpaBase}/patient/chart`}>{visit.name}</ConfigurableLink>,
      },
    }));
  }, [activeVisits]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (activeVisits?.length) {
    return (
      <div className={styles.activeVisitsListContainer}>
        <div className={styles.activeVisitsListHeaderContainer}>
          <label className={styles.heading}>{t('activeVisits', 'Active visits')}</label>
          <div className={styles.switcherContainer}>
            <label className={styles.contentSwitcherLabel}>{t('view', 'View:')} </label>
            <ContentSwitcher onChange={() => {}} style={{ marginLeft: '1rem' }}>
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
        <DataTable rows={tableRows} headers={headerData} isSortable>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer title="" className={styles.tableContainer}>
              <Table className={styles.activeVisitsTable} {...getTableProps()} size={desktopView ? 'short' : 'normal'}>
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
                  {rows.map((row, index) => (
                    <React.Fragment key={index}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                        <TableCell className="bx--table-column-menu">
                          <OverflowMenu size="sm" flipped>
                            <OverflowMenuItem itemText={t('endVisit', 'End visit')}>
                              {t('endVisit', 'End visit')}
                            </OverflowMenuItem>
                            <OverflowMenuItem hasDivider isDelete itemText={t('resetWaitTime', 'Reset wait time')}>
                              {t('resetWaitTime', 'Reset wait time')}
                            </OverflowMenuItem>
                          </OverflowMenu>
                        </TableCell>
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow
                          className={styles.expandedActiveVisitRow}
                          colSpan={headers.length + 2}></TableExpandedRow>
                      ) : null}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
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
