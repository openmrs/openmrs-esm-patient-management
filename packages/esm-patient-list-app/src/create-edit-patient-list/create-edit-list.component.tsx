import React, { useCallback, SyntheticEvent, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Layer, TextArea, TextInput } from '@carbon/react';
import { useLayoutType, showToast, useSession, useConfig } from '@openmrs/esm-framework';
import type { ConfigSchema } from '../config-schema';
import type { NewCohortData, OpenmrsCohort } from '../api/types';
import { createPatientList, editPatientList } from '../api/api-remote';
import Overlay from '../overlay.component';
import styles from './create-edit-patient-list.scss';

interface CreateEditPatientListProps {
  close: () => void;
  isEditing?: boolean;
  patientListDetails?: OpenmrsCohort;
  onSuccess?: () => void;
}

const CreateEditPatientList: React.FC<CreateEditPatientListProps> = ({
  close,
  isEditing = false,
  patientListDetails = null,
  onSuccess = () => {},
}) => {
  const { t } = useTranslation();
  const id = useId();
  const config = useConfig() as ConfigSchema;
  const isTablet = useLayoutType() === 'tablet';
  const responsiveLevel = isTablet ? 1 : 0;
  const session = useSession();
  const { user } = session;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohortDetails, setCohortDetails] = useState<NewCohortData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    setCohortDetails({
      name: patientListDetails?.name || '',
      description: patientListDetails?.description || '',
    });
  }, [user, patientListDetails]);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    if (isEditing) {
      editPatientList(patientListDetails.uuid, cohortDetails)
        .then(() => {
          showToast({
            title: t('updated', 'Updated'),
            description: t('listUpdated', 'List updated successfully'),
            kind: 'success',
          });

          onSuccess();
          setIsSubmitting(false);
          close();
        })
        .catch((error) => {
          console.error('Error updating list: ', error);
          showToast({
            title: t('errorUpdatingList', 'Error updating list'),
            description: t('problemUpdatingList', 'There was a problem updating the list'),
            kind: 'error',
          });
          setIsSubmitting(false);
        });
    }

    if (!isEditing) {
      createPatientList({
        ...cohortDetails,
        cohortType: config?.myListCohortTypeUUID,
        location: session?.sessionLocation?.uuid,
      })
        .then(() => {
          showToast({
            title: t('created', 'Created'),
            description: `${t('listCreated', 'List created successfully')}`,
            kind: 'success',
          });
          onSuccess();
          setIsSubmitting(false);
          close();
        })
        .catch((error) => {
          console.error('Error creating list: ', error);
          showToast({
            title: t('errorCreatingList', 'Error creating list'),
            description: t('problemCreatingList', 'There was a problem creating the list'),
            kind: 'error',
          });
          setIsSubmitting(false);
        });
    }
  }, [
    close,
    cohortDetails,
    config?.myListCohortTypeUUID,
    isEditing,
    patientListDetails?.uuid,
    onSuccess,
    session.sessionLocation?.uuid,
    t,
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
      buttonsGroup={
        <ButtonSet className={styles.buttonsGroup}>
          <Button onClick={close} kind="secondary" size="xl">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} size="xl" disabled={isSubmitting}>
            {isSubmitting
              ? t('submitting', 'Submitting')
              : isEditing
              ? t('editList', 'Edit list')
              : t('createList', 'Create list')}
          </Button>
        </ButtonSet>
      }
      close={close}
      header={
        isEditing ? t('editPatientListHeader', 'Edit patient list') : t('newPatientListHeader', 'New patient list')
      }>
      <h4 className={styles.header}>{t('configureList', 'Configure your patient list using the fields below')}</h4>
      <div>
        <Layer level={responsiveLevel}>
          <TextInput
            id={`${id}-input`}
            labelText={t('newPatientListNameLabel', 'List name')}
            name="name"
            onChange={handleChange}
            placeholder={t('listNamePlaceholder', 'e.g. Potential research participants')}
            value={cohortDetails?.name}
          />
        </Layer>
      </div>
      <div className={styles.input}>
        <Layer level={responsiveLevel}>
          <TextArea
            id={`${id}-textarea`}
            labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
            name="description"
            onChange={handleChange}
            placeholder={t(
              'listDescriptionPlaceholder',
              'e.g. Patients with diagnosed asthma who may be willing to be a part of a university research study',
            )}
            value={cohortDetails?.description}
          />
        </Layer>
      </div>
    </Overlay>
  );
};

export default CreateEditPatientList;
