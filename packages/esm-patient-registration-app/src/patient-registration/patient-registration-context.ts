import React, { SetStateAction } from 'react';
import { FormValues, CapturePhotoProps } from './patient-registration-types';

type PatientRegistrationContextProps = {
  identifierTypes: Array<any>;
  values: FormValues;
  validationSchema: any;
  setValidationSchema: (value: any) => void;
  inEditMode: boolean;
  fieldConfigs: Record<string, any>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setCapturePhotoProps: (value: SetStateAction<CapturePhotoProps>) => void;
  currentPhoto: string;
};

export const PatientRegistrationContext = React.createContext<PatientRegistrationContextProps | undefined>(undefined);

export const useFieldConfig = (field) => {
  const { fieldConfigs } = React.useContext(PatientRegistrationContext);
  return fieldConfigs[field];
};
