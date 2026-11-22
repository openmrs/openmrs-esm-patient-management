import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch } from '@openmrs/esm-framework';
import {
  findRealPatientListsWithoutPatient,
  getAllPatientLists,
  getPatientListIdsForPatient,
} from './patient-list.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const patientUuid = 'patient-uuid';
const systemListCohortTypeUuid = 'system-list-cohort-type-uuid';

// The REST API returns 50 results per page by default, so 51 lists span two pages.
const lists = Array.from({ length: 51 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return { uuid: `list-${number}`, name: `Test list ${number}`, description: '', size: 0, attributes: [] };
});

// The server builds `next` links from its own host, which differs from the browser's behind a proxy.
const nextLink = (path: string) => [
  { rel: 'next', uri: `https://backend.example.org/openmrs/ws/rest/v1/cohortm/${path}` },
];

function respondWith(data: unknown) {
  return Promise.resolve({ data } as Awaited<ReturnType<typeof openmrsFetch>>);
}

function mockServer({
  memberships = [] as Array<string>,
  failListsPage2 = false,
}: { memberships?: Array<string>; failListsPage2?: boolean } = {}) {
  const membershipRefs = memberships.map((uuid) => ({ uuid: `member-${uuid}`, cohort: { uuid } }));

  mockOpenmrsFetch.mockImplementation((url: string) => {
    if (url.includes('/cohortm/cohort?')) {
      if (!url.includes('startIndex=50')) {
        return respondWith({ results: lists.slice(0, 50), links: nextLink('cohort?v=default&startIndex=50') });
      }
      if (failListsPage2) {
        return Promise.reject(new Error('Second page failed'));
      }
      return respondWith({ results: lists.slice(50), links: [] });
    }

    if (url.includes('/cohortm/cohortmember?')) {
      if (!url.includes('startIndex=50')) {
        return respondWith({
          results: membershipRefs.slice(0, 50),
          links: membershipRefs.length > 50 ? nextLink(`cohortmember?patient=${patientUuid}&startIndex=50`) : [],
        });
      }
      return respondWith({ results: membershipRefs.slice(50), links: [] });
    }

    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
}

describe('patient list resource', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  describe('getAllPatientLists', () => {
    it('loads every page of patient lists', async () => {
      mockServer();

      const result = await getAllPatientLists({}, systemListCohortTypeUuid);

      expect(result).toHaveLength(51);
      expect(result.at(-1)).toEqual(expect.objectContaining({ id: 'list-51', display: 'Test list 51' }));
    });

    it('requests later pages from the current origin', async () => {
      mockServer();

      await getAllPatientLists({}, systemListCohortTypeUuid);

      const secondPageUrl = new URL(mockOpenmrsFetch.mock.calls[1][0] as string);
      expect(secondPageUrl.host).toBe(window.location.host);
      expect(secondPageUrl.protocol).toBe(window.location.protocol);
      expect(secondPageUrl.searchParams.get('startIndex')).toBe('50');
    });

    it('rejects instead of returning a partial list when a later page fails', async () => {
      mockServer({ failListsPage2: true });

      await expect(getAllPatientLists({}, systemListCohortTypeUuid)).rejects.toThrow('Second page failed');
    });

    it('throws the error returned in the response body', async () => {
      const error = { message: 'Server error' };
      mockOpenmrsFetch.mockImplementation(() => respondWith({ results: [], error }));

      await expect(getAllPatientLists({}, systemListCohortTypeUuid)).rejects.toBe(error);
    });
  });

  describe('getPatientListIdsForPatient', () => {
    it("loads every page of the patient's list memberships", async () => {
      mockServer({ memberships: lists.map((list) => list.uuid) });

      const result = await getPatientListIdsForPatient(patientUuid);

      expect(result).toHaveLength(51);
      expect(result).toContain('list-51');
    });
  });

  describe('findRealPatientListsWithoutPatient', () => {
    it('offers lists beyond the first 50 in the Add patient to list modal', async () => {
      mockServer();

      const result = await findRealPatientListsWithoutPatient(patientUuid, systemListCohortTypeUuid);

      expect(result.map((list) => list.displayName)).toContain('Test list 51');
    });

    it('checks lists the patient belongs to even when the memberships span more than one page', async () => {
      mockServer({ memberships: lists.map((list) => list.uuid) });

      const result = await findRealPatientListsWithoutPatient(patientUuid, systemListCohortTypeUuid);

      expect(result.find((list) => list.id === 'list-51')?.checked).toBe(true);
    });
  });
});
