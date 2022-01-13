import { createContext, SetStateAction, Dispatch, useContext } from 'react';
import { FormValues, CapturePhotoProps, PatientIdentifierType } from './patient-registration-types';

export interface PatientRegistrationContextProps {
  values: FormValues;
  validationSchema: any;
  setValidationSchema(value: any): void;
  inEditMode: boolean;
  fieldConfigs: Record<string, any>;
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  setCapturePhotoProps(value: SetStateAction<CapturePhotoProps>): void;
  currentPhoto: string;
}

export const PatientRegistrationContext = createContext<PatientRegistrationContextProps | undefined>(undefined);

export function useFieldConfig(field: string) {
  const { fieldConfigs } = useContext(PatientRegistrationContext);
  return fieldConfigs[field];
}
