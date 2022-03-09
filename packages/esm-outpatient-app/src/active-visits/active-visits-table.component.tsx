import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  TooltipDefinition,
} from 'carbon-components-react';
import Add16 from '@carbon/icons-react/es/add/16';
import InProgress16 from '@carbon/icons-react/es/in-progress/16';
import Group16 from '@carbon/icons-react/es/group/16';
import { useLayoutType, ConfigurableLink } from '@openmrs/esm-framework';
import PatientSearch from '../patient-search/patient-search.component';
import { useVisitQueueEntries } from './active-visits-table.resource';
import styles from './active-visits-table.scss';

enum tableSizes {
  DEFAULT = 0,
  LARGE = 1,
}

enum queueStatus {
  CLINICAL_CONSULTATION = 'Clinical consultation',
  FINISHED_SERVICE = 'Finished Service',
  IN_SERVICE = 'In Service',
  TRIAGE = 'Triage',
  WAITING = 'Waiting',
}

const ActiveVisitsTable: React.FC = () => {
  const { t } = useTranslation();
  const { visitQueueEntries, isLoading } = useVisitQueueEntries();
  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const [tableSize, setTableSize] = useState<DataTableSize>('compact');
  const isDesktop = useLayoutType() === 'desktop';
  const [showOverlay, setShowOverlay] = useState(false);

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
      case 'Not Urgent':
        return 'green';
      case 'Urgent':
        return 'magenta';
      default:
        return 'gray';
    }
  };

  const tableRows = useMemo(() => {
    return visitQueueEntries?.map((entry) => ({
      ...entry,
      name: {
        content: (
          <ConfigurableLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`}>{entry.name}</ConfigurableLink>
        ),
      },
      priority: {
        content: (
          <>
            {entry?.priorityComment ? (
              <TooltipDefinition
                className={styles.tooltip}
                align="start"
                direction="bottom"
                tooltipText={entry.priorityComment}>
                <Tag
                  className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                  type={getTagType(entry?.priority)}>
                  {entry.priority}
                </Tag>
              </TooltipDefinition>
            ) : (
              <Tag
                className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                type={getTagType(entry?.priority)}>
                {entry.priority}
              </Tag>
            )}
          </>
        ),
      },
      status: {
        content: (
          <span className={styles.statusContainer}>
            <StatusIcon status={entry.status} />
            <span>{entry.status}</span>
          </span>
        ),
      },
    }));
  }, [visitQueueEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (visitQueueEntries?.length) {
    return (
      <div className={styles.container} data-floating-menu-container>
        <div className={styles.activeVisitsTableContainer}>
          <div className={styles.activeVisitsTableHeaderContainer}>
            <span className={styles.heading}>{t('activeVisits', 'Active visits')}</span>
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
              onClick={() => setShowOverlay(true)}
              iconDescription={t('addPatientList', 'Add patient to list')}>
              {t('addPatientList', 'Add patient to list')}
            </Button>
          </div>
          <DataTable
            headers={headerData}
            overflowMenuOnHover={isDesktop ? true : false}
            rows={tableRows}
            size={tableSize}
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
                    {rows.map((row) => (
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
                          <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 2} />
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} />}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activeVisitsTableContainer}>
      <div className={styles.activeVisitsTableHeaderContainer}>
        <label className={styles.heading}>{t('activeVisits', 'Active visits')}</label>
        <Button
          iconDescription={t('addPatientToList', 'Add patient to list')}
          kind="secondary"
          renderIcon={Add16}
          size="small">
          {t('addPatientList', 'Add patient to list')}
        </Button>
      </div>
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
          <Button kind="ghost" size="small" renderIcon={Add16} onClick={() => setShowOverlay(true)}>
            {t('addPatientToList', 'Add patient to list')}
          </Button>
        </Tile>
      </div>
    </div>
  );
};

export default ActiveVisitsTable;

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

function StatusIcon({ status }) {
  switch (status) {
    case queueStatus.WAITING:
      return <InProgress16 />;
    case queueStatus.IN_SERVICE:
      return <Group16 />;
    default:
      return null;
  }
}
