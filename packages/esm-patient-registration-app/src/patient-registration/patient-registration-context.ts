import { createContext, type SetStateAction, useContext } from 'react';
import { type PatientIdentifierType, useConfig } from '@openmrs/esm-framework';
import { type CapturePhotoProps, type FormValues } from './patient-registration.types';
import { type RegistrationConfig } from '../config-schema';
import { type FormHelpers } from './form-adapter';

export interface PatientRegistrationContextProps {
  currentPhoto: string;
  identifierTypes: Array<PatientIdentifierType>;
  inEditMode: boolean;
  initialFormValues: FormValues;
  setCapturePhotoProps(value: SetStateAction<CapturePhotoProps>): void;
  setFieldTouched: FormHelpers['setFieldTouched'];
  setFieldValue: FormHelpers['setFieldValue'];
  setInitialFormValues?: React.Dispatch<SetStateAction<FormValues>>;
  values: FormValues;
}

export const PatientRegistrationContext = createContext<PatientRegistrationContextProps | undefined>(undefined);

export const PatientRegistrationContextProvider = PatientRegistrationContext.Provider;

export const usePatientRegistrationContext = () => {
  const context = useContext(PatientRegistrationContext);
  if (!context) {
    throw new Error('usePatientRegistrationContext must be used within a PatientRegistrationContextProvider');
  }
  return context;
};

export function useFieldConfig(field: string) {
  const { fieldConfigurations } = useConfig<RegistrationConfig>();
  return fieldConfigurations[field];
}
