import React from 'react';
import { type WardPatientCardExtensionProps } from '../ward-patient-card';
import WardPatientCodedObsTags from '../row-elements/ward-patient-coded-obs-tags';
import { useConfig } from '@openmrs/esm-framework';
import { type ColoredObsTagsCardRowConfigObject } from '../../config-schema-extension-colored-obs-tags';

const ColoredObsTagsCardRowExtension: React.FC<WardPatientCardExtensionProps> = ({ patient, visit }) => {
  const config = useConfig<ColoredObsTagsCardRowConfigObject>();

  return <WardPatientCodedObsTags config={config} patient={patient} visit={visit} />;
};

export default ColoredObsTagsCardRowExtension;
