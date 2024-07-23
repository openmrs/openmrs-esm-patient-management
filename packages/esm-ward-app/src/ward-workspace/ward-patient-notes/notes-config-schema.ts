import { Type } from '@openmrs/esm-framework';

export default {
  clinicianEncounterRole: {
    _type: Type.UUID,
    _default: '4f10ad1a-ec49-48df-98c7-1391c6ac7f05',
  },
  visitDiagnosesConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  encounterNoteTextConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '3cd9d956-26fe-102b-80cb-0017a47871b2',
  },
  encounterTypeUuid: {
    _type: Type.UUID,
    _default: '92fd09b4-5335-4f7e-9f63-b2a663fd09a6',
  },
  formConceptUuid: {
    _type: Type.ConceptUuid,
    _default: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
  },
};

export interface NoteConfigObject {
  clinicianEncounterRole: string;
  encounterNoteTextConceptUuid: string;
  encounterTypeUuid: string;
  formConceptUuid: string;
  visitDiagnosesConceptUuid: string;
}
