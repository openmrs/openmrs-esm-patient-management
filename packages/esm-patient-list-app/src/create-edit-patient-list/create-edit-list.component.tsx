import React, { useCallback, SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, TextArea, TextInput, ButtonSet } from '@carbon/react';
import { useLayoutType, showToast, useSession, useConfig } from '@openmrs/esm-framework';
import { createPatientList, editPatientList } from '../api/api-remote';
import { OpenmrsCohort, NewCohortData } from '../api/types';
import Overlay from '../overlay.component';
import styles from './create-edit-patient-list.scss';
import { ConfigSchema } from '../config-schema';

interface CreateEditPatientListProps {
  close: () => void;
  edit?: boolean;
  patientListDetails?: OpenmrsCohort;
  onSuccess?: () => void;
}

const CreateEditPatientList: React.FC<CreateEditPatientListProps> = ({
  close,
  edit = false,
  patientListDetails = null,
  onSuccess = () => {},
}) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigSchema;
  const session = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [cohortDetails, setCohortDetails] = useState<NewCohortData>({
    name: '',
    description: '',
  });
  const isTablet = useLayoutType() === 'tablet';
  const user = useSession();

  useEffect(() => {
    setCohortDetails({
      name: patientListDetails?.name || '',
      description: patientListDetails?.description || '',
    });
  }, [user, patientListDetails]);

  const createPL = useCallback(() => {
    // set submitting
    setSubmitting(true);
    if (!edit) {
      createPatientList({
        ...cohortDetails,
        location: session?.sessionLocation?.uuid,
        cohortType: config?.myListCohortTypeUUID,
      })
        .then(() =>
          showToast({
            title: t('created', 'Created'),
            description: `${t('listCreated', 'List created successfully')}`,
            kind: 'success',
          }),
        )
        .then(() => {
          onSuccess();
          setSubmitting(false);
        })
        .then(close)
        .catch((e) => {
          showToast({
            title: t('error', 'Error creating list'),
            description: e?.message,
            kind: 'error',
          });
          setSubmitting(false);
        });
    } else {
      editPatientList(patientListDetails.uuid, cohortDetails)
        .then(() =>
          showToast({
            title: t('updated', 'Updated'),
            description: t('listUpdated', 'List updated successfully'),
            kind: 'success',
          }),
        )
        .then(() => {
          onSuccess();
          setSubmitting(false);
        })
        .then(close)
        .catch((e) => {
          showToast({
            title: t('errorUpdatingList', 'Error updating list'),
            description: e?.message,
            kind: 'error',
          });
          setSubmitting(false);
        });
    }
  }, [
    close,
    cohortDetails,
    config?.myListCohortTypeUUID,
    patientListDetails?.uuid,
    onSuccess,
    session.sessionLocation?.uuid,
    t,
    edit,
  ]);

  const handleChange = useCallback(
    ({ currentTarget }: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCohortDetails((cohortDetails) => ({
        ...cohortDetails,
        [currentTarget?.name]: currentTarget?.value,
      }));
    },
    [setCohortDetails],
  );

  return (
    <Overlay
      header={!edit ? t('newPatientListHeader', 'New patient list') : t('editPatientListHeader', 'Edit patient list')}
      close={close}
      buttonsGroup={
        <ButtonSet className={styles.buttonsGroup}>
          <Button onClick={close} kind="secondary" size="xl">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={createPL} size="xl" disabled={submitting}>
            {submitting
              ? t('submitting', 'Submitting')
              : !edit
              ? t('createList', 'Create list')
              : t('editList', 'Edit list')}
          </Button>
        </ButtonSet>
      }>
      <h4 className={styles.header}>{t('configureList', 'Configure your patient list using the fields below')}</h4>
      <div>
        <Layer level={isTablet ? 1 : 0}>
          <TextInput
            labelText={t('newPatientListNameLabel', 'List name')}
            placeholder={t('listNamePlaceholder', 'e.g. Potential research participants')}
            id="list_name"
            name="name"
            onChange={handleChange}
            value={cohortDetails?.name}
          />
        </Layer>
      </div>
      <div className={styles.input}>
        <Layer level={isTablet ? 1 : 0}>
          <TextArea
            id="list_description"
            name="description"
            onChange={handleChange}
            placeholder={t(
              'listDescriptionPlaceholder',
              'e.g. Patients with diagnosed asthma who may be willing to be a part of a university research study',
            )}
            labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
            value={cohortDetails?.description}
          />
        </Layer>
      </div>
    </Overlay>
  );
};

export default CreateEditPatientList;
