import type { DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { type WardPatient } from '../../types';

export interface WardPatientNotesWorkspaceProps extends DefaultWorkspaceProps, WardPatient {}
