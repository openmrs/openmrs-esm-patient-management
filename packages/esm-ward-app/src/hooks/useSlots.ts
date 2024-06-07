import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { WardPatientConfig } from '../config-schema';

// export function useSlots() {
//   const { admissionRequestPatientConfig } = useConfig<WardPatientConfig>();
//   const { admissionCardSlotTypes, admissionCardSlots } = admissionRequestPatientConfig;

//   const admissionRequestPatientSlotTypes:React.ReactNode[] = useMemo(() => {
//     return admissionCardSlotTypes.map((slotType) => getAdmissionPatientSlotType(slotType));
//   }, [slotTypes]);
// }

// function getAdmissionPatientSlotType(slotType:Pick<WardPatientConfig,{admissionRequestPatientConfig:}>) {
//   const { id,elements } = slotType;
//   switch (id) {
//     case 'header-slot':
//       // const
//       return getAdmissionPatientSlotWithElements(elements);
//   }
// }

// function getAdmissionPatientSlotWithElements(elements):React.ReactNode{
//   return <div></div>;
// }
