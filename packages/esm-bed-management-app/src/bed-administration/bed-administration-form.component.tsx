import React, { useState } from "react";
import capitalize from "lodash-es/capitalize";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ComboBox,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
  InlineNotification,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Location } from "@openmrs/esm-framework";
import type { BedType, InitialData } from "../types";
import { BedAdministrationData } from "./bed-administration-types";

const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed) || parsed < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a valid number",
    });
    return z.NEVER;
  }
  return val;
});

const BedAdministrationSchema = z.object({
  bedId: z.string().min(5).max(255),
  description: z.string().max(255),
  bedRow: numberInString,
  bedColumn: numberInString,
  location: z
    .object({ display: z.string(), uuid: z.string() })
    .refine((value) => value.display != "", "Please select a valid location"),
  occupancyStatus: z
    .string()
    .refine((value) => value != "", "Please select a valid occupied status"),
  bedType: z
    .string()
    .refine((value) => value != "", "Please select a valid bed type"),
});

interface BedAdministrationFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  availableBedTypes: Array<BedType>;
  allLocations: Location[];
  handleCreateQuestion?: (formData: BedAdministrationData) => void;
  headerTitle: string;
  occupancyStatuses: string[];
  initialData: InitialData;
}

interface ErrorType {
  message: string;
}

const BedAdministrationForm: React.FC<BedAdministrationFormProps> = ({
  showModal,
  onModalChange,
  availableBedTypes,
  allLocations,
  handleCreateQuestion,
  headerTitle,
  occupancyStatuses,
  initialData,
}) => {
  const { t } = useTranslation();
  const [occupancyStatus, setOccupancyStatus] = useState(
    capitalize(initialData.status)
  );
  const [selectedBedType] = useState(initialData.bedType.name);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState("");

  const filterLocationNames = (location) => {
    return (
      location.item.display
        ?.toLowerCase()
        .includes(location?.inputValue?.toLowerCase()) ?? []
    );
  };

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<BedAdministrationData>({
    mode: "all",
    resolver: zodResolver(BedAdministrationSchema),
    defaultValues: {
      bedId: initialData.bedNumber || "",
      description: initialData.description || "",
      bedRow: initialData.row.toString() || "0",
      bedColumn: initialData.column.toString() || "0",
      location: initialData.location || {},
      occupancyStatus: capitalize(initialData.status) || occupancyStatus,
      bedType: initialData.bedType.name || "",
    },
  });

  const onSubmit = (formData: BedAdministrationData) => {
    const result = BedAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleCreateQuestion(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <ComposedModal
      open={showModal}
      onClose={() => onModalChange(false)}
      preventCloseOnClickOutside
    >
      <ModalHeader title={headerTitle} />
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <ModalBody hasScrollingContent>
          <Stack gap={3}>
            <FormGroup legendText={""}>
              <Controller
                name="bedId"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="bedId"
                      labelText={t("bedId", "Bed number")}
                      placeholder={t("bedIdPlaceholder", "e.g. BMW-201")}
                      invalidText={fieldState.error?.message}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextArea
                      rows={2}
                      id="description"
                      invalidText={fieldState?.error?.message}
                      labelText={t("description", "Bed description")}
                      {...field}
                      placeholder={t(
                        "description",
                        "Enter the bed description"
                      )}
                    />
                  </>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedRow"
                control={control}
                render={({ fieldState, field }) => (
                  <NumberInput
                    hideSteppers
                    id="bedRow"
                    label="Bed row"
                    labelText="Bed row"
                    invalidText={fieldState?.error?.message}
                    {...field}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedColumn"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    hideSteppers
                    id="bedColumn"
                    label="Bed column"
                    labelText="Bed column"
                    invalidText={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="location"
                control={control}
                render={({
                  fieldState,
                  field: { onChange, onBlur, value, ref },
                }) => (
                  <ComboBox
                    aria-label={t("location", "Location")}
                    shouldFilterItem={filterLocationNames}
                    id="location"
                    label={t("location", "Location")}
                    invalidText={fieldState?.error?.message}
                    items={allLocations}
                    onBlur={onBlur}
                    ref={ref}
                    selectedItem={value}
                    onChange={({ selectedItem }) => onChange(selectedItem)}
                    itemToString={(location) => location?.display ?? ""}
                    placeholder={t(
                      "selectBedLocation",
                      "Select a bed location"
                    )}
                    titleText={t("bedLocation", "Location")}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="occupancyStatus"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    id="occupancyStatus"
                    labelText={t("occupancyStatus", "Occupied Status")}
                    invalidText={fieldState.error?.message}
                    defaultValue={occupancyStatus}
                    onChange={(event) => setOccupancyStatus(event.target.value)}
                    value={occupancyStatus}
                    {...field}
                  >
                    <SelectItem
                      text={t("chooseOccupiedStatus", "Choose occupied status")}
                      value=""
                    />
                    {occupancyStatuses.map((occupancyStatus, index) => (
                      <SelectItem
                        text={t("occupancyStatus", `${occupancyStatus}`)}
                        value={t("occupancyStatus", `${occupancyStatus}`)}
                        key={`occupancyStatus-${index}`}
                      />
                    ))}
                  </Select>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedType"
                control={control}
                render={({ field }) => (
                  <Select
                    id="bedType"
                    labelText={t("bedType", "Bed type")}
                    invalidText={t("required", "Required")}
                    defaultValue={selectedBedType}
                    {...field}
                  >
                    <SelectItem
                      text={t("chooseBedtype", "Choose a bed type")}
                    />
                    {availableBedTypes.map((bedType, index) => (
                      <SelectItem
                        text={bedType.name}
                        value={bedType.name}
                        key={`bedType-${index}`}
                      >
                        {bedType.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </FormGroup>
            {showErrorNotification && (
              <InlineNotification
                lowContrast
                title={t("error", "Error")}
                style={{ minWidth: "100%", margin: "0rem", padding: "0rem" }}
                role="alert"
                kind="error"
                subtitle={t("pleaseFillField", formStateError) + "."}
                onClose={() => setShowErrorNotification(false)}
              />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => onModalChange(false)} kind="secondary">
            {t("cancel", "Cancel")}
          </Button>
          <Button disabled={!isDirty} type="submit">
            <span>{t("save", "Save")}</span>
          </Button>
        </ModalFooter>
      </Form>
    </ComposedModal>
  );
};

export default BedAdministrationForm;
