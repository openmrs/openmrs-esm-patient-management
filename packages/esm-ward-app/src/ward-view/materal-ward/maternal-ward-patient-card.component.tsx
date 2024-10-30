import { Tag } from '@carbon/react';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatient } from '../../types';
import CodedObsTagsRow from '../../ward-patient-card/card-rows/coded-obs-tags-row.component';
import MotherChildRow from '../../ward-patient-card/card-rows/mother-child-row.component';
import PendingItemsRow from '../../ward-patient-card/card-rows/pending-items-row.component';
import WardPatientObs from '../../ward-patient-card/row-elements/ward-patient-obs';
import WardPatientTimeOnWard from '../../ward-patient-card/row-elements/ward-patient-time-on-ward';
import WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import MaternalWardPatientCardHeader from './maternal-ward-patient-card-header.component';
import maternalWardPatientCardStyles from './maternal-ward-patient-card.scss';

export interface MaternalWardPatientCardProps {
  /**
   * the patient to render. Note that this patient can be a mother or a child
   */
  wardPatient: WardPatient;

  /**
   * Children of the wardPatient occupying the same bed. A non-empty array implies that the wardPatient
   * is a mother.
   */
  childrenOfWardPatientInSameBed: WardPatient[];
}

/**
 * One major different between MaternalWardPatientCard vs DefaultWardPatientCard, besides the
 * different elements being rendered, is that it renders just not the patient card for the patient,
 * but also those of the the patient's children in same bed. This is done to ensure that the children's
 * patient cards are always rendered right below the mother's.
 *
 * @param param0
 * @returns
 */
const MaternalWardPatientCard: React.FC<MaternalWardPatientCardProps> = (props) => {
  const { wardPatient, childrenOfWardPatientInSameBed } = props;
  const { patient, visit, bed, inpatientAdmission } = wardPatient;
  const { encounterAssigningToCurrentInpatientLocation } = inpatientAdmission ?? {};

  const card = (
    <>
      <WardPatientCard wardPatient={wardPatient}>
        <MaternalWardPatientCardHeader {...{ wardPatient }} />
        <div className={classNames(styles.wardPatientCardRow, styles.dotSeparatedChildren)}>
          <WardPatientTimeOnWard
            encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
          />
          <WardPatientObs id={'gravida'} patient={patient} visit={visit} />
        </div>
        <PendingItemsRow id={'pending-items'} wardPatient={wardPatient} />
        <CodedObsTagsRow id="pregnancy-complications" {...wardPatient} />
        <MotherChildRow {...props} />
      </WardPatientCard>
      {childrenOfWardPatientInSameBed?.map((childWardPatient) => {
        return (
          <React.Fragment key={childWardPatient.patient.uuid}>
            <MotherChildBedShareDivider />
            <WardPatientCard wardPatient={childWardPatient}>
              <MaternalWardPatientCardHeader wardPatient={childWardPatient} />
              <PendingItemsRow id={'pending-items'} wardPatient={childWardPatient} />
            </WardPatientCard>
          </React.Fragment>
        );
      })}
    </>
  );

  if (bed) {
    return card;
  } else {
    return (
      <div className={styles.unassignedPatient}>
        <div key={'unassigned-bed-pt-' + wardPatient.patient.uuid}>{card}</div>
      </div>
    );
  }
};

const MotherChildBedShareDivider = () => {
  const { t } = useTranslation();
  return (
    <div className={maternalWardPatientCardStyles.motherChildBedDivider}>
      <div className={maternalWardPatientCardStyles.motherChildBedDividerLine}></div>
      <Tag type="purple">{t('motherChildBedShare', 'Mother / Child')}</Tag>
      <div className={maternalWardPatientCardStyles.motherChildBedDividerLine}></div>
    </div>
  );
};

export default MaternalWardPatientCard;
