import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { type DiagnosisItem, type Note } from '../../types/index';
import styles from './triage-note.scss';

interface TriageNoteProps {
  notes: Array<Note>;
  diagnoses: Array<DiagnosisItem>;
  patientUuid: string;
}

const TriageNote: React.FC<TriageNoteProps> = ({ notes, patientUuid, diagnoses }) => {
  const { t } = useTranslation();

  return (
    <div>
      {diagnoses.length > 0
        ? diagnoses.map((d: DiagnosisItem, i: number) => (
            <Tag key={`diagnosis-${d.diagnosis}-${i}`} type="blue" size="md">
              {d.diagnosis}
            </Tag>
          ))
        : null}
      {notes.length ? (
        notes.map((note: Note, i) => (
          <div key={`note-${note.note}-${i}`}>
            <p>{note.note}</p>
            <p className={styles.subHeading}>
              {note.provider.name ? <span> {note.provider.name} · </span> : null}
              {note.time}
            </p>
          </div>
        ))
      ) : (
        <div>
          <p className={styles.emptyText}>
            {t('triageFormNotCompleted', 'Triage form has not been completed for this visit')}
          </p>
          <Button
            size="sm"
            kind="ghost"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
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
