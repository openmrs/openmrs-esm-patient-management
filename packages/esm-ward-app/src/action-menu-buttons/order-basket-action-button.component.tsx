import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, AddIcon, ShoppingCartIcon, usePatient } from '@openmrs/esm-framework';
import { type WardPatientWorkspaceDefinition } from '../types';

/**
 * This order basket icon appears on the workspace action menu when a Ward Patient Card is clicked
 */
function WardPatientOrderBasketActionButton({ groupProps: { wardPatient } }: WardPatientWorkspaceDefinition) {
  const { t } = useTranslation();
  const { patient: fhirPatient } = usePatient(wardPatient.patient.uuid);

  return (
    <ActionMenuButton2
      icon={(props) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      workspaceToLaunch={{
        workspaceName: 'ward-patient-order-basket-workspace',
        windowProps: {
          patientUuid: wardPatient.patient.uuid,
          patient: fhirPatient,
          visitContext: wardPatient.visit,
          drugOrderWorkspaceName: 'ward-patient-order-basket-add-drug-order-workspace',
          labOrderWorkspaceName: 'ward-patient-order-basket-add-lab-order-workspace',
          generalOrderWorkspaceName: 'ward-patient-order-basket-add-general-order-workspace',
        },
      }}
    />
  );
}

export default WardPatientOrderBasketActionButton;
