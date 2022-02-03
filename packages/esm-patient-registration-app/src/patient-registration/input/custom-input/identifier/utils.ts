import { PatientIdentifierType } from '../../../patient-registration-types';

export function shouldBlockPatientIdentifierInOfflineMode(identifierType: PatientIdentifierType) {
  // Patient Identifiers which are unique and can be manually entered are prohibited while offline because
  // of the chance of generating conflicts when syncing later.
  return (
    identifierType.uniquenessBehavior === 'UNIQUE' &&
    !identifierType.identifierSources.some(
      (source) =>
        !source.autoGenerationOption.manualEntryEnabled && source.autoGenerationOption.automaticGenerationEnabled,
    )
  );
}
