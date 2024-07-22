import React from 'react';
import styles from './admission-request-card.scss';
import { useParams } from 'react-router-dom';
import { formatDatetime, getLocale, useConfig, type Patient } from '@openmrs/esm-framework';
import {
  getPatientCardElementFromDefinition,
  usePatientCardRows,
} from '../../ward-patient-card/ward-patient-card-row.resources';
import type { WardConfigObject } from '../../config-schema';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';
import WardPatientGender from '../../ward-patient-card/row-elements/ward-patient-gender.component';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age';
import type { InpatientRequest } from '../../types';
import classNames from 'classnames';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import AdmissionRequestCardActions from './admission-request-card-actions.component';

interface AdmissionRequestCardProps extends InpatientRequest {}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({ patient, dispositionEncounter }) => {
  return (
    <div className={styles.admissionRequestCard}>
      <AdmissionRequestCardHeader patient={patient} dispositionEncounter={dispositionEncounter} />
      <AdmissionRequestCardActions patient={patient} dispositionEncounter={dispositionEncounter} />
    </div>
  );
};

export default AdmissionRequestCard;
