/**
 * A field-level validator for a person attribute marked `validation.required`. Formik runs it only while the field is
 * rendered, so an attribute that renders no input, such as one whose type fails to load or a hidden section's, never
 * blocks registration. The field's native `required` attribute blocks the submit without a message; this gives it one.
 */
export function requiredAttributeValidator(required: boolean, message: string) {
  return (value: unknown): string | undefined => {
    if (!required) {
      return undefined;
    }
    // A saved location attribute loads as a `{ uuid, display }` reference
    const empty = value && typeof value === 'object' ? !(value as { uuid?: string }).uuid : !value;
    return empty ? message : undefined;
  };
}
