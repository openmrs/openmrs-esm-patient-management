import { useSessionUser } from '@openmrs/esm-framework';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientListDataQuery } from '../api';
import PatientListTable from './patient-list-table.component';
import styles from './patient-list-list.scss';

interface PatientListResultsProps {
  nameFilter?: string;
  style?: CSSProperties;
  enter: Object;
  openPatientList: (uuid: string) => void;
}

const PatientListResults: React.FC<PatientListResultsProps> = ({ nameFilter, style, enter, openPatientList }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>();
  const userId = useSessionUser()?.user.uuid;
  const queryFilter = useMemo(() => ({ name: filter }), [filter]);
  const { data, isFetching, refetch } = usePatientListDataQuery(userId, queryFilter);

  useEffect(() => {
    setFilter(nameFilter);
  }, [enter]);

  return (
    <div style={{ ...style }}>
      <h3 className={styles.productiveHeading03}>{t('patientListSearchResultHeader', 'Search results')}</h3>
      {data && <p className={styles.resultCount}>Found {data.length} lists</p>}
      <div className={styles.patientListResultsTableContainer}>
        <PatientListTable
          loading={isFetching}
          patientLists={data}
          refetch={refetch}
          openPatientList={openPatientList}
        />
      </div>
    </div>
  );
};

export default PatientListResults;
