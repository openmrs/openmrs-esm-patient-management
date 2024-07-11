import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  admissionLocationTagUuid: {
    _type: Type.UUID,
    _description:
      "UUID for the location tag of the `Admission Location`. Patients may only be admitted to inpatient care in a location with this tag",
    _default: "1c783dca-fd54-4ea8-a0fc-2875374e9cb6",
  },
};
