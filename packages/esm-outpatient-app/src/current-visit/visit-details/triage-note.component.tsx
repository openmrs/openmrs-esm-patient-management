import React from 'react';
import { Tag, Button } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { DiagnosisItem, Note } from '../current-visit.resource';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import { navigate } from '@openmrs/esm-framework';
import styles from './triage-note.scss';

interface TriageNoteComponentProps {
  notes: Array<Note>;
  diagnoses: Array<DiagnosisItem>;
  patientUuid: string;
}

const TriageNote: React.FC<TriageNoteComponentProps> = ({ notes, patientUuid, diagnoses }) => {
  const { t } = useTranslation();

  return (
    <div>
      {diagnoses.length > 0
        ? diagnoses.map((d: DiagnosisItem, ind) => (
            <Tag type="blue" size="md">
              {d.diagnosis}
            </Tag>
          ))
        : null}
      {notes.length ? (
        notes.map((note: Note, i) => (
          <div>
            <p>{note.note}</p>
            <p className={styles.subHeading}>
              {note.provider.name ? <span> {note.provider.name} </span> : null} · {note.time}
            </p>
          </div>
        ))
      ) : (
        <div>
          <p className={styles.emptyText}>Triage has not yet been completed</p>
          <Button
            size="small"
            kind="ghost"
            renderIcon={ArrowRight16}
            onClick={() => navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` })}
            iconDescription={t('triageForm', 'Triage form')}>
            {t('triageForm', 'Triage form')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TriageNote;
