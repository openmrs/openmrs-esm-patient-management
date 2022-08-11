import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableExpandHeader,
  TableRow,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
} from '@carbon/react';
import { useLayoutType, isDesktop } from '@openmrs/esm-framework';
import { Observation } from '../visit.resource';
import EncounterObservations from './encounter-observations.component';
import styles from '../visit-detail-overview.scss';

interface EncounterListProps {
  encounters: Array<{
    id: any;
    time: any;
    encounterType: string;
    provider: string;
    obs: Array<Observation>;
  }>;
  visitUuid: string;
}

const EncounterListDataTable: React.FC<EncounterListProps> = ({ encounters, visitUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [headerWidth, setHeaderWidth] = useState(0);
  const headerRef = useRef(null);

  const headerData = useMemo(
    () => [
      {
        id: 1,
        header: t('time', 'Time'),
        key: 'time',
      },
      {
        id: 2,
        header: t('encounterType', 'Encounter Type'),
        key: 'encounterType',
      },
      {
        id: 3,
        header: t('provider', 'Provider'),
        key: 'provider',
      },
    ],
    [t],
  );

  useEffect(() => {
    setHeaderWidth(headerRef?.current?.clientWidth);
    const handler = () => setHeaderWidth(headerRef?.current?.clientWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return encounters.length !== 0 ? (
    <DataTable rows={encounters} headers={headerData} size={!isDesktop(layout) ? 'md' : 'sm'}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => {
        return (
          <TableContainer>
            <Table className={styles.customTable} {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header, i) =>
                    i === 0 ? (
                      <TableHeader id={`header_${visitUuid}_${i}`} ref={headerRef} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ) : (
                      <TableHeader id={`header_${visitUuid}_${i}`} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded && (
                      <TableExpandedRow
                        className={styles.expandedRow}
                        style={{ paddingLeft: isDesktop(layout) ? '3rem' : '4rem' }}
                        colSpan={headers.length + 2}>
                        <div style={{ marginLeft: headerWidth }}>
                          <EncounterObservations observations={encounters[i].obs} />
                        </div>
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    </DataTable>
  ) : (
    <div className={styles.encounterEmptyState}>
      <h4 className={styles.productiveHeading02}>{t('noEncountersFound', 'No encounters found')}</h4>
      <p className={`${styles.bodyLong01} ${styles.text02}`}>
        {t('thereIsNoInformationToDisplayHere', 'There is no information to display here')}
      </p>
    </div>
  );
};

export default EncounterListDataTable;
