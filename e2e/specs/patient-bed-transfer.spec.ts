import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType } from '../commands/types';
import { test } from '../core';
import {
  deleteBed,
  dischargePatientFromBed,
  generateBedType,
  generateRandomBed,
  generateWardAdmissionRequest,
  retireBedType,
  startVisit,
  waitForAdmissionRequestToBeProcessed,
} from '../commands';
import { WardPage } from '../pages';

// The other ward specs reuse one server session. Changing wards must not change their session location.
test.use({ storageState: { cookies: [], origins: [] } });

const sourceWardUuid = process.env.E2E_WARD_LOCATION_UUID;
const destinationWardUuid = process.env.E2E_WARD1_LOCATION_UUID;
let sourceBed: Bed | undefined;
let destinationBed: Bed | undefined;
let bedType: BedType | undefined;
let visit: Visit | undefined;
let destinationWardName: string;

async function setSessionLocation(page: Page, locationUuid: string) {
  const token = Buffer.from(`${process.env.E2E_USER_ADMIN_USERNAME}:${process.env.E2E_USER_ADMIN_PASSWORD}`).toString(
    'base64',
  );
  const response = await page.request.post(`${process.env.E2E_BASE_URL}/ws/rest/v1/session`, {
    headers: { Authorization: `Basic ${token}` },
    data: { sessionLocation: locationUuid, locale: 'en' },
  });
  expect(response.ok()).toBeTruthy();
}

async function getTransferState(api: APIRequestContext, patientUuid: string) {
  const responses = await Promise.all([
    api.get(
      `emrapi/inpatient/admission?patients=${patientUuid}&v=custom:(currentInpatientLocation:(uuid),visit:(uuid))`,
    ),
    api.get(
      `emrapi/inpatient/request?patients=${patientUuid}&dispositionType=TRANSFER&v=custom:(dispositionLocation:(uuid))`,
    ),
    api.get(`beds?patientUuid=${patientUuid}`),
  ]);
  responses.forEach((response) => expect(response.ok()).toBeTruthy());
  const admissions: { results: Array<{ currentInpatientLocation: { uuid: string }; visit: { uuid: string } }> } =
    await responses[0].json();
  const requests: { results: Array<{ dispositionLocation: { uuid: string } }> } = await responses[1].json();
  const beds: { results: Array<{ bedId: number }> } = await responses[2].json();
  return {
    admissions: admissions.results.map((admission) => ({
      location: admission.currentInpatientLocation.uuid,
      visit: admission.visit.uuid,
    })),
    pendingDestinations: requests.results.map((request) => request.dispositionLocation.uuid),
    bedIds: beds.results.map((bed) => bed.bedId),
  };
}

test.beforeEach(async ({ api, patient, emrConfiguration }) => {
  sourceBed = destinationBed = bedType = visit = undefined;
  expect(sourceWardUuid).toBeTruthy();
  expect(destinationWardUuid).toBeTruthy();
  expect(destinationWardUuid).not.toBe(sourceWardUuid);

  const sourceResponse = await api.get(`location/${sourceWardUuid}?v=custom:(parentLocation:(uuid))`);
  const destinationResponse = await api.get(`location/${destinationWardUuid}?v=custom:(name)`);
  expect(sourceResponse.ok()).toBeTruthy();
  expect(destinationResponse.ok()).toBeTruthy();
  const source: { parentLocation: { uuid: string } } = await sourceResponse.json();
  const destination: { name: string } = await destinationResponse.json();
  destinationWardName = destination.name;
  expect(source.parentLocation?.uuid).toBeTruthy();

  bedType = await generateBedType(api);
  sourceBed = await generateRandomBed(api, bedType);
  destinationBed = await generateRandomBed(api, bedType, destinationWardUuid);
  // Transfer destinations are restricted to locations within the visit's facility.
  visit = await startVisit(api, patient.uuid, source.parentLocation.uuid);
  await generateWardAdmissionRequest(api, emrConfiguration, patient.uuid);
});

