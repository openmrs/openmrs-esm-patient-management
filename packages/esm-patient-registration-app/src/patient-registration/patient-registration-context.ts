import { createContext, SetStateAction, useContext } from 'react';
import { FormValues, CapturePhotoProps, CustomPatientIdentifierType } from './patient-registration-types';

export interface PatientRegistrationContextProps {
  identifierTypes: Array<CustomPatientIdentifierType>;
  values: FormValues;
  validationSchema: any;
  setValidationSchema(value: any): void;
  inEditMode: boolean;
  fieldConfigs: Record<string, any>;
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  setCapturePhotoProps(value: SetStateAction<CapturePhotoProps>): void;
  currentPhoto: string;
  togglePatientIdentifiersOverlay: (action: boolean) => void;
}

export const PatientRegistrationContext = createContext<PatientRegistrationContextProps | undefined>(undefined);

export function useFieldConfig(field: string) {
  const { fieldConfigs } = useContext(PatientRegistrationContext);
  return fieldConfigs[field];
}
