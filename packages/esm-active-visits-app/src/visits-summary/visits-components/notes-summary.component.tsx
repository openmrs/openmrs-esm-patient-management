import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import type { Note } from '../visit.resource';
import { EmptyDataIllustration } from '../../active-visits-widget/empty-data-illustration.component';
import styles from '../visit-detail-overview.scss';

interface NotesSummaryProps {
  notes: Array<Note>;
}

const NotesSummary: React.FC<NotesSummaryProps> = ({ notes }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  return (
    <>
      {notes.length ? (
        notes.map((note: Note, i) => (
          <div className={styles.notesContainer} key={i}>
            <p className={classNames(styles.noteText, styles.bodyLong01)} data-testid="note">
              {note.note}
            </p>
            <p className={styles.metadata}>
              {note.time} {note.provider.name ? <span>&middot; {note.provider.name} </span> : null}
              {note.provider.role ? <span>&middot; {note.provider.role}</span> : null}
            </p>
          </div>
        ))
      ) : (
        <div className={styles.emptyStateContainer}>
          <Layer>
            <Tile className={styles.tile}>
              <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
                <h4>{t('notes', 'Notes')}</h4>
              </div>
              <EmptyDataIllustration />
              <p className={styles.emptyStateContent}>
                {t('noNotesToShowForPatient', 'There are no notes to display for this patient')}
              </p>
            </Tile>
          </Layer>
        </div>
      )}
    </>
  );
};

export default NotesSummary;
