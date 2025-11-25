import { type Location } from '@openmrs/esm-framework';
import { isLocationDescendantOf, getLocationHierarchyPath } from './location-utils';

describe('Location Utilities', () => {
  // Mock location data
  const createMockLocation = (
    uuid: string,
    name: string,
    display: string,
    parentLocation?: Location | null,
  ): Location =>
    ({
      uuid,
      name,
      display,
      parentLocation,
    }) as Location;

  describe('isLocationDescendantOf', () => {
    it('should return true when admission location is the same as visit location', () => {
      const location = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      expect(isLocationDescendantOf(location, location)).toBe(true);
    });

    it('should return true when admission location is a direct child of visit location', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const wardA = createMockLocation('loc-2', 'Ward A', 'Ward A', mainHospital);

      expect(isLocationDescendantOf(wardA, mainHospital)).toBe(true);
    });

    it('should return true when admission location is a grandchild (2 levels deep) of visit location', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const building1 = createMockLocation('loc-2', 'Building 1', 'Building 1', mainHospital);
      const ward101 = createMockLocation('loc-3', 'Ward 101', 'Ward 101', building1);

      expect(isLocationDescendantOf(ward101, mainHospital)).toBe(true);
    });

    it('should return true when admission location is a nested descendant (3+ levels deep) of visit location', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const building1 = createMockLocation('loc-2', 'Building 1', 'Building 1', mainHospital);
      const floor2 = createMockLocation('loc-3', 'Floor 2', 'Floor 2', building1);
      const wardA = createMockLocation('loc-4', 'Ward A', 'Ward A', floor2);
      const room101 = createMockLocation('loc-5', 'Room 101', 'Room 101', wardA);

      expect(isLocationDescendantOf(room101, mainHospital)).toBe(true);
    });

    it('should return false when admission location is a sibling of visit location', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const wardA = createMockLocation('loc-2', 'Ward A', 'Ward A', mainHospital);
      const wardB = createMockLocation('loc-3', 'Ward B', 'Ward B', mainHospital);

      expect(isLocationDescendantOf(wardB, wardA)).toBe(false);
    });

    it('should return false when admission location is a parent of visit location', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const wardA = createMockLocation('loc-2', 'Ward A', 'Ward A', mainHospital);

      expect(isLocationDescendantOf(mainHospital, wardA)).toBe(false);
    });

    it('should return false when admission location is in a different hierarchy (no relationship)', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const wardA = createMockLocation('loc-2', 'Ward A', 'Ward A', mainHospital);

      const clinicBuilding = createMockLocation('loc-3', 'Clinic Building', 'Clinic Building');
      const clinicRoom = createMockLocation('loc-4', 'Clinic Room 1', 'Clinic Room 1', clinicBuilding);

      expect(isLocationDescendantOf(clinicRoom, wardA)).toBe(false);
    });

    it('should return false when admission location is null', () => {
      const visitLocation = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      expect(isLocationDescendantOf(null, visitLocation)).toBe(false);
    });

    it('should return false when visit location is null', () => {
      const admissionLocation = createMockLocation('loc-1', 'Ward A', 'Ward A');
      expect(isLocationDescendantOf(admissionLocation, null)).toBe(false);
    });

    it('should return false when both locations are null', () => {
      expect(isLocationDescendantOf(null, null)).toBe(false);
    });

    it('should return false when admission location is undefined', () => {
      const visitLocation = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      expect(isLocationDescendantOf(undefined, visitLocation)).toBe(false);
    });

    it('should return false when visit location is undefined', () => {
      const admissionLocation = createMockLocation('loc-1', 'Ward A', 'Ward A');
      expect(isLocationDescendantOf(admissionLocation, undefined)).toBe(false);
    });

    it('should return false when both locations are undefined', () => {
      expect(isLocationDescendantOf(undefined, undefined)).toBe(false);
    });

    it('should return false when location has no parent relationship', () => {
      const location1 = createMockLocation('loc-1', 'Location 1', 'Location 1');
      const location2 = createMockLocation('loc-2', 'Location 2', 'Location 2');

      expect(isLocationDescendantOf(location1, location2)).toBe(false);
    });

    it('should return false when admission location has undefined parentLocation property', () => {
      const visitLocation = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const admissionLocation = {
        uuid: 'loc-2',
        name: 'Ward A',
        display: 'Ward A',
        parentLocation: undefined,
      } as Location;

      expect(isLocationDescendantOf(admissionLocation, visitLocation)).toBe(false);
    });

    it('should handle circular references without infinite loop', () => {
      const location1 = createMockLocation('loc-1', 'Location 1', 'Location 1');
      const location2 = createMockLocation('loc-2', 'Location 2', 'Location 2');
      const location3 = createMockLocation('loc-3', 'Location 3', 'Location 3');

      // Create circular reference: location1 -> location2 -> location3 -> location1
      (location1 as any).parentLocation = location2;
      (location2 as any).parentLocation = location3;
      (location3 as any).parentLocation = location1;

      const visitLocation = createMockLocation('visit-loc', 'Visit Location', 'Visit Location');

      // Should detect circular reference and return false
      expect(isLocationDescendantOf(location1, visitLocation)).toBe(false);
    });

    it('should detect circular reference and log warning', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const location1 = createMockLocation('loc-1', 'Location 1', 'Location 1');
      const location2 = createMockLocation('loc-2', 'Location 2', 'Location 2');
      const location3 = createMockLocation('loc-3', 'Location 3', 'Location 3');

      // Create circular reference: location1 -> location2 -> location3 -> location1
      (location1 as any).parentLocation = location2;
      (location2 as any).parentLocation = location3;
      (location3 as any).parentLocation = location1;

      const visitLocation = createMockLocation('visit-loc', 'Visit Location', 'Visit Location');

      isLocationDescendantOf(location1, visitLocation);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Circular reference detected in location hierarchy'),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getLocationHierarchyPath', () => {
    it('should return path with single location when location has no parent', () => {
      const location = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const path = getLocationHierarchyPath(location);

      expect(path).toEqual(['Main Hospital']);
      expect(path.length).toBe(1);
    });

    it('should return complete path for nested location hierarchy', () => {
      const mainHospital = createMockLocation('loc-1', 'Main Hospital', 'Main Hospital');
      const wardA = createMockLocation('loc-2', 'Ward A', 'Ward A', mainHospital);
      const room101 = createMockLocation('loc-3', 'Room 101', 'Room 101', wardA);

      const path = getLocationHierarchyPath(room101);

      expect(path).toEqual(['Room 101', 'Ward A', 'Main Hospital']);
      expect(path.length).toBe(3);
    });

    it('should return path ordered from child to root', () => {
      const root = createMockLocation('loc-1', 'Root', 'Root');
      const parent = createMockLocation('loc-2', 'Parent', 'Parent', root);
      const child = createMockLocation('loc-3', 'Child', 'Child', parent);

      const path = getLocationHierarchyPath(child);

      expect(path[0]).toBe('Child');
      expect(path[1]).toBe('Parent');
      expect(path[2]).toBe('Root');
    });

    it('should return empty array when location is null', () => {
      const path = getLocationHierarchyPath(null);

      expect(path).toEqual([]);
      expect(path.length).toBe(0);
    });

    it('should return empty array when location is undefined', () => {
      const path = getLocationHierarchyPath(undefined);

      expect(path).toEqual([]);
      expect(path.length).toBe(0);
    });

    it('should use display name over name property', () => {
      const location = createMockLocation('loc-1', 'hospital', 'Main Hospital');
      const path = getLocationHierarchyPath(location);

      expect(path).toEqual(['Main Hospital']);
      expect(path).not.toContain('hospital');
    });

    it('should fallback to name when display is empty string', () => {
      const location = {
        uuid: 'loc-1',
        name: 'Hospital Name',
        display: '',
      } as Location;

      const path = getLocationHierarchyPath(location);

      expect(path).toContain('Hospital Name');
      expect(path).toEqual(['Hospital Name']);
    });

    it('should fallback to name when display is not available', () => {
      const location = {
        uuid: 'loc-1',
        name: 'Hospital Name',
        display: null,
      } as Location;

      const path = getLocationHierarchyPath(location);

      expect(path).toContain('Hospital Name');
    });

    it('should fallback to uuid when both display and name are empty', () => {
      const location = {
        uuid: 'loc-1',
        name: '',
        display: '',
      } as Location;

      const path = getLocationHierarchyPath(location);

      expect(path).toEqual(['loc-1']);
    });

    it('should fallback to uuid when both display and name are null', () => {
      const location = {
        uuid: 'loc-123',
        name: null,
        display: null,
      } as Location;

      const path = getLocationHierarchyPath(location);

      expect(path).toEqual(['loc-123']);
    });

    it('should handle circular references without infinite loop', () => {
      const location1 = createMockLocation('loc-1', 'Location 1', 'Location 1');
      const location2 = createMockLocation('loc-2', 'Location 2', 'Location 2', location1);
      // Create circular reference
      (location1 as any).parentLocation = location2;

      const path = getLocationHierarchyPath(location1);

      // Should stop after hitting max depth
      expect(path.length).toBeLessThanOrEqual(100);
      expect(path.length).toBeGreaterThan(0);
    });

    it('should log warning when circular reference is detected', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const location1 = createMockLocation('loc-1', 'Location 1', 'Location 1');
      const location2 = createMockLocation('loc-2', 'Location 2', 'Location 2', location1);
      // Create circular reference
      (location1 as any).parentLocation = location2;

      getLocationHierarchyPath(location1);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Maximum depth reached while traversing location hierarchy'),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should return path for deeply nested hierarchy', () => {
      let currentLocation = createMockLocation('loc-root', 'Root', 'Root');

      // Create a hierarchy of 10 levels
      for (let i = 1; i <= 10; i++) {
        currentLocation = createMockLocation(`loc-${i}`, `Level ${i}`, `Level ${i}`, currentLocation);
      }

      const path = getLocationHierarchyPath(currentLocation);

      expect(path.length).toBe(11); // 10 levels + root
      expect(path[0]).toBe('Level 10');
      expect(path[10]).toBe('Root');
    });

    it('should handle location with parentLocation set to null', () => {
      const location = {
        uuid: 'loc-1',
        name: 'Root Location',
        display: 'Root Location',
        parentLocation: null,
      } as Location;

      const path = getLocationHierarchyPath(location);

      expect(path).toEqual(['Root Location']);
    });

    it('should handle location with parentLocation set to undefined', () => {
      const location = {
        uuid: 'loc-1',
        name: 'Root Location',
        display: 'Root Location',
        parentLocation: undefined,
      } as Location;

      const path = getLocationHierarchyPath(location);

      expect(path).toEqual(['Root Location']);
    });

    it('should handle mixed hierarchy with some locations having display and others only name', () => {
      const root = {
        uuid: 'loc-1',
        name: 'Root',
        display: '',
      } as Location;
      const parent = createMockLocation('loc-2', 'parent-name', 'Parent Display', root);
      const child = {
        uuid: 'loc-3',
        name: 'Child',
        display: '',
        parentLocation: parent,
      } as Location;

      const path = getLocationHierarchyPath(child);

      expect(path).toEqual(['Child', 'Parent Display', 'Root']);
    });
  });
});
