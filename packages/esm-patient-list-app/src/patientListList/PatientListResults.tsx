import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientListData } from '../patientListData';
import PatientListTable from './patientListTable';

const PatientListResults: React.FC<{
  nameFilter?: string;
  setListStarred: (listUuid: string, star: boolean) => void;
  style?: CSSProperties;
  enter: Object;
  openPatientList: (uuid: string) => void;
}> = ({ nameFilter, setListStarred, style, enter, openPatientList }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<string>();
  const { data: data, loading } = usePatientListData(undefined, undefined, undefined, filter);

  React.useEffect(() => {
    setFilter(nameFilter);
  }, [enter]);

  return (
    <div style={{ ...style }}>
      <h3 style={{ padding: '1rem' }}>{t('patientListSearchResultHeader', 'Search results')}</h3>
      {data !== undefined && (
        <p style={{ color: '#525252', borderBottom: 'solid 1px #e0e0e0', margin: '0rem 1rem', fontSize: '0.75rem' }}>
          Found {data.length} lists
        </p>
      )}
      <PatientListTable
        loading={loading}
        patientData={data}
        setListStarred={setListStarred}
        style={{ paddingTop: '0.5rem' }}
        openPatientList={openPatientList}
      />
    </div>
  );
};

export default PatientListResults;
