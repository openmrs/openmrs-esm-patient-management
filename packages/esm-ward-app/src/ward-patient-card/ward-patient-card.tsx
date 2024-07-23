import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type WardPatientCardProps } from '../types';
import { usePatientCardRows } from './ward-patient-card-row.resources';
import styles from './ward-patient-card.scss';
import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import { type ActiveBedSelection, getWardStore, type WardStoreState } from '../store';
import classNames from 'classnames';

const WardPatientCard: React.FC<WardPatientCardProps> = (props) => {
  const wardStore = getWardStore();
  const { locationUuid } = useParams();
  const patientCardRows = usePatientCardRows(locationUuid);
  const [activeBedSelection, setActiveBedSelection] = useState<ActiveBedSelection | null>(null);

  const updateActiveBedSelection = useCallback((state: WardStoreState) => {
    setActiveBedSelection(state.activeBedSelection);
  }, []);

  useEffect(() => {
    updateActiveBedSelection(getWardStore().getState());
    getWardStore().subscribe(updateActiveBedSelection);
  }, [updateActiveBedSelection]);

  return (
    <div className={styles.wardPatientCard}>
      {patientCardRows.map((WardPatientCardRow, i) => (
        <WardPatientCardRow key={i} {...props} />
      ))}
      <button
        className={classNames(styles.wardPatientCardButton, {
          [styles.activeWardPatientCardButton]:
            activeBedSelection?.bed.uuid === props.bed?.uuid &&
            activeBedSelection?.patient.uuid === props.patient?.uuid,
        })}
        onClick={() => {
          wardStore.setState({ activeBedSelection: { ...props } });
          launchWorkspace('ward-patient-workspace');
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(props.patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