test.afterEach(async ({ api, patient }) => {
  const cleanupErrors: unknown[] = [];
  const cleanUp = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (error) {
      cleanupErrors.push(error);
    }
  };

  if (sourceBed) {
    await cleanUp(() => dischargePatientFromBed(api, sourceBed.id, patient.uuid));
  }
  if (bedType) {
    await cleanUp(async () => {
      // Resolve persisted UUIDs and restrict the query to this test's beds, avoiding ward-wide pagination.
      const response = await api.get(`bed?bedType=${bedType.name}`);
      expect(response.ok()).toBeTruthy();
      const data: { results: Bed[] } = await response.json();
      for (const bed of data.results) {
        await cleanUp(() => deleteBed(api, bed));
      }
    });
    await cleanUp(() => retireBedType(api, bedType.uuid, 'Retired during automated testing'));
  }
  if (visit) {
    await cleanUp(async () => {
      const response = await api.delete(`visit/${visit.uuid}?reason=Automated%20ward%20transfer%20test`);
      expect(response.ok()).toBeTruthy();
    });
  }
  expect(cleanupErrors).toEqual([]);
});

test('Transfer an admitted patient to a bed in another ward', async ({ page, api, patient }) => {
  const wardPage = new WardPage(page);
  const fullName = patient.person.display;

  await test.step('Given the patient is admitted to the source ward and bed', async () => {
    await setSessionLocation(page, sourceWardUuid);
    await wardPage.goTo();
    await waitForAdmissionRequestToBeProcessed(api, page, patient.uuid, sourceWardUuid);
    await wardPage.clickManageAdmissionRequests();
    await wardPage.clickAdmitPatientButton(fullName);
    await wardPage.selectBedForAdmission(sourceBed.bedNumber);
    await wardPage.confirmAdmission();
    await wardPage.expectAdmissionSuccessNotification(fullName, sourceBed.bedNumber);
  });

  await test.step('When I request a transfer to the destination ward', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout -- EMR API treats same-second ADT encounters as fulfilling the request.
    await page.waitForTimeout(1000);
    await wardPage.clickPatientCard(fullName);
    await wardPage.transferButton().click();
    await wardPage.searchLocationInput().fill(destinationWardName);
    await page.locator('label.cds--radio-button__label').filter({ hasText: destinationWardName }).click();
    await wardPage.saveButton().click();
    await expect(page.getByText(`Transfer request created for ${fullName}`, { exact: true })).toBeVisible();
  });

  await test.step('Then the patient remains in the source bed while the transfer is pending', async () => {
    await expect
      .poll(() => getTransferState(api, patient.uuid))
      .toEqual({
        admissions: [{ location: sourceWardUuid, visit: visit.uuid }],
        pendingDestinations: [destinationWardUuid],
        bedIds: [sourceBed.id],
      });
    await expect(
      page
        .locator('[class*="wardPatientCard"]')
        .filter({ hasText: fullName })
        .getByText(`Transfer to ${destinationWardName}`),
    ).toBeVisible();
  });

  await test.step('When I accept the transfer into the destination bed', async () => {
    await setSessionLocation(page, destinationWardUuid);
    await wardPage.goTo();
    await waitForAdmissionRequestToBeProcessed(api, page, patient.uuid, destinationWardUuid);
    await wardPage.clickManageAdmissionRequests();
    await wardPage.clickTransferPatientButton(fullName);
    await wardPage.selectBedForAdmission(destinationBed.bedNumber);
    await wardPage.confirmAdmission();
    await wardPage.expectAdmissionSuccessNotification(fullName, destinationBed.bedNumber);
  });

  await test.step('Then the transfer is complete and persists after reload', async () => {
    await expect
      .poll(() => getTransferState(api, patient.uuid))
      .toEqual({
        admissions: [{ location: destinationWardUuid, visit: visit.uuid }],
        pendingDestinations: [],
        bedIds: [destinationBed.id],
      });
    const visitResponse = await api.get(`visit/${visit.uuid}`);
    expect(visitResponse.ok()).toBeTruthy();
    expect(await visitResponse.json()).toMatchObject({ uuid: visit.uuid, stopDatetime: null });

    await page.reload();
    await expect(
      page
        .locator('[class*="wardPatientCard"]')
        .filter({ hasText: fullName })
        .getByText(destinationBed.bedNumber, { exact: true }),
    ).toBeVisible();
    await setSessionLocation(page, sourceWardUuid);
    await wardPage.goTo();
    await expect(
      page.locator(`[id="bed-${sourceBed.bedNumber}"]`).getByText('Empty bed', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('[class*="wardPatientCard"]').filter({ hasText: fullName })).toHaveCount(0);
  });
});
