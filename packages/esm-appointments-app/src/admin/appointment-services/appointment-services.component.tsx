import React from 'react';
import { TextInput, TimePicker, TimePickerSelect, SelectItem, Dropdown, Button, ButtonSet } from '@carbon/react';
import styles from './appointment-services.scss';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { validationSchema } from './appointment-services-validation';
import { useAppointmentServices } from './appointment-services-hook';
import { showNotification, showToast, useLocations } from '@openmrs/esm-framework';
import { AppointmentService } from '../../types';
import { closeOverlay } from '../../hooks/useOverlay';

interface AppointmentServicesProps {}

const AppointmentServices: React.FC<AppointmentServicesProps> = () => {
  const { t } = useTranslation();
  const { appointmentServiceInitialValue, addNewAppointmentService } = useAppointmentServices();

  const locations = useLocations();
  const handleSubmit = async (values: AppointmentService, helpers: FormikHelpers<AppointmentService>) => {
    const payload = {
      name: values.name,
      startTime: values.startTime.concat(':00'),
      endTime: values.endTime.concat(':00'),
      durationMins: values.durationMins,
      color: values.color,
      locationUuid: values.location.uuid,
    };
    addNewAppointmentService(payload).then(
      ({ status }) => {
        if (status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentServiceCreate', 'Appointment service created successfully'),
            title: t('appointmentService', 'Appointment service'),
          });
          closeOverlay();
        }
      },
      (error) => {
        showNotification({
          title: t('errorMessage', 'Error creating appointment service'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };
  return (
    <Formik
      onSubmit={handleSubmit}
      isInitialValid={false}
      validationSchema={validationSchema}
      initialValues={appointmentServiceInitialValue}>
      {(props) => {
        return (
          <Form onSubmit={props.handleSubmit} className={styles.appointmentServiceContainer}>
            <p className={styles.formTitle}>{t('createAppointmentService', 'Create appointment service')}</p>
            <TextInput
              light
              id="name"
              invalidText={t(props.errors.name)}
              labelText={t('appointmentServiceName', 'Appointment service name')}
              placeholder={t('appointmentServiceName', 'Appointment service name')}
              invalid={!!(props.touched && props.errors.name)}
              onChange={props.handleChange}
              value={props.values.name}
              name="name"
              onBlue={props.handleBlur}
            />
            <TimePicker
              light
              className={styles.timePickerInput}
              invalid={!!(props.touched && props.errors.startTime)}
              pattern="([\d]+:[\d]{2})"
              name="startTime"
              value={props.values.startTime}
              onChange={props.handleChange}
              labelText={t('startTime', 'Start Time')}
              id="start-time-picker">
              <TimePickerSelect
                name="startTimeTimeFormat"
                onChange={props.handleChange}
                value={props.values.startTimeTimeFormat}
                invalid={!!(props.touched && props.errors.startTimeTimeFormat)}
                id="start-time-picker"
                labelText={t('time', 'Time')}
                aria-label={t('time', 'Time')}>
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>

            <TimePicker
              light
              invalid={!!(props.touched && props.errors.endTime)}
              className={styles.timePickerInput}
              pattern="([\d]+:[\d]{2})"
              value={props.values.endTime}
              name="endTime"
              onChange={props.handleChange}
              labelText={t('endTime', 'End Time')}
              id="end-time-picker">
              <TimePickerSelect
                name="endTimeTimeFormat"
                onChange={props.handleChange}
                id="end-time-picker"
                value={props.values.endTimeTimeFormat}
                labelText={t('time', 'Time')}
                aria-label={t('time', 'Time')}>
                <SelectItem value="AM" text="AM" />
                <SelectItem value="PM" text="PM" />
              </TimePickerSelect>
            </TimePicker>
            <TextInput
              light
              id="durationMins"
              invalidText={t(props.errors.durationMins)}
              labelText={t('durationMins', 'Duration min')}
              placeholder={t('durationMins', 'Duration min')}
              invalid={!!(props.touched && props.errors.durationMins)}
              onChange={props.handleChange}
              value={props.values.durationMins}
              name="durationMins"
            />
            <Dropdown
              light
              id="default"
              titleText={t('selectLocation', 'Select location')}
              label={t('selectLocation', 'Select location')}
              items={locations}
              itemToString={(item) => (item ? item.display : '')}
              selectedItem={props.values.location}
              invalid={!!(props.touched && props.errors.location?.uuid)}
              name="location"
              onChange={({ selectedItem }) => props.setValues({ ...props.values, location: selectedItem })}
            />
            <TextInput
              light
              invalid={!!(props.touched && props.errors.color)}
              onChange={props.handleChange}
              invalidText={props.errors.color}
              labelText={t('appointmentColor', 'Appointment color')}
              type="color"
              name="color"
            />
            <ButtonSet className={styles.buttonSet}>
              <Button
                onClick={closeOverlay}
                style={{ maxWidth: 'none', width: '50%' }}
                className={styles.button}
                kind="secondary">
                {t('discard', 'Discard')}
              </Button>
              <Button
                disabled={!props.isValid}
                style={{ maxWidth: 'none', width: '50%' }}
                className={styles.button}
                kind="primary"
                type="submit">
                {t('save', 'Save')}
              </Button>
            </ButtonSet>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AppointmentServices;
