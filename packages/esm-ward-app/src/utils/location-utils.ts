import { type Location } from '@openmrs/esm-framework';

/**
 * Validates if an admission location is a descendant (sub-location) of a patient's visit location.
 *
 * This function recursively traverses the location hierarchy by walking up from the admission location
 * through parent locations until it either finds the visit location (indicating a valid descendant relationship)
 * or reaches the root of the hierarchy.
 *
 * The validation ensures that a patient can only be admitted to locations that fall within the hierarchy
 * of their current visit location, maintaining proper location-based access control and organizational structure.
 *
 * @param admissionLocation - The location where the patient is being admitted
 * @param visitLocation - The location associated with the patient's current visit
 * @returns `true` if the admission location is a descendant of (or equal to) the visit location, `false` otherwise
 *
 * @example
 * ```typescript
 * // Scenario: Visit is at "Main Hospital", admission is at "Ward A" (child of Main Hospital)
 * const isValid = isLocationDescendantOf(wardALocation, mainHospitalLocation);
 * // Returns: true
 *
 * // Scenario: Visit is at "Ward A", admission is at "Main Hospital" (parent)
 * const isValid = isLocationDescendantOf(mainHospitalLocation, wardALocation);
 * // Returns: false
 * ```
 *
 * @remarks
 * Edge cases handled:
 * - Returns `false` if either location is null or undefined
 * - Returns `true` if both locations have the same UUID (same location)
 * - Prevents infinite loops from circular references by tracking visited locations
 * - Returns `false` if a location has no parent (reached root without finding visit location)
 */
export function isLocationDescendantOf(
  admissionLocation: Location | null | undefined,
  visitLocation: Location | null | undefined,
): boolean {
  // Handle null or undefined locations
  if (!admissionLocation || !visitLocation) {
    return false;
  }

  // If the admission location is the same as the visit location, it's valid
  if (admissionLocation.uuid === visitLocation.uuid) {
    return true;
  }

  // Track visited locations to prevent infinite loops from circular references
  const visitedUuids = new Set<string>();
  visitedUuids.add(admissionLocation.uuid);

  // Walk up the location hierarchy from admission location to root
  let currentLocation: Location | null | undefined = admissionLocation;

  while (currentLocation?.parentLocation) {
    const parentUuid = currentLocation.parentLocation.uuid;

    // Check if we've found the visit location
    if (parentUuid === visitLocation.uuid) {
      return true;
    }

    // Detect circular reference
    if (visitedUuids.has(parentUuid)) {
      console.warn(`Circular reference detected in location hierarchy at location UUID: ${parentUuid}`);
      return false;
    }

    // Move to parent location
    visitedUuids.add(parentUuid);
    currentLocation = currentLocation.parentLocation;
  }

  // Reached root without finding the visit location
  return false;
}

/**
 * Generates a hierarchical path of location names from a given location up to the root location.
 *
 * This utility function is primarily useful for debugging location hierarchies and displaying
 * the full location path to users. It traverses from the given location upward through all
 * parent locations until it reaches the root (a location with no parent).
 *
 * @param location - The starting location from which to build the hierarchy path
 * @returns An array of location names ordered from the given location to the root location.
 *          Returns an empty array if the location is null or undefined.
 *
 * @example
 * ```typescript
 * // Scenario: Location hierarchy is Room 101 -> Ward A -> Main Hospital
 * const path = getLocationHierarchyPath(room101Location);
 * // Returns: ["Room 101", "Ward A", "Main Hospital"]
 *
 * // For debugging admission validation failures
 * const admissionPath = getLocationHierarchyPath(admissionLocation);
 * const visitPath = getLocationHierarchyPath(visitLocation);
 * console.log(`Admission path: ${admissionPath.join(' > ')}`);
 * console.log(`Visit path: ${visitPath.join(' > ')}`);
 * ```
 *
 * @remarks
 * Edge cases handled:
 * - Returns an empty array if the location is null or undefined
 * - Prevents infinite loops from circular references by limiting traversal to 100 locations
 * - Uses display name if available, falls back to name property
 */
export function getLocationHierarchyPath(location: Location | null | undefined): string[] {
  if (!location) {
    return [];
  }

  const path: string[] = [];
  let currentLocation: Location | null | undefined = location;
  const maxDepth = 100; // Prevent infinite loops from circular references
  let depth = 0;

  while (currentLocation && depth < maxDepth) {
    // Use display name if available, otherwise use name
    const locationName = currentLocation.display || currentLocation.name || currentLocation.uuid;
    path.push(locationName);

    // Move to parent location
    currentLocation = currentLocation.parentLocation;
    depth++;
  }

  if (depth >= maxDepth) {
    console.warn(
      `Maximum depth reached while traversing location hierarchy. Possible circular reference starting at: ${location.display || location.name}`,
    );
  }

  return path;
}
