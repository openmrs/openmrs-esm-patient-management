import React from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import type { Appointment, RecurringPattern } from '../types';
import AppointmentsForm from './appointments-form.workspace';

interface ExportedAppointmentsFormProps {
  appointment?: Appointment;
  recurringPattern?: RecurringPattern;
}

interface ExportedAppointmentsFormGroupProps {
  patientUuid: string;
}

/**
 * Workspace used to create or edit an appointment in the patient chart (or app with compatible workspaceGroup)
 */
const ExportedAppointmentsForm: React.FC<
  Workspace2DefinitionProps<ExportedAppointmentsFormProps, {}, ExportedAppointmentsFormGroupProps>
> = ({ workspaceProps: { appointment, recurringPattern }, groupProps: { patientUuid }, ...rest }) => {
  return <AppointmentsForm workspaceProps={{ appointment, recurringPattern, patientUuid }} groupProps={{}} {...rest} />;
};

export default ExportedAppointmentsForm;
